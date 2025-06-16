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
    };

    if (data.couponCode) {
      subscriptionPayload.description += ` (Cupom: ${data.couponCode})`;
    }

    if (data.paymentMethod === 'CREDIT_CARD' && data.cardInfo) {
      // Check for an existing payment token first
      const existingPaymentMethod = await prisma.paymentMethod.findFirst({
        where: { userId: user.id, type: 'CREDIT_CARD' },
      });

      if (existingPaymentMethod?.creditCardToken) {
        console.log('[createSubscription] Found existing credit card token. Using token for payment.');
        subscriptionPayload.creditCardToken = existingPaymentMethod.creditCardToken;
      } else {
        console.log('[createSubscription] No existing token found. Using full credit card details.');

        if (!data.cardInfo.expiry || !data.cardInfo.expiry.includes('/')) {
          throw new Error('Formato da data de validade do cartão inválido. Use MM/YY.');
        }

        const [expiryMonth, expiryYear] = data.cardInfo.expiry.split('/');

        if (!expiryMonth || !expiryYear || expiryYear.length !== 2) {
          throw new Error('Formato da data de validade do cartão inválido. Use MM/YY.');
        }

        subscriptionPayload.creditCard = {
          holderName: data.cardInfo.name,
          number: data.cardInfo.number,
          expiryMonth: expiryMonth,
          expiryYear: `20${expiryYear}`,
          ccv: data.cardInfo.cvc,
        };

        subscriptionPayload.creditCardHolderInfo = {
          name: user.name || data.cardInfo.name,
          email: user.email,
          cpfCnpj: user.cpf,
          postalCode: data.address.cep.replace(/\D/g, ''),
          addressNumber: data.address.number,
          addressComplement: data.address.complement,
          phone: user.phone,
          mobilePhone: user.phone,
        };
      }
      subscriptionPayload.remoteIp = '127.0.0.1'; // Using a placeholder IP
    }

    console.log('[createSubscription] Asaas subscription payload:', {
      ...subscriptionPayload,
      creditCard: subscriptionPayload.creditCard ? { ...subscriptionPayload.creditCard, number: 'REDACTED', ccv: 'REDACTED'} : undefined
    });

    const subscription = await asaasClient.createSubscription(subscriptionPayload);
    console.log('[createSubscription] Asaas subscription created:', subscription);

    // 5. Determine initial insurance status
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
        case 'PENDING':
          insuranceStatus = 'PENDING_PAYMENT';
          break;
        default:
          insuranceStatus = 'PENDING_PAYMENT';
          break;
      }
    } else {
      insuranceStatus = 'PENDING';
    }

    // 6. Upsert Insurance Policy
    const userInsurancePolicy = await prisma.insurance.upsert({
      where: { userId: user.id },
      update: {
        plan: plan.name,
        status: insuranceStatus,
        planPriceSnapshot: Number(plan.price),
        asaasPaymentId: subscription.id, // Storing subscription ID here
        startDate: new Date(),
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

    // 7. Upsert PaymentMethod
    const firstPayment = subscription.payments?.[0];
    const creditCardInfo = firstPayment?.creditCard;

    if (data.paymentMethod === 'CREDIT_CARD' && creditCardInfo) {
      await prisma.paymentMethod.upsert({
        where: {
          userId_type_type: {
            userId: user.id,
            type: 'CREDIT_CARD',
          },
        },
        update: {
          lastFour: creditCardInfo.creditCardNumber,
          brand: creditCardInfo.creditCardBrand,
          holderName: data.cardInfo.name,
          creditCardToken: creditCardInfo.creditCardToken, // Save the new token
        },
        create: {
          userId: user.id,
          type: 'CREDIT_CARD',
          lastFour: creditCardInfo.creditCardNumber,
          brand: creditCardInfo.creditCardBrand,
          holderName: data.cardInfo.name,
          creditCardToken: creditCardInfo.creditCardToken, // Save the new token
        },
      });
    } else if (data.paymentMethod === 'BOLETO') {
      // Handle boleto payment method creation if needed
      await prisma.paymentMethod.upsert({
        where: {
          userId_type_type: {
            userId: user.id,
            type: 'BOLETO',
          },
        },
        update: {},
        create: {
          userId: user.id,
          type: 'BOLETO',
        },
      });
    }

    // Find the relevant payment method ID for the transaction
    const paymentMethodRecord = await prisma.paymentMethod.findFirst({
      where: { userId: user.id, type: data.paymentMethod },
    });

    if (!paymentMethodRecord) {
      throw new Error('Payment method record not found for transaction creation.');
    }

    // 8. Create Transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        insuranceId: userInsurancePolicy.id,
        paymentMethodId: paymentMethodRecord.id,
        transactionId: firstPayment?.id || subscription.id, // Use first payment ID if available
        status: firstPayment?.status || subscription.status,
        amount: Number(data.finalAmount),
        couponCode: data.couponCode || null,
        type: data.paymentMethod,
        paymentDetails: JSON.stringify(subscription), // Store the whole subscription object
        planNameSnapshot: plan.name,
        planPriceSnapshot: Number(plan.price),
        boletoUrl: firstPayment?.bankSlipUrl || firstPayment?.invoiceUrl,
        boletoCode: firstPayment?.barCode || null,
      },
    });

    // Return the first payment object if it exists, or the subscription details
    return firstPayment || subscription;

  } catch (error: any) {
    console.error('!!! Asaas Subscription Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    const errorMessage = error.response?.data?.errors?.[0]?.description || error.message || 'Unknown error';
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