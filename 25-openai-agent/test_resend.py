#!/usr/bin/env python3
"""
Resend email sending test using official Python SDK
100 emails/day free, 3,000/month - Very developer-friendly, no credit card required
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv(override=True)

def send_email_resend(to_email, subject, text_content, html_content=None):
    """Send email using Resend Python SDK"""
    
    # Get API key from: https://resend.com/api-keys
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    if not RESEND_API_KEY:
        print("❌ RESEND_API_KEY not found in environment variables")
        print("Please set it in your .env file or environment")
        print("Example: export RESEND_API_KEY=re_your_actual_api_key")
        print("You can get your API key from: https://resend.com/api-keys")
        return False
    
    FROM_EMAIL = os.getenv("FROM_EMAIL", "onboarding@resend.dev")
    
    # Set API key for Resend SDK
    resend.api_key = RESEND_API_KEY
    
    try:
        # Prepare email params
        params: resend.Emails.SendParams = {
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": subject,
        }
        
        # Add content (text or html)
        if html_content:
            params["html"] = html_content
        if text_content:
            params["text"] = text_content
        
        # Send email using Resend SDK
        email = resend.Emails.send(params)
        
        print("✅ Email sent successfully!")
        print(f"   Message ID: {email.get('id', 'N/A')}")
        print(f"   To: {to_email}")
        print(f"   Subject: {subject}")
        return True
            
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False

if __name__ == "__main__":
    print("📧 Resend Email Test")
    print("=" * 60)
    print("⚠️  Setup Instructions:")
    print("1. Sign up at https://resend.com (FREE, no credit card)")
    print("2. Get API key from https://resend.com/api-keys")
    print("3. Add to .env: RESEND_API_KEY=re_your_key")
    print("4. Use onboarding@resend.dev for testing (no verification needed)")
    print("=" * 60)
    print()
    
    # Test email
    success = send_email_resend(
        to_email="delivered@resend.dev",  # Test email that always works
        subject="🚀 Test Email from Resend",
        text_content="This is a test email using Resend API",
        html_content="<h1>🚀 Test Email</h1><p>This is a test email using Resend API</p>"
    )
    
    if success:
        print("\n🎉 Resend is working! You can now use it for your project.")
    else:
        print("\n⚠️  Check your API key and try again.")
