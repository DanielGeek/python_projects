from dotenv import load_dotenv
from openai import OpenAI
import json
import os
import requests
from pypdf import PdfReader
import gradio as gr
from datetime import datetime
import time
import uuid


load_dotenv(override=True)

# Constants
PUSHOVER_API_URL = "https://api.pushover.net/1/messages.json"

# Free Gemini models ordered from best to simplest quality
# Source: https://ai.google.dev/pricing
FREE_MODELS = [
    "gemini-2.5-flash",         # Best free model - hybrid reasoning, 1M context
    "gemini-2.0-flash",         # Multimodal, 1M context, agent-ready
    "gemini-2.5-flash-lite",    # Smaller, cost-effective, high throughput
    "gemini-2.0-flash-lite",    # Smallest, fastest, most economical
]

# Model + API Key rotation system for Gemini
class APIKeyModelManager:
    """Manages API key and model rotation with exponential backoff."""
    
    DAILY_LIMIT_PER_KEY = 20  # RPD (Requests Per Day)
    RESET_INTERVAL_SECONDS = 86400  # 24 hours
    INITIAL_BACKOFF_SECONDS = 60  # 1 minute
    MAX_BACKOFF_SECONDS = 1800  # 30 minutes
    
    def __init__(self):
        self.keys = self._load_api_keys()
        self.models = FREE_MODELS
        self.current_key_index = 0
        self.current_model_index = 0
        
        # Track exhausted combinations: {(key_index, model_index): timestamp}
        self.exhausted_combinations = {}
        
        # Track usage per model+key combination: {(key_index, model_index): count}
        self.usage_per_combination = {}
        
        # Track usage per key (aggregate across all models)
        self.request_counts = dict.fromkeys(self.keys, 0)
        self.daily_limits = dict.fromkeys(self.keys, self.DAILY_LIMIT_PER_KEY)
        self.last_reset = dict.fromkeys(self.keys, time.time())
        
        # Exponential backoff state
        self.consecutive_failures = 0
        self.last_failure_time = None
        self.exhausted_notified = False
    
    def _load_api_keys(self) -> list:
        """Load API keys from environment variables."""
        keys = [
            os.getenv("GOOGLE_API_KEY"),
            os.getenv("GOOGLE_API_KEY2"),
            os.getenv("GOOGLE_API_KEY3"),
            os.getenv("GOOGLE_API_KEY4")
        ]
        keys = [key for key in keys if key]
        
        if not keys:
            raise ValueError("No API keys found. Please set GOOGLE_API_KEY environment variables.")
        
        return keys
        
    def get_current_model(self):
        """Get current model name"""
        return self.models[self.current_model_index]
    
    def get_current_key(self):
        """Get current API key"""
        return self.keys[self.current_key_index]
    
    def _check_and_reset_quotas(self):
        """Check if 24 hours have passed and reset quotas"""
        current_time = time.time()
        reset_occurred = False
        
        for key in self.keys:
            if current_time - self.last_reset[key] >= 86400:  # 24 hours
                self.request_counts[key] = 0
                self.last_reset[key] = current_time
                reset_occurred = True
        
        # Clear exhausted combinations older than 24 hours
        expired = [combo for combo, ts in self.exhausted_combinations.items() 
                   if current_time - ts >= 86400]
        for combo in expired:
            del self.exhausted_combinations[combo]
        
        if reset_occurred or expired:
            self.exhausted_notified = False
            print("🔄 24 hours passed - API quotas have been reset!", flush=True)
            
        return reset_occurred
    
    def is_combination_exhausted(self, key_idx, model_idx):
        """Check if a key+model combination is exhausted"""
        return (key_idx, model_idx) in self.exhausted_combinations
    
    def mark_combination_exhausted(self, key_idx, model_idx):
        """Mark a key+model combination as exhausted"""
        self.exhausted_combinations[(key_idx, model_idx)] = time.time()
        print(f"⚠️ Marked Key {key_idx + 1} + {self.models[model_idx]} as exhausted", flush=True)
    
    def find_working_combination(self):
        """Find a working key+model combination, rotating through all options.
        
        Rotation order: keys first, then models
        Example: model1+key1 → model1+key2 → model1+key3 → model1+key4 → model2+key1 → ...
        """
        self._check_and_reset_quotas()
        
        total_combinations = len(self.keys) * len(self.models)
        attempts = 0
        
        while attempts < total_combinations:
            if not self.is_combination_exhausted(self.current_key_index, self.current_model_index):
                return True  # Found a working combination
            
            # Try next KEY first (rotate through all keys with same model)
            self.current_key_index = (self.current_key_index + 1) % len(self.keys)
            
            # If we've cycled through all keys, try next model
            if self.current_key_index == 0:
                self.current_model_index = (self.current_model_index + 1) % len(self.models)
            
            attempts += 1
        
        # All combinations exhausted
        if not self.exhausted_notified:
            self._notify_all_exhausted()
            self.exhausted_notified = True
        
        return False
    
    def rotate_to_next(self) -> None:
        """Rotate to next key first, then model if all keys exhausted."""
        old_model = self.get_current_model()
        old_key_idx = self.current_key_index
        
        # First try next KEY with same model
        self.current_key_index = (self.current_key_index + 1) % len(self.keys)
        
        # If we've cycled through all keys, move to next model and reset to first key
        if self.current_key_index == 0:
            self.current_model_index = (self.current_model_index + 1) % len(self.models)
            
            # If we've cycled back to first model, we've tried all combinations
            if self.current_model_index == 0:
                self.consecutive_failures += 1
                self.last_failure_time = time.time()
                print(f"⚠️ All {len(self.keys) * len(self.models)} combinations exhausted. Failure #{self.consecutive_failures}", flush=True)
            else:
                print(f"🔑 All keys exhausted for {old_model}, rotating to {self.get_current_model()}", flush=True)
        
        if old_model == self.get_current_model():
            print(f"🔄 Rotating: Key {old_key_idx + 1} → Key {self.current_key_index + 1} (keeping {old_model})", flush=True)
        else:
            print(f"🔄 Rotating: {old_model} → {self.get_current_model()} (back to Key 1)", flush=True)
    
    def reset_to_first_combination(self) -> None:
        """Reset to the first model and key combination."""
        self.current_key_index = 0
        self.current_model_index = 0
        print(f"🔄 Reset to first combination: {self.get_current_model()} + Key 1", flush=True)
    
    def get_backoff_time(self) -> int:
        """Calculate exponential backoff time in seconds."""
        if self.consecutive_failures == 0:
            return 0
        
        backoff = self.INITIAL_BACKOFF_SECONDS * (2 ** (self.consecutive_failures - 1))
        return min(backoff, self.MAX_BACKOFF_SECONDS)
    
    def should_wait_before_retry(self) -> tuple[bool, int]:
        """Check if we should wait before retrying.
        
        Returns:
            tuple: (should_wait, seconds_to_wait)
        """
        if self.last_failure_time is None:
            return False, 0
        
        backoff_time = self.get_backoff_time()
        elapsed = time.time() - self.last_failure_time
        remaining = backoff_time - elapsed
        
        if remaining > 0:
            return True, int(remaining)
        
        return False, 0
    
    def reset_backoff(self) -> None:
        """Reset the exponential backoff counter after success."""
        if self.consecutive_failures > 0:
            print(f"✅ Request successful! Resetting backoff (was at {self.consecutive_failures} failures)", flush=True)
        self.consecutive_failures = 0
        self.last_failure_time = None
    
    def increment_usage(self):
        """Increment usage counter for current key and model combination"""
        key = self.get_current_key()
        if key in self.request_counts:
            self.request_counts[key] += 1
        
        # Track per-combination usage
        combo = (self.current_key_index, self.current_model_index)
        if combo not in self.usage_per_combination:
            self.usage_per_combination[combo] = 0
        self.usage_per_combination[combo] += 1
    
    def get_usage_stats(self):
        """Get current usage statistics showing per-model usage"""
        stats = [f"🤖 Current Model: {self.get_current_model()}"]
        stats.append(f"🔑 Current Key: {self.current_key_index + 1}\n")
        
        current_time = time.time()
        current_model_idx = self.current_model_index
        
        for i, key in enumerate(self.keys):
            time_until_reset = 86400 - (current_time - self.last_reset[key])
            hours = int(time_until_reset // 3600)
            minutes = int((time_until_reset % 3600) // 60)
            
            # Check if current model is exhausted for this key
            is_current_model_exhausted = self.is_combination_exhausted(i, current_model_idx)
            
            # Count total exhausted models for this key
            exhausted_models = sum(1 for m_idx in range(len(self.models)) 
                                   if self.is_combination_exhausted(i, m_idx))
            
            # Get actual usage for current model+key combination
            combo = (i, current_model_idx)
            if is_current_model_exhausted:
                # If exhausted, show 20/20
                display_count = self.daily_limits[key]
            else:
                # Show actual usage for this model+key combo
                display_count = self.usage_per_combination.get(combo, 0)
            
            status = "✅" if exhausted_models == 0 else f"⚠️ ({exhausted_models}/{len(self.models)} models exhausted)"
            reset_info = f" (resets in {hours}h {minutes}m)" if exhausted_models > 0 else ""
            stats.append(f"Key {i+1}: {display_count}/{self.daily_limits[key]} used {status}{reset_info}")
        
        return "\n".join(stats)
    
    def _notify_all_exhausted(self):
        """Send push notification when ALL keys + ALL models are exhausted"""
        try:
            current_time = time.time()
            earliest_reset = min(self.last_reset.values()) + 86400
            time_until_reset = earliest_reset - current_time
            hours = int(time_until_reset // 3600)
            minutes = int((time_until_reset % 3600) // 60)
            
            message = "🚨 ALL GEMINI QUOTAS EXHAUSTED!\n\n"
            message += f"Keys: {len(self.keys)} | Models: {len(self.models)}\n"
            message += f"Total combinations tried: {len(self.keys) * len(self.models)}\n\n"
            message += f"Next reset in: {hours}h {minutes}m\n\n"
            message += "The chatbot will retry automatically when quotas reset."
            
            requests.post(
                PUSHOVER_API_URL,
                data={
                    "token": os.getenv("PUSHOVER_TOKEN"),
                    "user": os.getenv("PUSHOVER_USER"),
                    "message": message,
                    "title": "🚨 Daniel Bot - All Quotas Exhausted",
                    "priority": 1
                }
            )
            print("\n🚨 ALERT: All API keys + models exhausted! Push notification sent.", flush=True)
            print(f"   Next reset in: {hours}h {minutes}m\n", flush=True)
        except Exception as e:
            print(f"❌ Failed to send exhaustion notification: {e}", flush=True)

api_manager = APIKeyModelManager()

def format_timestamp(unix_timestamp):
    """Convert Unix timestamp to human-readable format"""
    try:
        dt = datetime.fromtimestamp(int(unix_timestamp))
        return dt.strftime("%B %d, %Y at %I:%M %p")
    except (ValueError, TypeError):
        return "Unknown"

def push(text, session_id=None, user_context=None):
    """Send push notification with API stats and session tracking.
    
    Args:
        text: Main notification message
        session_id: Unique session identifier
        user_context: Additional user context (email, name, etc.)
        
    Returns:
        dict: Status, remaining notifications, and reset time
    """
    # Get API usage stats first
    api_stats = api_manager.get_usage_stats()
    
    # Build complete message with stats and tracking info
    full_message = text
    full_message += "\n\n" + "="*40
    full_message += "\n📍 Session Tracking:"
    full_message += f"\n• Session ID: {session_id[:8] if session_id else 'Unknown'}..."
    full_message += f"\n• Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    if user_context:
        full_message += "\n• User Context:"
        for key, value in user_context.items():
            full_message += f"\n  - {key}: {value}"
    
    full_message += f"\n\n🔑 Gemini API Usage:\n{api_stats}"
    
    # Send notification with stats
    response = requests.post(
        PUSHOVER_API_URL,
        data={
            "token": os.getenv("PUSHOVER_TOKEN"),
            "user": os.getenv("PUSHOVER_USER"),
            "message": full_message,
            "title": f"🤖 Daniel Bot [{session_id[:8] if session_id else 'N/A'}]"
        }
    )
    
    # Extract values from response headers
    remaining = response.headers.get('X-Limit-App-Remaining', 'Unknown')
    reset_time = response.headers.get('X-Limit-App-Reset', 'Unknown')
    reset_time_formatted = format_timestamp(reset_time)
    
    # Console output
    print("📱 Push notification sent!", flush=True)
    print(f"   Message: {text}", flush=True)
    print(f"   Remaining notifications: {remaining}", flush=True)
    print(f"   Limit resets at: {reset_time_formatted}", flush=True)
    print("   API Stats included: Yes", flush=True)
    
    return {
        "status": "sent",
        "remaining": remaining,
        "reset_time": reset_time_formatted
    }


def record_user_details(email, name="Name not provided", notes="not provided", session_id=None):
    user_context = {
        "email": email,
        "name": name,
        "notes": notes
    }
    push_info = push(
        f"📧 Contact Request\n\nName: {name}\nEmail: {email}\nNotes: {notes}",
        session_id=session_id,
        user_context=user_context
    )
    return {
        "recorded": "ok",
        "push_remaining": push_info.get("remaining", "Unknown"),
        "push_reset": push_info.get("reset_time", "Unknown")
    }

def record_unknown_question(question, session_id=None):
    push_info = push(
        f"❓ Unknown Question\n\nQuestion: {question}",
        session_id=session_id
    )
    return {
        "recorded": "ok",
        "push_remaining": push_info.get("remaining", "Unknown"),
        "push_reset": push_info.get("reset_time", "Unknown")
    }

def record_job_offer(company_name, position, salary, currency, work_type, duration="", additional_details="", session_id=None):
    """Record a job offer with compensation details and send push notification."""
    message = "💼 JOB OFFER RECEIVED!\n\n"
    message += f"Company: {company_name}\n"
    message += f"Position: {position}\n"
    message += f"Salary: {salary} {currency}\n"
    message += f"Type: {work_type}\n"
    
    if duration:
        message += f"Duration: {duration}\n"
    
    if additional_details:
        message += f"\nDetails: {additional_details}"
    
    offer_context = {
        "company": company_name,
        "position": position,
        "salary": f"{salary} {currency}",
        "type": work_type
    }
    
    push_info = push(message, session_id=session_id, user_context=offer_context)
    return {
        "recorded": "ok",
        "message": "Job offer recorded and Daniel has been notified!",
        "push_remaining": push_info.get("remaining", "Unknown"),
        "push_reset": push_info.get("reset_time", "Unknown")
    }

record_user_details_json = {
    "name": "record_user_details",
    "description": "Use this tool to record that a user is interested in being in touch and provided an email address",
    "parameters": {
        "type": "object",
        "properties": {
            "email": {
                "type": "string",
                "description": "The email address of this user"
            },
            "name": {
                "type": "string",
                "description": "The user's name, if they provided it"
            }
            ,
            "notes": {
                "type": "string",
                "description": "Any additional information about the conversation that's worth recording to give context"
            }
        },
        "required": ["email"],
        "additionalProperties": False
    }
}

record_unknown_question_json = {
    "name": "record_unknown_question",
    "description": "Always use this tool to record any question that couldn't be answered as you didn't know the answer",
    "parameters": {
        "type": "object",
        "properties": {
            "question": {
                "type": "string",
                "description": "The question that couldn't be answered"
            },
        },
        "required": ["question"],
        "additionalProperties": False
    }
}

record_job_offer_json = {
    "name": "record_job_offer",
    "description": "Use this tool when a user mentions a job offer, work opportunity, or compensation details. This includes mentions of salary, hourly rates, project budgets, or any form of payment for work.",
    "parameters": {
        "type": "object",
        "properties": {
            "company_name": {
                "type": "string",
                "description": "The name of the company or person making the offer. Use 'Unknown' if not provided."
            },
            "position": {
                "type": "string",
                "description": "The job title or role being offered (e.g., 'AI Engineer', 'Python Developer', 'Consultant')"
            },
            "salary": {
                "type": "string",
                "description": "The compensation amount (e.g., '5000', '80', '100k')"
            },
            "currency": {
                "type": "string",
                "description": "The currency (e.g., 'USD', 'EUR', 'GBP')"
            },
            "work_type": {
                "type": "string",
                "description": "Type of work (e.g., 'full-time', 'part-time', 'contract', 'freelance', 'per month', 'per hour', 'per project')"
            },
            "duration": {
                "type": "string",
                "description": "Duration or time commitment if mentioned (e.g., '6 months', 'ongoing', 'per month'). Leave empty if not specified."
            },
            "additional_details": {
                "type": "string",
                "description": "Any other relevant details about the offer (benefits, location, start date, etc.)"
            }
        },
        "required": ["company_name", "position", "salary", "currency", "work_type"],
        "additionalProperties": False
    }
}

tools = [{"type": "function", "function": record_user_details_json},
        {"type": "function", "function": record_unknown_question_json},
        {"type": "function", "function": record_job_offer_json}]


class DanielBot:

    def __init__(self):
        # Using Google Gemini via OpenAI-compatible API with key + model rotation
        if not api_manager.find_working_combination():
            raise RuntimeError("All API keys and models have reached their daily limits. Please try again later.")
        
        self.gemini = OpenAI(
            api_key=api_manager.get_current_key(), 
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        self.current_model = api_manager.get_current_model()
        
        # Generate unique session ID for this chat session
        self.session_id = str(uuid.uuid4())
        
        self.name = "Daniel Ángel Barreto"
        reader = PdfReader("me/linkedin.pdf")
        self.linkedin = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                self.linkedin += text
        with open("me/summary.txt", "r", encoding="utf-8") as f:
            self.summary = f.read()
        
        print(f"🚀 Bot initialized with {self.current_model} + Key {api_manager.current_key_index + 1}", flush=True)
    
    def refresh_client(self):
        """Refresh the Gemini client with new API key and/or model"""
        if not api_manager.find_working_combination():
            raise RuntimeError("All API keys and models have reached their daily limits. Please try again later.")
        
        self.gemini = OpenAI(
            api_key=api_manager.get_current_key(),
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        self.current_model = api_manager.get_current_model()


    def handle_tool_call(self, tool_calls):
        results = []
        for tool_call in tool_calls:
            tool_name = tool_call.function.name
            arguments = json.loads(tool_call.function.arguments)
            print(f"Tool called: {tool_name}", flush=True)
            
            # Add session_id to tool arguments
            arguments['session_id'] = self.session_id
            
            tool = globals().get(tool_name)
            result = tool(**arguments) if tool else {}
            results.append({"role": "tool","content": json.dumps(result),"tool_call_id": tool_call.id})
        return results
    
    def system_prompt(self):
        system_prompt = f"You are acting as {self.name}. You are answering questions on {self.name}'s website, \
particularly questions related to {self.name}'s career, background, skills and experience. \
Your responsibility is to represent {self.name} for interactions on the website as faithfully as possible. \
You are given a summary of {self.name}'s background and LinkedIn profile which you can use to answer questions. \
Be professional and engaging, as if talking to a potential client or future employer who came across the website. \
If you don't know the answer to any question, use your record_unknown_question tool to record the question that you couldn't answer, even if it's about something trivial or unrelated to career. \
If the user is engaging in discussion, try to steer them towards getting in touch via email; ask for their email and record it using your record_user_details tool. \
IMPORTANT: If the user mentions ANY job offer, work opportunity, salary, compensation, hourly rate, project budget, or payment for work, you MUST use the record_job_offer tool to capture all the details. This is critical for Daniel to not miss any opportunities."

        system_prompt += f"\n\n## Summary:\n{self.summary}\n\n## LinkedIn Profile:\n{self.linkedin}\n\n"
        system_prompt += f"With this context, please chat with the user, always staying in character as {self.name}."
        return system_prompt
    
    def _format_wait_time(self, seconds: int) -> str:
        """Format seconds into human-readable time.
        
        Args:
            seconds: Number of seconds to format
            
        Returns:
            Formatted string (e.g., "2 minutes", "1 minute 30 seconds")
        """
        if seconds < 60:
            return f"{seconds} seconds"
        
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        
        if remaining_seconds == 0:
            return f"{minutes} {'minute' if minutes == 1 else 'minutes'}"
        
        return f"{minutes} {'minute' if minutes == 1 else 'minutes'} {remaining_seconds} seconds"
    
    def _notify_waiting(self, wait_time: int) -> None:
        """Send push notification about waiting for quota reset.
        
        Args:
            wait_time: Seconds to wait before retry
        """
        try:
            message = "⏳ WAITING FOR QUOTA RESET\n\n"
            message += f"All {len(api_manager.keys)} keys × {len(api_manager.models)} models exhausted.\n\n"
            message += f"Retrying in: {self._format_wait_time(wait_time)}\n\n"
            message += f"Failure #{api_manager.consecutive_failures} - Exponential backoff active."
            
            requests.post(
                PUSHOVER_API_URL,
                data={
                    "token": os.getenv("PUSHOVER_TOKEN"),
                    "user": os.getenv("PUSHOVER_USER"),
                    "message": message,
                    "title": "⏳ Daniel Bot - Waiting for Retry",
                    "priority": 0  # Normal priority
                }
            )
        except Exception as e:
            print(f"❌ Failed to send wait notification: {e}", flush=True)
    
    def _handle_backoff_wait(self, wait_time: int) -> None:
        """Handle exponential backoff waiting period."""
        wait_msg = f"⏳ Technical difficulties. Please wait {self._format_wait_time(wait_time)} while we retry..."
        print(f"\n{wait_msg}\n", flush=True)
        self._notify_waiting(wait_time)
        time.sleep(wait_time)
        api_manager.reset_to_first_combination()
        self.refresh_client()
    
    def _make_api_request(self, messages: list):
        """Make API request and return response."""
        print(f"\n📊 API Usage Stats (before request):\n{api_manager.get_usage_stats()}\n", flush=True)
        response = self.gemini.chat.completions.create(
            model=self.current_model,
            messages=messages,
            tools=tools
        )
        api_manager.reset_backoff()
        api_manager.increment_usage()
        print(f"✅ Request successful with {self.current_model} + Key {api_manager.current_key_index + 1}", flush=True)
        print(f"\n📊 API Usage Stats (after request):\n{api_manager.get_usage_stats()}\n", flush=True)
        return response
    
    def _handle_quota_error(self) -> None:
        """Handle quota exhaustion error."""
        api_manager.mark_combination_exhausted(
            api_manager.current_key_index,
            api_manager.current_model_index
        )
        print(f"\n📊 Updated API Usage Stats:\n{api_manager.get_usage_stats()}\n", flush=True)
        api_manager.rotate_to_next()
        self.refresh_client()
        print(f"✅ Switched to {self.current_model} + Key {api_manager.current_key_index + 1}", flush=True)
    
    def _handle_general_error(self, error_str: str, retry_count: int) -> bool:
        """Handle general API errors. Returns True if should give up."""
        print(f"❌ Error with {self.current_model}: {error_str[:100]}", flush=True)
        api_manager.mark_combination_exhausted(
            api_manager.current_key_index,
            api_manager.current_model_index
        )
        api_manager.rotate_to_next()
        self.refresh_client()
        
        max_retries = len(api_manager.keys) * len(api_manager.models) * 2
        if retry_count > max_retries:
            return True
        
        print(f"🔄 Trying {self.current_model} + Key {api_manager.current_key_index + 1}", flush=True)
        return False
    
    def _is_quota_error(self, error_str: str) -> bool:
        """Check if error is quota-related."""
        return "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower()
    
    def _process_response(self, response, messages: list) -> bool:
        """Process API response. Returns True if done, False if needs more tool calls."""
        if response.choices[0].finish_reason != "tool_calls":
            return True
        
        message = response.choices[0].message
        results = self.handle_tool_call(message.tool_calls)
        messages.append(message)
        messages.extend(results)
        return False
    
    def _handle_error(self, error_str: str, retry_count: int) -> str:
        """Handle API error and return error message if should give up, empty string otherwise."""
        if self._is_quota_error(error_str):
            self._handle_quota_error()
            return ""
        
        if self._handle_general_error(error_str, retry_count):
            return f"I apologize, but I'm experiencing technical difficulties: {error_str[:100]}..."
        
        return ""
    
    def chat(self, message, history):
        """Process user message with infinite retry and exponential backoff."""
        messages = [{"role": "system", "content": self.system_prompt()}] + history + [{"role": "user", "content": message}]
        retry_count = 0
        
        while True:
            should_wait, wait_time = api_manager.should_wait_before_retry()
            if should_wait:
                self._handle_backoff_wait(wait_time)
            
            try:
                response = self._make_api_request(messages)
                if self._process_response(response, messages):
                    break
                    
            except Exception as e:
                retry_count += 1
                error_msg = self._handle_error(str(e), retry_count)
                if error_msg:
                    return error_msg
        
        content = response.choices[0].message.content
        return content if content is not None else "I apologize, but I couldn't generate a response. Please try again."
    

if __name__ == "__main__":
    bot = DanielBot()
    
    # Custom CSS - Professional blue/teal theme (trust & confidence)
    custom_css = """
    .gradio-container {
        max-width: 850px !important;
        margin: auto !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%) !important;
        min-height: 100vh !important;
    }
    
    h1 {
        text-align: center !important;
        color: #0f172a !important;
        font-size: 2.2rem !important;
        font-weight: 700 !important;
        margin-bottom: 0.3rem !important;
    }
    
    h3 {
        text-align: center !important;
        color: #ffffff !important;
        font-weight: 600 !important;
        margin-top: 0 !important;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
    }
    
    .description {
        text-align: center !important;
        background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%) !important;
        color: white !important;
        padding: 2rem !important;
        border-radius: 16px !important;
        margin-bottom: 1.5rem !important;
        box-shadow: 0 4px 16px rgba(8, 145, 178, 0.2) !important;
    }
    
    .chatbot {
        border-radius: 16px !important;
        border: 2px solid #e2e8f0 !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
        max-width: 1200px !important;
        margin: 0 auto !important;
    }
    
    .message.user {
        background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%) !important;
        color: white !important;
        border-radius: 16px 16px 4px 16px !important;
        padding: 12px 16px !important;
        box-shadow: 0 2px 8px rgba(8, 145, 178, 0.2) !important;
    }
    
    .message.bot {
        background: #f8fafc !important;
        color: #1e293b !important;
        border-radius: 16px 16px 16px 4px !important;
        border: 1px solid #e2e8f0 !important;
    }
    
    .input-wrap {
        border-radius: 24px !important;
        border: 2px solid #0891b2 !important;
        background: white !important;
        box-shadow: 0 2px 8px rgba(8, 145, 178, 0.1) !important;
    }
    
    .input-wrap:focus-within {
        border-color: #0e7490 !important;
        box-shadow: 0 4px 16px rgba(8, 145, 178, 0.2) !important;
    }
    
    button.primary {
        background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%) !important;
        border: none !important;
        border-radius: 20px !important;
        color: white !important;
        font-weight: 600 !important;
        padding: 12px 28px !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 12px rgba(8, 145, 178, 0.25) !important;
    }
    
    button.primary:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(8, 145, 178, 0.35) !important;
    }
    
    .footer {
        text-align: center !important;
        color: #64748b !important;
        margin-top: 1.5rem !important;
        font-size: 0.9rem !important;
        padding: 1rem !important;
    }
    
    .footer a {
        color: #0891b2 !important;
        text-decoration: none !important;
        font-weight: 500 !important;
    }
    
    .footer a:hover {
        text-decoration: underline !important;
    }
    
    /* Increase container width */
    .gradio-container {
        max-width: 1400px !important;
        margin: 0 auto !important;
    }
    """
    
    # Create the interface with custom theme (Gradio 6.0 compatible)
    with gr.Blocks() as demo:
        gr.Markdown(
            """
            # 👨‍💻 Daniel Ángel Bot assistant
            ### Python & AI Engineer | +12 Years Experience
            
            Hi! I'm Daniel's AI assistant. Ask me about his expertise in <span style="color: white; font-weight: 600;">Python</span>, <span style="color: white; font-weight: 600;">AI/ML</span>, <span style="color: white; font-weight: 600;">Blockchain</span>, or any project experience.
            """,
            elem_classes="description"
        )
        
        chatbot = gr.Chatbot(
            height=500,
            placeholder="Ask about Daniel's Python projects, AI implementations, blockchain experience, or how he can help your team...",
            show_label=False,
            avatar_images=("https://api.dicebear.com/7.x/avataaars/svg?seed=User", "https://api.dicebear.com/7.x/bottts/svg?seed=Daniel"),
            elem_classes="chatbot"
        )
        
        with gr.Row():
            msg = gr.Textbox(
                placeholder="Type your message here...",
                show_label=False,
                scale=9,
                container=False,
                elem_classes="input-wrap"
            )
            submit = gr.Button("Send", scale=1, variant="primary")
        
        gr.Markdown(
            """
            ---
            🚀 **Interested in working together?** Let me know your email and I'll get in touch!
            
            *Built with Python, Gradio & Google Gemini*
            """,
            elem_classes="footer"
        )
        
        # Set up the chat interface logic
        def respond(message, chat_history):
            # Add user message immediately
            chat_history.append({"role": "user", "content": message})
            
            # Get bot response
            bot_message = bot.chat(message, chat_history)
            
            # Add bot response
            chat_history.append({"role": "assistant", "content": bot_message})
            
            return "", chat_history
        
        msg.submit(respond, [msg, chatbot], [msg, chatbot])
        submit.click(respond, [msg, chatbot], [msg, chatbot])
    
    # Launch with CSS and theme parameters (Gradio 6.0)
    demo.launch(share=True, css=custom_css)
