import crypto from 'crypto';

interface InitializePaymentParams {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string; // 'success' | 'failed' | 'abandoned'
    reference: string;
    amount: number; // in kobo
    gateway_response: string;
    paid_at: string;
    channel: string;
    currency: string;
    customer: {
      email: string;
      customer_code?: string;
    };
    metadata?: Record<string, any>;
  };
}

export class PaystackService {
  private static getSecretKey(): string {
    return (process.env.PAYSTACK_SECRET_KEY || '').trim();
  }

  /**
   * Determines whether Paystack should run in simulated mock test mode.
   * Activated when ENABLE_DEV_MOCK_CHECKOUT=true OR when keys are placeholders/dummy values.
   */
  public static isMockMode(): boolean {
    if (process.env.ENABLE_DEV_MOCK_CHECKOUT === 'true') {
      return true;
    }
    const key = this.getSecretKey();
    if (!key) return true;
    if (
      key.includes('xxxx') ||
      key.includes('placeholder') ||
      key.includes('your-paystack') ||
      key === 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' ||
      !key.startsWith('sk_')
    ) {
      return true;
    }
    return false;
  }

  /**
   * Initializes a Paystack transaction.
   * If secret key is not set, contains placeholders, or is in mock mode, returns a mock authorization url for testing.
   */
  public static async initializeTransaction(params: InitializePaymentParams): Promise<PaystackInitResponse> {
    const { email, amountKobo, reference, callbackUrl, metadata } = params;

    if (this.isMockMode()) {
      // Local development or unconfigured Paystack: Provide safe mock checkout redirect
      console.warn('[PaystackService] Using simulated checkout flow for local development (no live key provided).');
      return {
        status: true,
        message: 'Mock authorization URL created for testing',
        data: {
          authorization_url: `${callbackUrl}${callbackUrl.includes('?') ? '&' : '?'}reference=${encodeURIComponent(reference)}&mock_payment=true`,
          access_code: `mock_code_${reference}`,
          reference,
        },
      };
    }

    const secretKey = this.getSecretKey();

    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amountKobo,
          reference,
          callback_url: callbackUrl,
          metadata: {
            ...metadata,
            platform: 'ARUBEKEE_COLLECTION_STOREFRONT',
          },
        }),
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[PaystackService.initializeTransaction] Error:', error);
      throw new Error(`Failed to initialize Paystack payment: ${error.message}`);
    }
  }

  /**
   * Authoritatively verifies transaction status from Paystack API.
   */
  public static async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    if (this.isMockMode()) {
      // Development mock response
      return {
        status: true,
        message: 'Mock verification successful',
        data: {
          id: 9999999,
          status: 'success',
          reference,
          amount: 0, // Will be verified against order in DB
          gateway_response: 'Successful (Mock Test Mode)',
          paid_at: new Date().toISOString(),
          channel: 'card',
          currency: 'NGN',
          customer: {
            email: 'customer@example.com',
          },
        },
      };
    }

    const secretKey = this.getSecretKey();

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[PaystackService.verifyTransaction] Error:', error);
      throw new Error(`Failed to verify Paystack payment: ${error.message}`);
    }
  }

  /**
   * Validates Paystack webhook HMAC SHA-512 signature.
   */
  public static verifyWebhookSignature(signature: string | null, rawBody: string): boolean {
    if (this.isMockMode()) {
      return true;
    }

    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET || this.getSecretKey();
    if (!webhookSecret || !signature) {
      return false;
    }

    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(rawBody)
      .digest('hex');

    // Timing-safe comparison to prevent side-channel timing attacks
    try {
      const hashBuffer = Buffer.from(hash, 'utf8');
      const sigBuffer = Buffer.from(signature, 'utf8');
      if (hashBuffer.length !== sigBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(hashBuffer, sigBuffer);
    } catch {
      return false;
    }
  }
}
