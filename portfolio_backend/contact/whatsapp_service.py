"""
WhatsApp Service for sending notifications via Twilio
"""
import os
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    logger.warning("Twilio library not installed. WhatsApp notifications disabled.")


class WhatsAppService:
    """Service to send WhatsApp messages via Twilio"""
    
    def __init__(self):
        self.account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', os.getenv('TWILIO_ACCOUNT_SID'))
        self.auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', os.getenv('TWILIO_AUTH_TOKEN'))
        self.whatsapp_from = getattr(settings, 'TWILIO_WHATSAPP_FROM', os.getenv('TWILIO_WHATSAPP_FROM'))
        self.whatsapp_to = getattr(settings, 'WHATSAPP_ADMIN_NUMBER', os.getenv('WHATSAPP_ADMIN_NUMBER'))
        self.client = None
        
        if TWILIO_AVAILABLE and self.account_sid and self.auth_token:
            try:
                self.client = Client(self.account_sid, self.auth_token)
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {e}")
    
    def is_configured(self) -> bool:
        """Check if WhatsApp service is properly configured"""
        return (
            TWILIO_AVAILABLE and 
            self.client is not None and 
            self.whatsapp_from and 
            self.whatsapp_to
        )
    
    def send_contact_notification(self, contact_data: dict) -> dict:
        """
        Send WhatsApp notification for new contact form submission
        
        Args:
            contact_data: Dictionary with contact submission details
                - name: submitter name
                - email: submitter email
                - subject: message subject
                - message: message content
                - phone: optional phone number
        
        Returns:
            Dict with status and message
        """
        if not self.is_configured():
            logger.warning("WhatsApp service not configured. Skipping WhatsApp notification.")
            return {
                'success': False,
                'reason': 'WhatsApp service not configured'
            }
        
        try:
            # Format the WhatsApp message
            whatsapp_message = self._format_contact_message(contact_data)
            
            # Send via Twilio
            message = self.client.messages.create(
                body=whatsapp_message,
                from_=f"whatsapp:{self.whatsapp_from}",
                to=f"whatsapp:{self.whatsapp_to}"
            )
            
            logger.info(f"WhatsApp message sent successfully: {message.sid}")
            
            return {
                'success': True,
                'message_sid': message.sid,
                'status': 'sent'
            }
        
        except Exception as e:
            logger.error(f"Failed to send WhatsApp notification: {e}")
            return {
                'success': False,
                'reason': str(e),
                'error_type': type(e).__name__
            }
    
    def _format_contact_message(self, contact_data: dict) -> str:
        """Format contact data into a readable WhatsApp message"""
        message = f"""
📬 NEW CONTACT FORM SUBMISSION

👤 Name: {contact_data.get('name', 'N/A')}
📧 Email: {contact_data.get('email', 'N/A')}
📱 Phone: {contact_data.get('phone', 'N/A')}

📌 Subject: {contact_data.get('subject', 'N/A')}

💬 Message:
{contact_data.get('message', 'N/A')}

---
🔗 Optional Details:
Website: {contact_data.get('website', 'N/A')}
Budget: {contact_data.get('budget_range', 'N/A')}
Timeline: {contact_data.get('project_timeline', 'N/A')}
""".strip()
        
        return message
    
    def send_bulk_notification(self, message: str, recipients: list = None) -> dict:
        """
        Send WhatsApp message to multiple recipients
        
        Args:
            message: Message content
            recipients: List of phone numbers (uses admin number if not provided)
        
        Returns:
            Dict with results
        """
        if not self.is_configured():
            return {'success': False, 'reason': 'WhatsApp service not configured'}
        
        if recipients is None:
            recipients = [self.whatsapp_to] if self.whatsapp_to else []
        
        results = {
            'success': 0,
            'failed': 0,
            'messages': []
        }
        
        for recipient in recipients:
            try:
                msg = self.client.messages.create(
                    body=message,
                    from_=f"whatsapp:{self.whatsapp_from}",
                    to=f"whatsapp:{recipient}"
                )
                results['success'] += 1
                results['messages'].append({
                    'recipient': recipient,
                    'status': 'sent',
                    'sid': msg.sid
                })
            except Exception as e:
                results['failed'] += 1
                results['messages'].append({
                    'recipient': recipient,
                    'status': 'failed',
                    'error': str(e)
                })
        
        return results


# Create a singleton instance
whatsapp_service = WhatsAppService()


def send_contact_whatsapp(contact_data: dict) -> bool:
    """
    Convenience function to send WhatsApp notification
    
    Args:
        contact_data: Contact submission data
    
    Returns:
        True if sent successfully, False otherwise
    """
    result = whatsapp_service.send_contact_notification(contact_data)
    return result.get('success', False)
