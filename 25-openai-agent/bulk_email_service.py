#!/usr/bin/env python3
"""
Bulk email service with rate limiting for Resend free tier
Handles sending multiple emails without hitting the 2/second limit
"""

import time
import asyncio
from typing import List, Dict, Any
from email_service import EmailService

class BulkEmailService:
    """Service for sending bulk emails with rate limiting"""
    
    def __init__(self, api_key: str = None, rate_limit: int = 2):
        """
        Initialize bulk email service
        
        Args:
            api_key: Resend API key
            rate_limit: Requests per second (default: 2 for free tier)
        """
        self.email_service = EmailService(api_key)
        self.rate_limit = rate_limit
        self.delay = 1.0 / rate_limit  # Delay between requests
    
    def send_bulk_emails(
        self,
        recipients: List[str],
        subject: str,
        text: str = None,
        html: str = None,
        show_progress: bool = True
    ) -> Dict[str, Any]:
        """
        Send emails to multiple recipients with rate limiting
        
        Args:
            recipients: List of email addresses
            subject: Email subject
            text: Plain text content
            html: HTML content
            show_progress: Show progress bar
            
        Returns:
            Dict with success/failure counts and results
        """
        results = []
        success_count = 0
        failed_count = 0
        
        if show_progress:
            print(f"📧 Sending {len(recipients)} emails...")
            print(f"⏱️  Rate limit: {self.rate_limit} emails/second")
            print(f"⏰ Estimated time: {len(recipients) / self.rate_limit:.1f} seconds")
            print("=" * 60)
        
        for i, email in enumerate(recipients):
            try:
                result = self.email_service.send_email(
                    to=email,
                    subject=subject,
                    text=text,
                    html=html
                )
                
                results.append({
                    "email": email,
                    "success": result["success"],
                    "result": result
                })
                
                if result["success"]:
                    success_count += 1
                    if show_progress:
                        print(f"✅ [{i+1}/{len(recipients)}] Sent to {email}")
                else:
                    failed_count += 1
                    if show_progress:
                        print(f"❌ [{i+1}/{len(recipients)}] Failed to {email}: {result['error']}")
                
                # Rate limiting - wait before next request
                if i < len(recipients) - 1:  # Don't wait after last email
                    time.sleep(self.delay)
                    
            except Exception as e:
                failed_count += 1
                results.append({
                    "email": email,
                    "success": False,
                    "error": str(e)
                })
                if show_progress:
                    print(f"❌ [{i+1}/{len(recipients)}] Error with {email}: {e}")
        
        if show_progress:
            print("=" * 60)
            print(f"📊 Summary:")
            print(f"   ✅ Successful: {success_count}")
            print(f"   ❌ Failed: {failed_count}")
            print(f"   📈 Success rate: {success_count/len(recipients)*100:.1f}%")
        
        return {
            "total": len(recipients),
            "success": success_count,
            "failed": failed_count,
            "results": results
        }
    
    async def send_bulk_emails_async(
        self,
        recipients: List[str],
        subject: str,
        text: str = None,
        html: str = None,
        show_progress: bool = True
    ) -> Dict[str, Any]:
        """
        Send emails asynchronously with rate limiting
        
        Args:
            recipients: List of email addresses
            subject: Email subject
            text: Plain text content
            html: HTML content
            show_progress: Show progress bar
            
        Returns:
            Dict with success/failure counts and results
        """
        results = []
        success_count = 0
        failed_count = 0
        
        if show_progress:
            print(f"🚀 Sending {len(recipients)} emails asynchronously...")
            print(f"⏱️  Rate limit: {self.rate_limit} emails/second")
        
        for i, email in enumerate(recipients):
            try:
                # Run email sending in thread pool to avoid blocking
                result = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.email_service.send_email(
                        to=email,
                        subject=subject,
                        text=text,
                        html=html
                    )
                )
                
                results.append({
                    "email": email,
                    "success": result["success"],
                    "result": result
                })
                
                if result["success"]:
                    success_count += 1
                else:
                    failed_count += 1
                
                if show_progress:
                    print(f"📧 [{i+1}/{len(recipients)}] Processed {email}")
                
                # Rate limiting
                if i < len(recipients) - 1:
                    await asyncio.sleep(self.delay)
                    
            except Exception as e:
                failed_count += 1
                results.append({
                    "email": email,
                    "success": False,
                    "error": str(e)
                })
        
        if show_progress:
            print(f"📊 Async Summary: {success_count} success, {failed_count} failed")
        
        return {
            "total": len(recipients),
            "success": success_count,
            "failed": failed_count,
            "results": results
        }
    
    def send_campaign(
        self,
        campaign_name: str,
        recipients: List[str],
        subject: str,
        template_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Send email campaign with personalization
        
        Args:
            campaign_name: Name of the campaign
            recipients: List of email addresses
            subject: Email subject
            template_data: Data for personalization
            
        Returns:
            Dict with campaign results
        """
        if show_progress := True:
            print(f"🎯 Starting campaign: {campaign_name}")
            print(f"📊 Recipients: {len(recipients)}")
        
        # Create personalized HTML for each recipient
        html_template = """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">{subject}</h2>
            <p>Hi {name},</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                {message}
            </div>
            <p>Best regards,<br>Team</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
                Campaign: {campaign_name}
            </p>
        </body>
        </html>
        """
        
        results = []
        success_count = 0
        
        for i, email in enumerate(recipients):
            # Personalize email
            name = email.split('@')[0].replace('.', ' ').title()  # Extract name from email
            
            html = html_template.format(
                subject=subject,
                name=name,
                message=template_data.get("message", "Thank you for your interest!"),
                campaign_name=campaign_name
            )
            
            result = self.send_bulk_emails(
                recipients=[email],
                subject=subject,
                html=html,
                show_progress=False
            )
            
            if result["success"] > 0:
                success_count += 1
                print(f"✅ [{i+1}/{len(recipients)}] Campaign email sent to {email}")
            
            # Rate limiting
            if i < len(recipients) - 1:
                time.sleep(self.delay)
        
        return {
            "campaign": campaign_name,
            "total": len(recipients),
            "success": success_count,
            "failed": len(recipients) - success_count
        }


# Example usage
if __name__ == "__main__":
    print("📧 Bulk Email Service Test")
    print("=" * 60)
    
    # Initialize service with free tier rate limit
    bulk_service = BulkEmailService(rate_limit=2)
    
    # Test 1: Send to multiple recipients
    test_emails = [
        "delivered@resend.dev",
        "test1@resend.dev",
        "test2@resend.dev",
        "test3@resend.dev"
    ]
    
    print("\n1️⃣ Testing bulk email sending...")
    result = bulk_service.send_bulk_emails(
        recipients=test_emails,
        subject="🚀 Bulk Test Email",
        html="<h1>This is a bulk test email</h1><p>Sent with rate limiting!</p>"
    )
    
    # Test 2: Campaign with personalization
    print("\n2️⃣ Testing personalized campaign...")
    campaign_result = bulk_service.send_campaign(
        campaign_name="Welcome Campaign",
        recipients=test_emails[:3],  # Test with 3 emails
        subject="Welcome to Our Platform!",
        template_data={
            "message": "We're excited to have you join our community. Get started today!"
        }
    )
    
    print("\n" + "=" * 60)
    print("✅ Bulk email tests completed!")
    print("\n💡 Tips:")
    print("• Free tier: 2 emails/second (0.5 second delay)")
    print("• For 100 emails: ~50 seconds")
    print("• Upgrade to Starter plan for 10 emails/second")
    print("• Upgrade to Growth plan for 100 emails/second")
