import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient, Prisma } from '@prisma/client';
import crypto from 'crypto';
import Stripe from 'stripe';

const router = Router();
const prisma = new PrismaClient();

// Initialize Stripe only if API key is configured
const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    })
  : null;

// ============================================
// PAYMENT GATEWAY ROUTES
// ============================================

// Get available payment gateways
router.get('/gateways', async (req: Request, res: Response) => {
  try {
    const gateways = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        icon: true,
        gateway: true,
      },
    });

    res.json({ success: true, data: gateways });
  } catch (error) {
    console.error('Error fetching gateways:', error);
    res.status(500).json({ success: false, error: 'Error al obtener pasarelas' });
  }
});

// ============================================
// PAYPAL ROUTES
// ============================================

router.post('/paypal/create-order', async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true, items: true },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    }

    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalSecret = process.env.PAYPAL_CLIENT_SECRET;
    const paypalMode = process.env.PAYPAL_MODE || 'sandbox';
    
    const baseUrl = paypalMode === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // Get access token
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json() as { access_token: string };

    // Create order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: invoice.id,
          description: `Factura ${invoice.invoiceNumber}`,
          amount: {
            currency_code: invoice.currency,
            value: invoice.total.toString(),
          },
        }],
        application_context: {
          return_url: `${process.env.APP_URL}/payment/paypal/success`,
          cancel_url: `${process.env.APP_URL}/payment/paypal/cancel`,
        },
      }),
    });

    const orderData = await orderResponse.json() as { id: string; links: Array<{ rel: string; href: string }> };

    // Create payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        gateway: 'PAYPAL',
        transactionId: orderData.id,
        amount: invoice.total,
        currency: invoice.currency,
        status: 'PENDING',
        gatewayResponse: orderData,
      },
    });

    const approvalUrl = orderData.links.find((l: { rel: string }) => l.rel === 'approve')?.href;

    res.json({ success: true, data: { orderId: orderData.id, approvalUrl } });
  } catch (error) {
    console.error('PayPal create order error:', error);
    res.status(500).json({ success: false, error: 'Error al crear orden de PayPal' });
  }
});

router.post('/paypal/capture-order', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    const payment = await prisma.payment.findFirst({
      where: { transactionId: orderId, gateway: 'PAYPAL' },
      include: { invoice: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Pago no encontrado' });
    }

    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalSecret = process.env.PAYPAL_CLIENT_SECRET;
    const paypalMode = process.env.PAYPAL_MODE || 'sandbox';
    
    const baseUrl = paypalMode === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // Get access token
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json() as { access_token: string };

    // Capture order
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const captureData = await captureResponse.json() as { status: string };

    if (captureData.status === 'COMPLETED') {
      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESS', gatewayResponse: captureData, paidAt: new Date() },
      });

      // Update invoice
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: 'PAID', paidAt: new Date() },
      });

      // Activate service if applicable
      const invoiceWithService = await prisma.invoice.findUnique({
        where: { id: payment.invoiceId },
      });
      
      if (invoiceWithService?.serviceId) {
        await prisma.service.update({
          where: { id: invoiceWithService.serviceId },
          data: { status: 'ACTIVE' },
        });
      }

      res.json({ success: true, data: { status: 'completed' } });
    } else {
      res.json({ success: false, error: 'Pago no completado' });
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ success: false, error: 'Error al capturar pago de PayPal' });
  }
});

// PayPal Webhook
router.post('/paypal/webhook', async (req: Request, res: Response) => {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const webhookEvent = req.body;

    // Verify webhook (simplified - in production use PayPal SDK)
    console.log('PayPal Webhook received:', webhookEvent.event_type);

    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const orderId = webhookEvent.resource.supplementary_data?.related_ids?.order_id;
        if (orderId) {
          const payment = await prisma.payment.findFirst({
            where: { transactionId: orderId, gateway: 'PAYPAL' },
          });
          if (payment && payment.status !== 'SUCCESS') {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: 'SUCCESS', gatewayResponse: webhookEvent, paidAt: new Date() },
            });
            await prisma.invoice.update({
              where: { id: payment.invoiceId },
              data: { status: 'PAID', paidAt: new Date() },
            });
          }
        }
        break;
      }
      case 'PAYMENT.CAPTURE.REFUNDED': {
        // Handle refund
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ============================================
// MERCADOPAGO ROUTES
// ============================================

router.post('/mercadopago/create-preference', async (req: Request, res: Response) => {
  try {
    const { invoiceId, country } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true, items: true },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    }

    const accessToken = process.env[`MERCADOPAGO_ACCESS_TOKEN_${country?.toUpperCase() || 'MX'}`] || process.env.MERCADOPAGO_ACCESS_TOKEN;

    const preferenceData = {
      items: invoice.items.map((item: { description: string; quantity: number; unitPrice: any }) => ({
        title: item.description,
        quantity: item.quantity,
        unit_price: Number(item.unitPrice),
        currency_id: invoice.currency === 'USD' ? 'MXN' : invoice.currency,
      })),
      external_reference: invoice.id,
      back_urls: {
        success: `${process.env.APP_URL}/payment/mercadopago/success`,
        failure: `${process.env.APP_URL}/payment/mercadopago/failure`,
        pending: `${process.env.APP_URL}/payment/mercadopago/pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.APP_URL}/api/payments/mercadopago/webhook`,
      payer: {
        email: invoice.user.email,
        name: invoice.user.firstName,
        surname: invoice.user.lastName,
      },
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    const preference = await response.json() as { id: string; init_point: string; sandbox_init_point: string };

    // Create payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        gateway: 'MERCADOPAGO',
        transactionId: preference.id,
        amount: invoice.total,
        currency: invoice.currency,
        status: 'PENDING',
        gatewayResponse: preference,
      },
    });

    const paymentUrl = process.env.MERCADOPAGO_MODE === 'production' 
      ? preference.init_point 
      : preference.sandbox_init_point;

    res.json({ success: true, data: { preferenceId: preference.id, paymentUrl } });
  } catch (error) {
    console.error('MercadoPago create preference error:', error);
    res.status(500).json({ success: false, error: 'Error al crear preferencia de MercadoPago' });
  }
});

// MercadoPago Webhook (IPN)
router.post('/mercadopago/webhook', async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const paymentData = await paymentResponse.json() as { 
        status: string; 
        external_reference: string;
        id: string;
      };

      if (paymentData.status === 'approved') {
        const invoiceId = paymentData.external_reference;
        
        const payment = await prisma.payment.findFirst({
          where: { invoiceId, gateway: 'MERCADOPAGO' },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { 
              status: 'SUCCESS', 
              transactionId: paymentData.id.toString(),
              gatewayResponse: paymentData,
              paidAt: new Date(),
            },
          });

          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'PAID', paidAt: new Date() },
          });
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('MercadoPago webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ============================================
// CRYPTO PAYMENT ROUTES
// ============================================

router.post('/crypto/create-payment', async (req: Request, res: Response) => {
  try {
    const { invoiceId, currency, provider } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    }

    let paymentData: { paymentUrl: string; paymentId: string; gatewayData: Record<string, unknown> };

    switch (provider || 'coingate') {
      case 'coingate': {
        const response = await fetch('https://api.coingate.com/v2/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${process.env.COINGATE_API_KEY}`,
          },
          body: JSON.stringify({
            order_id: invoice.id,
            price_amount: Number(invoice.total),
            price_currency: invoice.currency,
            receive_currency: currency || 'BTC',
            title: `Factura ${invoice.invoiceNumber}`,
            callback_url: `${process.env.APP_URL}/api/payments/crypto/coingate/callback`,
            success_url: `${process.env.APP_URL}/payment/crypto/success`,
            cancel_url: `${process.env.APP_URL}/payment/crypto/cancel`,
          }),
        });
        const data = await response.json() as { id: number; payment_url: string };
        paymentData = {
          paymentUrl: data.payment_url,
          paymentId: data.id.toString(),
          gatewayData: data,
        };
        break;
      }
      case 'nowpayments': {
        const response = await fetch('https://api.nowpayments.io/v1/invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NOWPAYMENTS_API_KEY || '',
          },
          body: JSON.stringify({
            price_amount: Number(invoice.total),
            price_currency: invoice.currency.toLowerCase(),
            pay_currency: currency?.toLowerCase() || 'btc',
            order_id: invoice.id,
            order_description: `Factura ${invoice.invoiceNumber}`,
            ipn_callback_url: `${process.env.APP_URL}/api/payments/crypto/nowpayments/callback`,
            success_url: `${process.env.APP_URL}/payment/crypto/success`,
            cancel_url: `${process.env.APP_URL}/payment/crypto/cancel`,
          }),
        });
        const data = await response.json() as { id: string; invoice_url: string };
        paymentData = {
          paymentUrl: data.invoice_url,
          paymentId: data.id,
          gatewayData: data,
        };
        break;
      }
      default:
        return res.status(400).json({ success: false, error: 'Proveedor de crypto no válido' });
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        gateway: 'CRYPTO',
        transactionId: paymentData.paymentId,
        amount: invoice.total,
        currency: invoice.currency,
        status: 'PENDING',
        gatewayResponse: paymentData.gatewayData as Prisma.InputJsonValue,
      },
    });

    res.json({ success: true, data: paymentData });
  } catch (error) {
    console.error('Crypto payment error:', error);
    res.status(500).json({ success: false, error: 'Error al crear pago crypto' });
  }
});

// CoinGate Callback
router.post('/crypto/coingate/callback', async (req: Request, res: Response) => {
  try {
    const { id, status, order_id } = req.body;

    if (status === 'paid') {
      const payment = await prisma.payment.findFirst({
        where: { transactionId: id.toString(), gateway: 'CRYPTO' },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS', gatewayResponse: req.body, paidAt: new Date() },
        });

        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: 'PAID', paidAt: new Date() },
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('CoinGate callback error:', error);
    res.status(500).send('Error');
  }
});

// NOWPayments Callback
router.post('/crypto/nowpayments/callback', async (req: Request, res: Response) => {
  try {
    const { payment_status, order_id, payment_id } = req.body;

    // Verify IPN signature
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (ipnSecret) {
      const sortedParams = Object.keys(req.body).sort().reduce((acc, key) => {
        if (key !== 'payment_extra') acc[key] = req.body[key];
        return acc;
      }, {} as Record<string, unknown>);
      
      const hmac = crypto.createHmac('sha512', ipnSecret)
        .update(JSON.stringify(sortedParams))
        .digest('hex');
      
      if (hmac !== req.headers['x-nowpayments-sig']) {
        return res.status(400).send('Invalid signature');
      }
    }

    if (payment_status === 'finished' || payment_status === 'confirmed') {
      const payment = await prisma.payment.findFirst({
        where: { transactionId: payment_id, gateway: 'CRYPTO' },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS', gatewayResponse: req.body, paidAt: new Date() },
        });

        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: 'PAID', paidAt: new Date() },
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('NOWPayments callback error:', error);
    res.status(500).send('Error');
  }
});

// ============================================
// BANK TRANSFER ROUTES
// ============================================

router.post('/bank-transfer/create', async (req: Request, res: Response) => {
  try {
    const { invoiceId, region } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    }

    // Generate unique reference
    const reference = `SP-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Get bank account based on region
    let bankAccount: Record<string, string> = {};
    switch (region) {
      case 'eu':
        bankAccount = {
          bankName: process.env.BANK_EU_NAME || 'Meru Europe',
          iban: process.env.BANK_EU_IBAN || '',
          bic: process.env.BANK_EU_BIC || '',
          holderName: process.env.BANK_EU_HOLDER || '',
        };
        break;
      case 'us':
        bankAccount = {
          bankName: process.env.BANK_US_NAME || 'Meru USA',
          routingNumber: process.env.BANK_US_ROUTING || '',
          accountNumber: process.env.BANK_US_ACCOUNT || '',
          holderName: process.env.BANK_US_HOLDER || '',
        };
        break;
      case 'mx':
        bankAccount = {
          bankName: process.env.BANK_MX_NAME || 'Meru México',
          clabe: process.env.BANK_MX_CLABE || '',
          holderName: process.env.BANK_MX_HOLDER || '',
        };
        break;
      default:
        return res.status(400).json({ success: false, error: 'Región no válida' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        gateway: 'BANK_TRANSFER',
        transactionId: reference,
        amount: invoice.total,
        currency: invoice.currency,
        status: 'PENDING',
        gatewayResponse: { region, bankAccount, reference },
      },
    });

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        reference,
        bankAccount,
        amount: invoice.total,
        currency: invoice.currency,
      },
    });
  } catch (error) {
    console.error('Bank transfer create error:', error);
    res.status(500).json({ success: false, error: 'Error al crear transferencia bancaria' });
  }
});

// Admin: Confirm bank transfer
router.post('/bank-transfer/confirm', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { invoice: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Pago no encontrado' });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'SUCCESS', paidAt: new Date() },
    });

    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'PAID', paidAt: new Date() },
    });

    // Activate service
    const invoiceWithService = payment.invoice;
    if (invoiceWithService.serviceId) {
      await prisma.service.update({
        where: { id: invoiceWithService.serviceId },
        data: { status: 'ACTIVE' },
      });
    }

    res.json({ success: true, message: 'Pago confirmado correctamente' });
  } catch (error) {
    console.error('Bank transfer confirm error:', error);
    res.status(500).json({ success: false, error: 'Error al confirmar pago' });
  }
});

// ============================================
// STRIPE ROUTES
// ============================================

// Create Stripe Checkout Session
router.post('/stripe/create-session', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, error: 'Stripe no está configurado' });
    }

    const { invoiceId } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true, items: true },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    }

    // Create or get Stripe customer
    let stripeCustomerId = invoice.user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: invoice.user.email,
        name: `${invoice.user.firstName} ${invoice.user.lastName}`,
        metadata: { userId: invoice.user.id },
      });
      stripeCustomerId = customer.id;
      
      await prisma.user.update({
        where: { id: invoice.user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: invoice.items.map((item) => ({
        price_data: {
          currency: invoice.currency.toLowerCase(),
          product_data: {
            name: item.description,
          },
          unit_amount: Math.round(Number(item.unitPrice) * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/payment/cancel`,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      },
      client_reference_id: invoice.id,
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        gateway: 'STRIPE',
        transactionId: session.id,
        amount: invoice.total,
        currency: invoice.currency,
        status: 'PENDING',
        gatewayResponse: { sessionId: session.id },
      },
    });

    res.json({ 
      success: true, 
      data: { 
        sessionId: session.id, 
        url: session.url,
        publicKey: process.env.STRIPE_PUBLIC_KEY,
      } 
    });
  } catch (error) {
    console.error('Stripe create session error:', error);
    res.status(500).json({ success: false, error: 'Error al crear sesión de Stripe' });
  }
});

// Create Stripe Payment Intent (for embedded checkout)
router.post('/stripe/create-intent', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, error: 'Stripe no está configurado' });
    }

    const { invoiceId } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true },
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(invoice.total) * 100),
      currency: invoice.currency.toLowerCase(),
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        userId: invoice.user.id,
      },
      receipt_email: invoice.user.email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        gateway: 'STRIPE',
        transactionId: paymentIntent.id,
        amount: invoice.total,
        currency: invoice.currency,
        status: 'PENDING',
        gatewayResponse: { paymentIntentId: paymentIntent.id },
      },
    });

    res.json({ 
      success: true, 
      data: { 
        clientSecret: paymentIntent.client_secret,
        publicKey: process.env.STRIPE_PUBLIC_KEY,
      } 
    });
  } catch (error) {
    console.error('Stripe create intent error:', error);
    res.status(500).json({ success: false, error: 'Error al crear intención de pago' });
  }
});

// Stripe Webhook
router.post('/stripe/webhook', async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(503).json({ success: false, error: 'Stripe no está configurado' });
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    // For raw body parsing, ensure you have express.raw() middleware for this route
    const rawBody = req.body;
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret || '');
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoiceId = session.metadata?.invoiceId || session.client_reference_id;

        if (invoiceId) {
          const payment = await prisma.payment.findFirst({
            where: { invoiceId, gateway: 'STRIPE' },
          });

          if (payment) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { 
                status: 'SUCCESS', 
                gatewayResponse: session as unknown as Prisma.InputJsonValue,
                paidAt: new Date(),
              },
            });

            await prisma.invoice.update({
              where: { id: invoiceId },
              data: { status: 'PAID', paidAt: new Date() },
            });

            // Activate service
            const invoice = await prisma.invoice.findUnique({
              where: { id: invoiceId },
            });
            if (invoice?.serviceId) {
              await prisma.service.update({
                where: { id: invoice.serviceId },
                data: { status: 'ACTIVE' },
              });
            }
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const invoiceId = paymentIntent.metadata?.invoiceId;

        if (invoiceId) {
          const payment = await prisma.payment.findFirst({
            where: { transactionId: paymentIntent.id, gateway: 'STRIPE' },
          });

          if (payment && payment.status !== 'SUCCESS') {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { 
                status: 'SUCCESS', 
                gatewayResponse: paymentIntent as unknown as Prisma.InputJsonValue,
                paidAt: new Date(),
              },
            });

            await prisma.invoice.update({
              where: { id: invoiceId },
              data: { status: 'PAID', paidAt: new Date() },
            });

            // Activate service
            const invoice = await prisma.invoice.findUnique({
              where: { id: invoiceId },
            });
            if (invoice?.serviceId) {
              await prisma.service.update({
                where: { id: invoice.serviceId },
                data: { status: 'ACTIVE' },
              });
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const payment = await prisma.payment.findFirst({
          where: { transactionId: paymentIntent.id, gateway: 'STRIPE' },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { 
              status: 'FAILED', 
              gatewayResponse: paymentIntent as unknown as Prisma.InputJsonValue,
            },
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;
        
        const payment = await prisma.payment.findFirst({
          where: { transactionId: paymentIntentId, gateway: 'STRIPE' },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'REFUNDED' },
          });

          await prisma.invoice.update({
            where: { id: payment.invoiceId },
            data: { status: 'REFUNDED' },
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get Stripe payment status
router.get('/stripe/status/:sessionId', async (req: Request, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, error: 'Stripe no está configurado' });
    }

    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      success: true,
      data: {
        status: session.payment_status,
        customerEmail: session.customer_details?.email,
      },
    });
  } catch (error) {
    console.error('Stripe status error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener estado del pago' });
  }
});

export default router;
