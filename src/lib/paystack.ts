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
  private static secretKey = process.env.PAYSTACK_SECRET_KEY || '';

  /**
   * Initializes a Paystack transaction.
   * If secret key is not set or in test mock mode, returns a mock authorization url for local development.
   */
  public static async initializeTransaction(params: InitializePaymentParams): Promise<PaystackInitResponse> {
    const { email, amountKobo, reference, callbackUrl, metadata } = params;

    if (!this.secretKey || this.secretKey.startsWith('sk_test_placeholder') || this.secretKey === 'your-paystack-secret-key') {
      // Local development or unconfigured Paystack: Provide safe mock checkout redirect
      console.warn('[PaystackService] PAYSTACK_SECRET_KEY is not configured with live credentials. Using local callback simulation.');
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

    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
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
    if (!this.secretKey || this.secretKey.startsWith('sk_test_placeholder') || this.secretKey === 'your-paystack-secret-key') {
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

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
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
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
    if (!webhookSecret || !signature) {
      return false;
    }

    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return hash === signature;
  }
}

