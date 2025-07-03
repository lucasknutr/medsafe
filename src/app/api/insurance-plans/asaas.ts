import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { getAsaasClient } from '@/lib/asaas';

const prisma = new PrismaClient();

// This file will be used for payment-related Asaas functions
// We'll add payment functions here when needed

interface PaymentData {
  planId: string;
  customerId: number | string; // Can be user ID (number) or email (string)
  paymentMethod: 'BOLETO' | 'CREDIT_CARD';
  finalAmount: number; // The actual amount to be charged
  originalAmount?: number; // The original plan price before discount
  couponCode?: string; // The coupon code applied
  cardInfo?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
    email?: string;
    cpfCnpj?: string;
    postalCode?: string;
    addressNumber?: string;
    addressComplement?: string;
    phone?: string;
    mobilePhone?: string;
    remoteIp?: string;
  };
}

interface CreateSubscriptionData {
  planId: string;
  customerId: number | string;
  paymentMethod: 'CREDIT_CARD' | 'BOLETO' | 'PIX';
  cardInfo?: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    holderName: string;
  };
  finalAmount: number;
  originalAmount: number;
  couponCode?: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    phone?: string;
  };
  remoteIp?: string;
}

interface AsaasPaymentResponse {
  id: string;
  status: string;
  billingType: string;
  value: number;
  netValue?: number;
  dateCreated?: string;
  customer?: string;
  dueDate?: string;
  invoiceUrl?: string; 
  bankSlipUrl?: string; 
  barCode?: string; // For Boleto
  creditCardToken?: string; // For Credit Card
  creditCardNumber?: string; // Last 4 digits
  creditCardBrand?: string;
  // ... other fields returned by Asaas
}

export async function createSubscription(data: CreateSubscriptionData): Promise<any> {
  const asaasClient = getAsaasClient();
  const prisma = new PrismaClient();
  const { customerId, planId, paymentMethod, couponCode, cardInfo, address, remoteIp } = data;

  try {
    // 1. Fetch User and Plan details
    const userId = parseInt(String(customerId), 10);
    if (isNaN(userId)) {
      throw new Error('Invalid user ID format');
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const plan = await prisma.insurancePlan.findUnique({ where: { id: planId } });
    if (!user || !plan) throw new Error('User or Plan not found.');

    // 2. Get or Create Asaas Customer
    let asaasCustomerId = user.asaasCustomerId;
    if (!asaasCustomerId) {
      const customer = await asaasClient.createCustomer({ name: user.name, email: user.email, cpfCnpj: user.cpf, phone: user.phone });
      asaasCustomerId = customer.id;
      await prisma.user.update({ where: { id: userId }, data: { asaasCustomerId } });
    }

    let initialPayment: any;
    let subscription: any;
    let insuranceStatus: string;

    if (paymentMethod === 'CREDIT_CARD') {
      // For Credit Cards: First, create an immediate one-time payment.
      if (!cardInfo || !address) throw new Error('Card info or address is missing.');

      const paymentPayload = {
        customer: asaasCustomerId,
        billingType: 'CREDIT_CARD',
        value: parseFloat(data.finalAmount.toFixed(2)),
        dueDate: new Date().toISOString().split('T')[0],
        description: `Pagamento inicial do plano ${plan.name} - MedSafe${couponCode ? ` (Cupom: ${couponCode})` : ''}`,
        creditCard: {
          holderName: cardInfo.holderName,
          number: cardInfo.number.replace(/\D/g, ''),
          expiryMonth: cardInfo.expiryMonth,
          expiryYear: cardInfo.expiryYear,
          ccv: cardInfo.cvc,
        },
        creditCardHolderInfo: {
          name: cardInfo.holderName,
          email: user.email,
          cpfCnpj: user.cpf?.replace(/\D/g, '') || '',
          postalCode: address.cep.replace(/\D/g, ''),
          addressNumber: address.number,
          addressComplement: address.complement || null,
          phone: address.phone?.replace(/\D/g, '') || '',
          mobilePhone: address.phone?.replace(/\D/g, '') || '',
        },
        remoteIp,
      };

      console.log('[createSubscription] Creating initial credit card payment with payload:', { ...paymentPayload, creditCard: 'REDACTED' });
      const paymentResponse = await axios.post(`https://api.asaas.com/v3/payments`, paymentPayload, {
        headers: { 'Content-Type': 'application/json', access_token: process.env.ASAAS_API_KEY },
      });
      initialPayment = paymentResponse.data;
      console.log('[createSubscription] Initial payment response:', initialPayment);

      if (initialPayment.status !== 'CONFIRMED' && initialPayment.status !== 'RECEIVED') {
        throw new Error(`Pagamento com cartão de crédito falhou. Status: ${initialPayment.status}`);
      }

      insuranceStatus = 'ACTIVE';

      // Now, create the subscription for future payments using the token from the initial charge.
      const subscriptionPayload = {
        customer: asaasCustomerId,
        billingType: 'CREDIT_CARD',
        value: parseFloat(data.finalAmount.toFixed(2)),
        nextDueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: `Assinatura do plano ${plan.name} - MedSafe${couponCode ? ` (Cupom: ${couponCode})` : ''}`,
        creditCardToken: initialPayment.creditCard.creditCardToken,
      };

      console.log('[createSubscription] Creating subscription with token...');
      subscription = await asaasClient.createSubscription(subscriptionPayload);
      console.log('[createSubscription] Subscription created successfully:', subscription);

    } else {
      // For BOLETO: Use the existing subscription flow.
      const subscriptionPayload: any = {
        customer: asaasCustomerId,
        billingType: 'BOLETO',
        value: parseFloat(data.finalAmount.toFixed(2)),
        nextDueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: `Assinatura do plano ${plan.name} - MedSafe${couponCode ? ` (Cupom: ${couponCode})` : ''}`,
        remoteIp,
      };
      
      console.log('[createSubscription] Creating BOLETO subscription...');
      subscription = await asaasClient.createSubscription(subscriptionPayload);
      insuranceStatus = 'PENDING_PAYMENT';
      
      // Fetch the payment details to get the boleto URL
      try {
        await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for Asaas to generate payment
        const paymentsResponse = await axios.get(`https://api.asaas.com/v3/subscriptions/${subscription.id}/payments`, {
          headers: { 'Content-Type': 'application/json', access_token: process.env.ASAAS_API_KEY },
        });
        if (paymentsResponse.data?.data?.length > 0) {
          initialPayment = paymentsResponse.data.data[0];
        }
      } catch (fetchError) {
        console.error(`!!! Asaas Fetch Payments Error for BOLETO:`, fetchError);
      }
    }

    // Database Operations
    const userInsurancePolicy = await prisma.insurance.upsert({
      where: { userId: userId },
      update: { plan: plan.name, status: insuranceStatus, asaasPaymentId: subscription.id },
      create: { userId: userId, plan: plan.name, status: insuranceStatus, asaasPaymentId: subscription.id },
    });

    const paymentMethodRecord = await prisma.paymentMethod.upsert({
      where: { userId_type_type: { userId: userId, type: paymentMethod } },
      update: paymentMethod === 'CREDIT_CARD' ? {
        creditCardToken: initialPayment.creditCard.creditCardToken,
        lastFour: initialPayment.creditCard.creditCardNumber.slice(-4),
        brand: initialPayment.creditCard.creditCardBrand,
        holderName: initialPayment.creditCard.holderName,
      } : {},
      create: {
        userId: userId,
        type: paymentMethod,
        creditCardToken: initialPayment?.creditCard?.creditCardToken,
        lastFour: initialPayment?.creditCard?.creditCardNumber.slice(-4),
        brand: initialPayment?.creditCard?.creditCardBrand,
        holderName: initialPayment?.creditCard?.holderName,
      },
    });

    await prisma.transaction.create({
      data: {
        userId: userId,
        insuranceId: userInsurancePolicy.id,
        paymentMethodId: paymentMethodRecord.id,
        amount: data.finalAmount,
        transactionId: initialPayment?.id || subscription.id,
        status: initialPayment?.status || 'PENDING',
        type: paymentMethod,
        couponCode: couponCode || null,
        paymentDetails: JSON.stringify(initialPayment || subscription),
        boletoUrl: initialPayment?.bankSlipUrl || null,
      },
    });

    const paymentResult = {
      ...(initialPayment || subscription),
      bankSlipUrl: initialPayment?.bankSlipUrl || null,
    };

    console.log('[createSubscription] Returning payment object to frontend:', JSON.stringify(paymentResult, null, 2));
    return paymentResult;

  } catch (error: any) {
    console.error('!!! Asaas Operation Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    throw error;
  }
}

export async function createPayment(data: CreateSubscriptionData) {
  // All payments should now be subscriptions
  console.log('[createPayment] Routing to createSubscription...');
  return createSubscription(data);
}

export async function getPaymentStatus(paymentId: string) {
  const asaasClient = getAsaasClient();
  try {
    // For a subscription, you might want to fetch the subscription status
    // or the status of the latest charge in that subscription.
    // Here we assume paymentId could be a charge ID.
    const response = await axios.get(`${asaasClient['apiUrl']}/payments/${paymentId}`, {
      headers: asaasClient['headers'],
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching payment status for ${paymentId}:`, error.response?.data || error.message);
    throw new Error('Failed to get payment status from Asaas');
  }
}

export async function handlePaymentWebhook(payload: any) {
  try {
    const { paymentId, status } = payload;

    // Update payment status in Prisma
    await prisma.transaction.updateMany({
      where: { transactionId: paymentId },
      data: { status },
    });

    return { success: true };
  } catch (error) {
    console.error('Error handling payment webhook:', error);
    throw error;
  }
}

export async function createAsaasPlan(planData: {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}) {
  try {
    const asaasApiKey = process.env.ASAAS_API_KEY;
    if (!asaasApiKey) {
      throw new Error('Missing ASAAS_API_KEY environment variable');
    }

    console.log('Creating Asaas plan with data:', {
      id: planData.id,
      name: planData.name,
      description: planData.description,
      price: planData.price,
      features: planData.features,
    });

    // Create payment plan in Asaas
    const response = await fetch('https://api.asaas.com/v3/plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${asaasApiKey}`,
      },
      body: JSON.stringify({
        name: planData.name,
        description: planData.description,
        value: planData.price,
        billingCycle: 'MONTHLY',
        billingCycleQuantity: 1,
        billingCycleType: 'FIXED',
        status: 'ACTIVE',
        metadata: {
          features: JSON.stringify(planData.features),
        },
      }),
    });

    console.log('Asaas API response status:', response.status);
    console.log('Asaas API response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw Asaas API response:', responseText);

    if (!response.ok) {
      try {
        const error = JSON.parse(responseText);
        console.error('Asaas API error details:', {
          status: response.status,
          statusText: response.statusText,
          error: error,
        });
        throw new Error(error.message || 'Failed to create Asaas plan');
      } catch (parseError) {
        console.error('Failed to parse Asaas error response:', {
          status: response.status,
          statusText: response.statusText,
          rawResponse: responseText,
          parseError: parseError,
        });
        throw new Error(`Asaas API error: ${response.status} ${response.statusText}`);
      }
    }

    try {
      const asaasPlan = JSON.parse(responseText);
      console.log('Asaas plan created:', asaasPlan);

      // Store Asaas plan ID in Prisma
      await prisma.insurancePlan.update({
        where: { id: planData.id },
        data: { asaasPlanId: asaasPlan.id as string },
      });

      return asaasPlan;
    } catch (parseError) {
      console.error('Failed to parse Asaas success response:', parseError);
      throw new Error('Invalid response from Asaas API');
    }
  } catch (error) {
    console.error('Error creating Asaas plan:', error);
    throw error;
  }
}

export async function deleteAsaasPlan(asaasPlanId: string) {
  try {
    const asaasApiKey = process.env.ASAAS_API_KEY;
    if (!asaasApiKey) {
      throw new Error('Missing ASAAS_API_KEY environment variable');
    }

    console.log('Using Asaas API key:', asaasApiKey.substring(0, 8) + '...'); // Log first 8 chars for debugging

    const response = await fetch(`https://api.asaas.com/v3/plans/${asaasPlanId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${asaasApiKey}`,
      },
    });

    const responseText = await response.text();
    console.log('Raw Asaas API response:', responseText);

    if (!response.ok) {
      try {
        const error = JSON.parse(responseText);
        console.error('Asaas API error:', error);
        throw new Error(error.message || 'Failed to delete Asaas plan');
      } catch (parseError) {
        console.error('Failed to parse Asaas error response:', parseError);
        throw new Error(`Asaas API error: ${response.status} ${response.statusText}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Error deleting Asaas plan:', error);
    throw error;
  }
}