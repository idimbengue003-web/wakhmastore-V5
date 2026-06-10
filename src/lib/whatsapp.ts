/**
 * WhatsApp OTP Service for Wakhma Store
 *
 * Supports two modes:
 * 1. **Production mode** — Uses WhatsApp Cloud API (Meta Business) to send OTP directly
 * 2. **Fallback mode** — Generates a wa.me link so the user receives the code via WhatsApp
 *
 * Environment variables needed for production:
 * - WHATSAPP_API_TOKEN: Meta WhatsApp Business API token
 * - WHATSAPP_PHONE_NUMBER_ID: WhatsApp Business phone number ID
 * - WHATSAPP_VERIFY_TEMPLATE: Template name for OTP (default: "verification_code")
 *
 * To set up WhatsApp Cloud API:
 * 1. Go to https://business.facebook.com/
 * 2. Create a Business Account
 * 3. Go to WhatsApp > Getting Started
 * 4. Create a WhatsApp Business Account
 * 5. Add a phone number
 * 6. Create a message template for OTP
 * 7. Get the API token and Phone Number ID
 */

interface WhatsAppOTPResult {
  success: boolean;
  method: 'cloud_api' | 'wa_me_link';
  whatsappLink?: string;
  error?: string;
}

/**
 * Send an OTP code via WhatsApp Cloud API
 */
async function sendViaCloudAPI(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_VERIFY_TEMPLATE || 'verification_code';

  if (!apiToken || !phoneNumberId) {
    return { success: false, error: 'WhatsApp API not configured' };
  }

  // Format phone number for WhatsApp API (remove +, keep country code)
  const formattedPhone = phoneNumber.replace('+', '');

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'fr',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: code,
                  },
                ],
              },
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [
                  {
                    type: 'text',
                    text: code,
                  },
                ],
              },
            ],
          },
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.messages) {
      return { success: true };
    } else {
      console.error('[WhatsApp Cloud API] Error: message not sent');
      return { success: false, error: data.error?.message || 'WhatsApp API error' };
    }
  } catch (error) {
    console.error('[WhatsApp Cloud API] Network error:', error);
    return { success: false, error: 'Network error contacting WhatsApp API' };
  }
}

/**
 * Send an OTP code via WhatsApp
 *
 * Tries Cloud API first, falls back to wa.me link
 */
export async function sendWhatsAppOTP(
  phoneNumber: string,
  code: string
): Promise<WhatsAppOTPResult> {
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const isProduction = process.env.NODE_ENV === 'production';

  // If Cloud API is configured, use it
  if (apiToken && phoneNumberId) {
    const result = await sendViaCloudAPI(phoneNumber, code);

    if (result.success) {
      return {
        success: true,
        method: 'cloud_api',
      };
    }

    // If Cloud API fails and we're in production, still try wa.me fallback
    console.warn('[WhatsApp] Cloud API failed. Falling back to wa.me link.');
  }

  // Fallback: Generate wa.me link
  // This opens WhatsApp with a pre-filled message containing the OTP code
  const whatsappPhone = phoneNumber.replace('+', '');
  const whatsappMessage = `Wakhma Store - Votre code de vérification est : ${code}\n\nCe code expire dans 5 minutes. Ne le partagez avec personne.`;
  const whatsappLink = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  // No logging of sensitive data (phone numbers, OTP codes) in production

  return {
    success: true,
    method: 'wa_me_link',
    whatsappLink,
  };
}

/**
 * Check if WhatsApp Cloud API is configured
 */
export function isWhatsAppAPIConfigured(): boolean {
  return !!(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}
