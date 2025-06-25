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
      value: data.finalAmount,
      nextDueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // Next payment in 30 days
      cycle: 'MONTHLY',
      description: `Assinatura do plano ${plan.name} - MedSafe`,
      remoteIp: data.remoteIp,
    };

    if (data.couponCode) {
      subscriptionPayload.description += ` (Cupom: ${data.couponCode})`;
    }

    if (data.paymentMethod === 'CREDIT_CARD' && data.cardInfo) {
      // Validate expiry date format MM/YY
      if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(data.cardInfo.expiry)) {
        throw new Error('Formato da data de validade do cartão inválido. Use MM/AA.');
      }

      // Use existing token if available
      const existingPaymentMethod = await prisma.paymentMethod.findFirst({
        where: { userId: user.id, type: 'CREDIT_CARD' },
      });

      let asaasToken: string | undefined = existingPaymentMethod?.creditCardToken || undefined;

      if (!asaasToken) {
        console.log('[createSubscription] No existing token found. Tokenizing new card...');
        // Tokenize the card via direct axios call
        const tokenizationResponse = await axios.post(
          'https://api.asaas.com/v3/creditCard/tokenize',
          {
            customer: asaasCustomerId,
            creditCard: {
              holderName: data.cardInfo.name,
              number: data.cardInfo.number,
              expiryMonth: data.cardInfo.expiry.split('/')[0],
              expiryYear: '20' + data.cardInfo.expiry.split('/')[1],
              ccv: data.cardInfo.cvc,
            },
            creditCardHolderInfo: {
              name: data.cardInfo.name,
              email: user.email,
              cpfCnpj: user.cpf || '',
              postalCode: data.address.cep.replace(/\D/g, ''),
              addressNumber: data.address.number,
              phone: user.phone || '',
            },
            remoteIp: data.remoteIp,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              access_token: process.env.ASAAS_API_KEY,
            },
          }
        );

        asaasToken = tokenizationResponse.data.creditCardToken;
        console.log('[createSubscription] Card tokenized successfully. Token:', asaasToken);
      } else {
        console.log('[createSubscription] Using existing token:', asaasToken);
      }

      if (!asaasToken) {
        throw new Error('Falha ao obter o token do cartão de crédito.');
      }

      subscriptionPayload.creditCardToken = asaasToken;
    }

    // 5. Create Subscription in Asaas
    console.log('[createSubscription] Creating Asaas subscription with payload:', {
      ...subscriptionPayload,
      creditCardToken: 'REDACTED',
    });

    const subscription = await asaasClient.createSubscription(subscriptionPayload);
    console.log('[createSubscription] Asaas subscription created successfully:', { id: subscription.id, status: subscription.status });

    // 6. Determine initial insurance status
    let insuranceStatus: string;
    const firstPaymentStatus = subscription.payments?.[0]?.status || subscription.status;

    if (subscription.billingType === 'BOLETO') {
      insuranceStatus = 'PENDING_PAYMENT';
    } else if (subscription.billingType === 'CREDIT_CARD') {
      switch (firstPaymentStatus) {
        case 'CONFIRMED':
        case 'RECEIVED':
        case 'RECEIVED_IN_CASH':
          insuranceStatus = 'PENDING_DOCUMENT';
          break;
        default:
          insuranceStatus = 'PENDING_PAYMENT';
          break;
      }
    } else {
      insuranceStatus = 'PENDING';
    }

    // 7. Create or Update Insurance Policy
    console.log(`[createSubscription] Upserting insurance policy for user ${user.id} with status: ${insuranceStatus}`);
    const userInsurancePolicy = await prisma.insurance.upsert({
      where: { userId: user.id },
      update: {
        plan: plan.name,
        status: insuranceStatus,
        planPriceSnapshot: Number(plan.price),
        asaasPaymentId: subscription.id, // Storing subscription ID here
      },
      create: {
        userId: user.id,
        plan: plan.name,
        status: insuranceStatus,
        planPriceSnapshot: Number(plan.price),
        asaasPaymentId: subscription.id,
        startDate: new Date(),
      },
    });

    // 8. Upsert PaymentMethod and Create Transaction
    let paymentMethodRecord;
    const firstPayment = subscription.payments?.[0];

    if (data.paymentMethod === 'CREDIT_CARD' && subscription.creditCard) {
      const creditCardInfo = subscription.creditCard;
      paymentMethodRecord = await prisma.paymentMethod.upsert({
        where: {
          userId_type_type: { userId: user.id, type: 'CREDIT_CARD' },
        },
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
        where: {
          userId_type_type: { userId: user.id, type: 'BOLETO' },
        },
        update: {},
        create: {
          userId: user.id,
          type: 'BOLETO',
        },
      });
    }

    if (!paymentMethodRecord) {
      console.error('[createSubscription] CRITICAL: Failed to upsert and retrieve payment method record.');
      throw new Error('Payment method record not found for transaction creation.');
    }

    // 9. Create Transaction
    console.log(`[createSubscription] Creating transaction record for user ${user.id} and policy ${userInsurancePolicy.id}`);
    const newTransaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        insuranceId: userInsurancePolicy.id,
        paymentMethodId: paymentMethodRecord.id,
        transactionId: firstPayment?.id || subscription.id,
        status: firstPayment?.status || subscription.status,
        amount: Number(data.finalAmount),
        couponCode: data.couponCode || null,
        type: data.paymentMethod,
        paymentDetails: subscription, // Pass the object directly for Prisma's Json type
        planNameSnapshot: plan.name,
        planPriceSnapshot: Number(plan.price),
        boletoUrl: firstPayment?.bankSlipUrl || firstPayment?.invoiceUrl,
        boletoCode: firstPayment?.barCode || null,
      },
    });

    console.log('[createSubscription] Transaction created successfully:', { id: newTransaction.id });

    // Return the first payment object which contains details like the boleto link
    return firstPayment || subscription;

  } catch (error: any) {
    console.error('!!! Asaas Subscription Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    let errorMessage = 'Falha ao criar assinatura no Asaas.';
    if (error.response?.data?.errors?.[0]?.description) {
      errorMessage = error.response.data.errors[0].description;
    }
    throw new Error(`Falha ao criar assinatura no Asaas: ${errorMessage}`);
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