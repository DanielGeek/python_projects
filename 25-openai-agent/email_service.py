#!/usr/bin/env python3
"""
Email service module using Resend API
Provides easy-to-use functions for sending emails in your projects
"""

import requests
import os
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    """Email service using Resend API"""
    
    def __init__(self, api_key: Optional[str] = None, from_email: Optional[str] = None):
        """
        Initialize email service
        
        Args:
            api_key: Resend API key (defaults to RESEND_API_KEY env var)
            from_email: Default sender email (defaults to FROM_EMAIL env var or onboarding@resend.dev)
        """
        self.api_key = api_key or os.getenv("RESEND_API_KEY")
        self.from_email = from_email or os.getenv("FROM_EMAIL", "onboarding@resend.dev")
        self.base_url = "https://api.resend.com"
        
        if not self.api_key:
            raise ValueError("RESEND_API_KEY is required. Set it in .env or pass it to constructor.")
    
    def send_email(
        self,
        to: str | List[str],
        subject: str,
        text: Optional[str] = None,
        html: Optional[str] = None,
        from_email: Optional[str] = None,
        reply_to: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        tags: Optional[List[Dict[str, str]]] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Send an email using Resend API
        
        Args:
            to: Recipient email(s)
            subject: Email subject
            text: Plain text content
            html: HTML content
            from_email: Sender email (overrides default)
            reply_to: Reply-to email
            cc: CC recipients
            bcc: BCC recipients
            tags: Custom tags for tracking
            attachments: File attachments
            
        Returns:
            Dict with response data including email ID
            
        Raises:
            Exception if email fails to send
        """
        url = f"{self.base_url}/emails"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Prepare email data
        data = {
            "from": from_email or self.from_email,
            "to": [to] if isinstance(to, str) else to,
            "subject": subject
        }
        
        # Add optional fields
        if text:
            data["text"] = text
        if html:
            data["html"] = html
        if reply_to:
            data["reply_to"] = reply_to
        if cc:
            data["cc"] = cc
        if bcc:
            data["bcc"] = bcc
        if tags:
            data["tags"] = tags
        if attachments:
            data["attachments"] = attachments
        
        # Send request
        response = requests.post(url, json=data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return {
                "success": True,
                "data": response.json()
            }
        else:
            return {
                "success": False,
                "error": response.text,
                "status_code": response.status_code
            }
    
    def send_template_email(
        self,
        to: str | List[str],
        subject: str,
        template_name: str,
        template_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Send email using a predefined template
        
        Args:
            to: Recipient email(s)
            subject: Email subject
            template_name: Name of the template
            template_data: Data to populate template
            
        Returns:
            Dict with response data
        """
        # Load template
        html = self._load_template(template_name, template_data)
        
        return self.send_email(
            to=to,
            subject=subject,
            html=html
        )
    
    def _load_template(self, template_name: str, data: Dict[str, Any]) -> str:
        """
        Load and populate email template
        
        Args:
            template_name: Template file name
            data: Data to populate template
            
        Returns:
            Populated HTML string
        """
        # Simple template system - can be enhanced
        templates = {
            "welcome": """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">Welcome, {name}!</h1>
                    <p>Thank you for signing up. We're excited to have you on board.</p>
                    <p>{message}</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        If you have any questions, feel free to reply to this email.
                    </p>
                </body>
                </html>
            """,
            "notification": """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">{title}</h2>
                    <p>{message}</p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        {content}
                    </div>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated notification.
                    </p>
                </body>
                </html>
            """,
            "alert": """
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #ff4444; color: white; padding: 15px; border-radius: 5px;">
                        <h2 style="margin: 0;">⚠️ {title}</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p>{message}</p>
                        {details}
                    </div>
                </body>
                </html>
            """
        }
        
        template = templates.get(template_name, templates["notification"])
        return template.format(**data)


# Convenience functions
def send_email(to: str, subject: str, text: str = None, html: str = None) -> Dict[str, Any]:
    """Quick send email function"""
    service = EmailService()
    return service.send_email(to=to, subject=subject, text=text, html=html)


def send_welcome_email(to: str, name: str, message: str = "") -> Dict[str, Any]:
    """Send welcome email"""
    service = EmailService()
    return service.send_template_email(
        to=to,
        subject=f"Welcome, {name}!",
        template_name="welcome",
        template_data={"name": name, "message": message}
    )


def send_notification(to: str, title: str, message: str, content: str = "") -> Dict[str, Any]:
    """Send notification email"""
    service = EmailService()
    return service.send_template_email(
        to=to,
        subject=title,
        template_name="notification",
        template_data={"title": title, "message": message, "content": content}
    )


# Example usage
if __name__ == "__main__":
    print("📧 Email Service Test")
    print("=" * 60)
    
    # Test 1: Simple email
    print("\n1️⃣ Testing simple email...")
    result = send_email(
        to="delivered@resend.dev",
        subject="🚀 Test from Email Service",
        text="This is a test email",
        html="<h1>Test Email</h1><p>This is a test email from the email service module.</p>"
    )
    
    if result["success"]:
        print(f"✅ Email sent! ID: {result['data'].get('id')}")
    else:
        print(f"❌ Failed: {result['error']}")
    
    # Test 2: Welcome email template
    print("\n2️⃣ Testing welcome email template...")
    result = send_welcome_email(
        to="delivered@resend.dev",
        name="Daniel",
        message="Your account has been created successfully. Start exploring now!"
    )
    
    if result["success"]:
        print(f"✅ Welcome email sent! ID: {result['data'].get('id')}")
    else:
        print(f"❌ Failed: {result['error']}")
    
    # Test 3: Notification email
    print("\n3️⃣ Testing notification email...")
    result = send_notification(
        to="delivered@resend.dev",
        title="New Activity Detected",
        message="You have a new notification from your application.",
        content="<strong>Action:</strong> User signed in from new device"
    )
    
    if result["success"]:
        print(f"✅ Notification sent! ID: {result['data'].get('id')}")
    else:
        print(f"❌ Failed: {result['error']}")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
