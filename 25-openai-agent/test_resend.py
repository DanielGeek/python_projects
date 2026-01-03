#!/usr/bin/env python3
"""
Resend alternative for email sending (100 emails/day free, 3,000/month)
Very developer-friendly, no credit card required
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv(override=True)

def send_email_resend(to_email, subject, text_content, html_content=None):
    """Send email using Resend API"""
    
    # Get API key from: https://resend.com/api-keys
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    if not RESEND_API_KEY:
        print("❌ RESEND_API_KEY not found in environment variables")
        print("Please set it in your .env file or environment")
        print("Example: export RESEND_API_KEY=re_your_actual_api_key")
        print("You can get your API key from: https://resend.com/api-keys")
        return False
    FROM_EMAIL = os.getenv("FROM_EMAIL", "onboarding@resend.dev")  # Default test email
    
    url = "https://api.resend.com/emails"
    
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "from": FROM_EMAIL,
        "to": [to_email],
        "subject": subject,
        "text": text_content
    }
    
    if html_content:
        data["html"] = html_content
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Email sent successfully!")
            print(f"   Email ID: {result.get('id', 'N/A')}")
            print(f"   To: {to_email}")
            print(f"   Subject: {subject}")
            return True
        else:
            print(f"❌ Failed to send email: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
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
