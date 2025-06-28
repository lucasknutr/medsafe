import { PrismaClient } from '@prisma/client';
import { getAsaasClient } from '@/lib/asaas';
import axios from 'axios';

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
  customerId: string | number;
  paymentMethod: 'CREDIT_CARD' | 'BOLETO' | 'PIX';
  cardInfo?: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
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

export async function createSubscription(data: CreateSubscriptionData) {
  const logData = { ...data, cardInfo: 'REDACTED' };
  console.log('[createSubscription] Starting subscription creation with data:', JSON.stringify(logData, null, 2));
  const asaasClient = getAsaasClient();

  try {
    // 1. Get Plan Details
    console.log(`[createSubscription] Fetching plan with ID: ${data.planId}`);
    const plan = await prisma.insurancePlan.findUnique({
      where: { id: data.planId },
    });
    if (!plan) {
      console.error(`[createSubscription] Plan not found for ID: ${data.planId}`);
      throw new Error('Plano não encontrado');
    }
    console.log('[createSubscription] Plan details:', plan);

    // 2. Get User Detaeils
    let userIdentifier: { id: number } | { email: string };
    if (typeof data.customerId === 'string' && data.customerId.includes('@')) {
        userIdentifier = { email: data.customerId };
    } else {
        // Convert the string ID from the cookie to an integer for the Prisma query.
        const userId = parseInt(String(data.customerId), 10);
        if (isNaN(userId)) {
            throw new Error('Invalid user ID format');
        }
        userIdentifier = { id: userId };
    }

    console.log('[createSubscription] Fetching user with identifier:', userIdentifier);
    const user = await prisma.user.findUnique({ where: userIdentifier as any });

    if (!user) {
      console.error(`[createSubscription] User not found for identifier: ${JSON.stringify(userIdentifier)}`);
      throw new Error('Usuário não encontrado');
    }
    console.log('[createSubscription] User details:', { id: user.id, email: user.email, name: user.name, asaasCustomerId: user.asaasCustomerId });

    // Create or Retrieve Asaas Customer, and UPDATE their address
    let asaasCustomerId = user.asaasCustomerId;
    if (!asaasCustomerId) {
      console.log('[createSubscription] Asaas customer ID not found, creating new Asaas customer for user:', user.id);
      
      if (!user.cpf) {
        console.error(`[createSubscription] Cannot create Asaas customer for user ${user.id}: Missing CPF.`);
        throw new Error('CPF do usuário é necessário para criar cliente Asaas.');
      }
      if (!user.phone) {
        console.error(`[createSubscription] Cannot create Asaas customer for user ${user.id}: Missing Phone.`);
        throw new Error('Telefone do usuário é necessário para criar cliente Asaas.');
      }

      const customerPayload = {
        name: user.name || 'Nome não fornecido',
        email: user.email,
        cpfCnpj: user.cpf, 
        phone: user.phone, 
        postalCode: data.address.cep.replace(/\D/g, ''),
        address: data.address.street,
        addressNumber: data.address.number,
        complement: data.address.complement,
        province: data.address.neighborhood,
      };
      console.log('[createSubscription] Creating Asaas customer with payload:', customerPayload);
      const asaasCustomer = await asaasClient.createCustomer(customerPayload);
      asaasCustomerId = asaasCustomer.id;
      console.log('[createSubscription] Asaas customer created with ID:', asaasCustomerId, 'Updating user record.');
      await prisma.user.update({
        where: { id: user.id },
        data: { asaasCustomerId },
      });
    } else {
      console.log('[createSubscription] Found existing Asaas customer ID:', asaasCustomerId, 'for user:', user.id);
      // Update the existing customer's address before payment
      console.log(`[createSubscription] Updating Asaas customer ${asaasCustomerId} with new address.`);
      try {
        const updatePayload = {
          postalCode: data.address.cep.replace(/\D/g, ''),
          address: data.address.street,
          addressNumber: data.address.number,
          complement: data.address.complement,
          province: data.address.neighborhood,
        };
        await axios.post(`${asaasClient['apiUrl']}/customers/${asaasCustomerId}`, updatePayload, {
          headers: asaasClient['headers'],
        });
        console.log(`[createSubscription] Successfully updated address for Asaas customer ${asaasCustomerId}.`);
      } catch (updateError: any) {
        console.error(`[createSubscription] Failed to update Asaas customer address:`, updateError.response?.data || updateError.message);
      }
    }

    // 4. Prepare Subscription Payload for Asaas
    const subscriptionPayload: any = {
      customer: asaasCustomerId,
      billingType: data.paymentMethod === 'BOLETO' ? 'BOLETO' : 'CREDIT_CARD',
      value: parseFloat(data.finalAmount.toFixed(2)), // Fix: Round to 2 decimal places
      nextDueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // Next payment in 30 days
      cycle: 'MONTHLY',
      description: `Assinatura do plano ${plan.name} - MedSafe${data.couponCode ? ` (Cupom: ${data.couponCode})` : ''}`,
      remoteIp: data.remoteIp,
    };

    // If payment is by credit card, embed the card details directly to force an immediate charge.
    if (data.paymentMethod === 'CREDIT_CARD') {
      if (!data.cardInfo) {
        throw new Error('Credit card information is missing.');
      }
      subscriptionPayload.creditCard = {
        holderName: data.cardInfo.name,
        number: data.cardInfo.number.replace(/\D/g, ''),
        expiryMonth: data.cardInfo.expiry.split('/')[0],
        expiryYear: '20' + data.cardInfo.expiry.split('/')[1],
        ccv: data.cardInfo.cvc,
      };
      subscriptionPayload.creditCardHolderInfo = {
        name: data.cardInfo.name,
        email: user.email,
        cpfCnpj: user.cpf?.replace(/\D/g, '') || '',
        postalCode: data.address.cep.replace(/\D/g, ''),
        addressNumber: data.address.number,
        addressComplement: data.address.complement || null,
        phone: user.phone?.replace(/\D/g, '') || '',
        mobilePhone: user.phone?.replace(/\D/g, '') || '',
      };
    }

    // 5. Create Subscription in Asaas
    console.log('[createSubscription] Creating Asaas subscription with payload:', {
      ...subscriptionPayload,
      creditCard: 'REDACTED',
    });

    const subscription = await asaasClient.createSubscription(subscriptionPayload);
    console.log('[createSubscription] Asaas subscription created successfully:', { id: subscription.id, status: subscription.status });

    let firstPayment = subscription.payments?.[0];

    // For BOLETO, we must fetch the payment URL. For Credit Card, we proceed immediately to avoid timeouts.
    if (subscription.billingType === 'BOLETO') {
      console.log(`[createSubscription] BOLETO subscription created. Fetching payment details for sub ID: ${subscription.id}`);
      try {
        // Asaas may take a moment to generate the payment, so we wait briefly before fetching.
        const delay = 4000; // 4s delay
        console.log(`[createSubscription] Waiting for ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));

        const paymentsResponse = await axios.get(
          `https://api.asaas.com/v3/subscriptions/${subscription.id}/payments`,
          {
            headers: {
              'Content-Type': 'application/json',
              access_token: process.env.ASAAS_API_KEY,
            },
          }
        );
        
        if (paymentsResponse.data?.data?.length > 0) {
          firstPayment = paymentsResponse.data.data[0];
          console.log('[createSubscription] Successfully fetched first payment object:', JSON.stringify(firstPayment, null, 2));
        } else {
          console.error(`[createSubscription] CRITICAL: No payments found for BOLETO subscription after delay.`);
        }
      } catch (fetchError: any) {
        console.error(`!!! Asaas Fetch Payments Error for BOLETO:`, fetchError.response ? JSON.stringify(fetchError.response.data, null, 2) : fetchError.message);
        // Continue without throwing, the frontend will handle the missing URL or status
      }
    }

    // 6. Determine initial insurance status
    let insuranceStatus: string;
    const firstPaymentStatus = firstPayment?.status || subscription.status;

    if (subscription.billingType === 'BOLETO') {
      insuranceStatus = 'PENDING_PAYMENT';
    } else if (subscription.billingType === 'CREDIT_CARD') {
      switch (firstPaymentStatus) {
        case 'CONFIRMED':
        case 'RECEIVED':
          insuranceStatus = 'ACTIVE';
          break;
        default:
          insuranceStatus = 'PENDING_PAYMENT';
          break;
      }
    } else {
      insuranceStatus = 'PENDING';
    }

    // 7. Upsert Insurance Policy
    console.log(`[createSubscription] Upserting insurance policy for user ${user.id} with status: ${insuranceStatus}`);
    const userInsurancePolicy = await prisma.insurance.upsert({
      where: { userId: user.id },
      update: {
        plan: plan.name,
        status: insuranceStatus,
        asaasPaymentId: subscription.id, // Correct field from schema
      },
      create: {
        userId: user.id,
        plan: plan.name,
        status: insuranceStatus,
        asaasPaymentId: subscription.id, // Correct field from schema
      },
    });

    // 8. Upsert PaymentMethod to link to the transaction
    let paymentMethodRecord;
    if (data.paymentMethod === 'CREDIT_CARD' && subscription.creditCard) {
      const creditCardInfo = subscription.creditCard;
      paymentMethodRecord = await prisma.paymentMethod.upsert({
        where: { userId_type_type: { userId: user.id, type: 'CREDIT_CARD' } }, // Correct unique identifier
        update: {
          creditCardToken: creditCardInfo.creditCardToken,
          lastFour: creditCardInfo.creditCardNumber.slice(-4),
          brand: creditCardInfo.creditCardBrand,
          holderName: data.cardInfo.name,
        },
        create: {
          userId: user.id,
          type: 'CREDIT_CARD',
          creditCardToken: creditCardInfo.creditCardToken,
          lastFour: creditCardInfo.creditCardNumber.slice(-4),
          brand: creditCardInfo.creditCardBrand,
          holderName: data.cardInfo.name,
        },
      });
    } else if (data.paymentMethod === 'BOLETO') {
      paymentMethodRecord = await prisma.paymentMethod.upsert({
        where: { userId_type_type: { userId: user.id, type: 'BOLETO' } }, // Correct unique identifier
        update: {},
        create: { userId: user.id, type: 'BOLETO' },
      });
    }

    if (!paymentMethodRecord) {
      throw new Error('Failed to create or find payment method for transaction.');
    }

    // 9. Create Transaction Record
    console.log(`[createSubscription] Creating transaction record for user ${user.id} and policy ${userInsurancePolicy.id}`);
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        insuranceId: userInsurancePolicy.id,
        paymentMethodId: paymentMethodRecord.id, // Link to the payment method
        amount: data.finalAmount,
        transactionId: firstPayment?.id || subscription.id,
        status: firstPaymentStatus,
        type: data.paymentMethod,
        couponCode: data.couponCode || null,
        paymentDetails: JSON.stringify(firstPayment || subscription),
        boletoUrl: firstPayment?.bankSlipUrl || null,
      },
    });
    console.log('[createSubscription] Transaction record created successfully:', { id: transaction.id });

    // 10. Return the first payment object to the frontend
    const paymentResult = {
      ...(firstPayment || subscription),
      bankSlipUrl: firstPayment?.bankSlipUrl || null, // Ensure bankSlipUrl is included
    };

    console.log('[createSubscription] Returning payment object to frontend:', JSON.stringify(paymentResult, null, 2));
    return paymentResult; // Return the object directly

  } catch (error: any) {
    console.error('!!! Asaas Subscription Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    // Re-throw the error to be caught by the main POST handler
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