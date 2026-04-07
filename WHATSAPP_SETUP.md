# WhatsApp Integration Setup Guide

This contact form now automatically sends contact messages to your WhatsApp inbox using Twilio's WhatsApp API.

## Contact Form Features

The contact form now includes:

- ✅ **Name** (required)
- ✅ **Email** (required)
- ✅ **Phone** (optional - for WhatsApp replies)
- ✅ **Subject** (optional)
- ✅ **Message** (required, min 10 characters)

When a contact submits the form with their phone number, it will be included in your WhatsApp notification for easier follow-up via WhatsApp.

## Prerequisites

1. **Twilio Account** (Free tier available at https://www.twilio.com/console)
2. **WhatsApp Business Account** (linked with Twilio)
3. **Environment Variables** configured

## Setup Steps

### 1. Create a Twilio Account

- Go to https://www.twilio.com/console
- Sign up for a free account
- Go to the Dashboard

### 2. Get Your Twilio Credentials

From your Twilio Console:

- **Account SID**: Found at the top of the dashboard
- **Auth Token**: Found next to Account SID (click to reveal)
- **WhatsApp Phone Number**: Set up in Phone Numbers section

Example format: `+1234567890` (with country code)

### 3. Set Environment Variables

Add these to your `.env` file in the backend:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=+1234567890
WHATSAPP_ADMIN_NUMBER=+your_personal_whatsapp_number
```

### 4. Add to Django Settings (optional, advanced)

Instead of `.env`, you can add directly to `settings.py`:

```python
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_FROM = os.getenv('TWILIO_WHATSAPP_FROM')
WHATSAPP_ADMIN_NUMBER = os.getenv('WHATSAPP_ADMIN_NUMBER')
```

### 5. Install Twilio Package

```bash
# Run this in your backend virtual environment
pip install twilio==8.10.0
```

Or use during deployment:

```bash
pip install -r requirements.txt
```

## How It Works

### When a Contact Form is Submitted:

1. ✅ **Message Saved to Database**
   - Stored in `ContactSubmission` model
   - Can be viewed in Django admin

2. ✅ **Email Sent** (to your email)
   - Automatic email notification

3. ✅ **WhatsApp Message Sent** (to your WhatsApp)
   - Instant notification with all contact details
   - Formatted message with:
     - Name
     - Email
     - Phone
     - Subject
     - Message content
     - Website (if provided)
     - Budget (if provided)
     - Timeline (if provided)

### Example WhatsApp Message:

```
📬 NEW CONTACT FORM SUBMISSION

👤 Name: John Doe
📧 Email: john@example.com
📱 Phone: +1234567890

📌 Subject: Django API Development

💬 Message:
I need help building a REST API for my e-commerce platform...

---
🔗 Optional Details:
Website: https://johndoe.com
Budget: $5000-$10000
Timeline: 2 weeks
```

## Testing

### 1. Test WhatsApp Connection

Create a simple test script:

```python
from portfolio_backend.contact.whatsapp_service import whatsapp_service

# Check if configured
if whatsapp_service.is_configured():
    print("✅ WhatsApp service is configured!")
else:
    print("❌ WhatsApp service is NOT configured")
    print("Check your environment variables")
```

### 2. Send a Test Message

```python
test_data = {
    'name': 'Test',
    'email': 'test@example.com',
    'subject': 'Test Message',
    'message': 'This is a test message',
    'phone': '',
    'website': '',
    'budget_range': '',
    'project_timeline': ''
}

result = whatsapp_service.send_contact_notification(test_data)
print(result)
```

## Troubleshooting

### Issue: "WhatsApp service not configured"

**Solution:**

- Check environment variables are set correctly
- Restart your Django development server
- Run: `python manage.py shell` and test the service

### Issue: Messages not arriving

**Solution:**

- Verify WHATSAPP_ADMIN_NUMBER includes country code (e.g., +262333... for Malawi)
- Check Twilio account has sufficient balance
- Verify phone number is WhatsApp-enabled
- Check Django logs for errors

### Issue: "Invalid phone number"

**Solution:**

- Phone numbers must include country code
- Malawi: +265
- South Africa: +27
- Format: `+265123456789`

## Free Tier Limitations (Twilio)

- Limited messages per month
- Must use approved WhatsApp template messages for production
- Upgrade to Pro for unlimited messages

## Contact Details for Your Setup

Your WhatsApp Configuration:

- 📱 Recipient Number: `+your_number_here`
- 🔑 Keep your Auth Token secret!
- 📊 Monitor message usage in Twilio Console

## Database

All messages are stored in the database with these fields:

```
- ID
- Name
- Email
- Subject
- Message
- Phone (optional)
- Company (optional)
- Website (optional)
- Budget Range (optional)
- Project Timeline (optional)
- Status (new/read/replied/archived)
- Priority (low/medium/high/urgent)
- Created At
- Updated At
```

Access via Django Admin at: `/admin/contact/contactsubmission/`

## Production Considerations

1. **Use Celery** for async message sending (avoid blocking requests)
2. **Rate Limiting**: Already set to 3 messages per hour per IP
3. **Message Queue**: Consider Redis/RabbitMQ for high volume
4. **Monitoring**: Set up logging and monitoring for failed messages
5. **Compliance**: Ensure you comply with WhatsApp Business API terms

## Support

For issues:

- Twilio Docs: https://www.twilio.com/docs/whatsapp
- Django Celery: https://docs.celeryproject.io/
- Contact form logs in: `portfolio_backend/logs/`
