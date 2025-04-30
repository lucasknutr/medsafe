import { createClient } from '@supabase/supabase-js';
import prisma from '@/app/lib/prisma';

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// This file will be used for payment-related Asaas functions
// We'll add payment functions here when needed

interface PaymentData {
  planId: string;
  customerId: string;
  paymentMethod: 'BOLETO' | 'CREDIT_CARD';
  cardInfo?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
    cpfCnpj?: string;
    phone?: string;
    email?: string;
    postalCode?: string;
    addressNumber?: string;
    addressComplement?: string | null;
    mobilePhone?: string;
    remoteIp?: string;
  };
}

export async function createPayment(data: PaymentData) {
  try {
    const asaasApiKey = process.env.ASAAS_API_KEY;
    if (!asaasApiKey) {
      throw new Error('Missing ASAAS_API_KEY environment variable');
    }

    // Get plan details from Prisma
    const plan = await prisma.insurancePlan.findUnique({
      where: { id: data.planId },
    });
    if (!plan) throw new Error('Plano não encontrado');

    // Get user (customer) details from Prisma
    let user = await prisma.user.findUnique({
      where: { id: Number(data.customerId) },
    });
    if (!user) {
      // Try to find user by email if not found by ID
      user = await prisma.user.findUnique({
        where: { email: data.customerId },
      });
    }
    if (!user) throw new Error('Usuário não encontrado');

    // Prepare payment data for Asaas
    const paymentData: any = {
      customer: user.asaasCustomerId,
      billingType: data.paymentMethod,
      value: plan.price,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `Plano de Seguro: ${plan.name}`,
      externalReference: data.planId,
    };

    if (data.paymentMethod === 'CREDIT_CARD' && data.cardInfo) {
      paymentData.creditCard = {
        holderName: data.cardInfo.holderName,
        number: data.cardInfo.number,
        expiryMonth: data.cardInfo.expiryMonth,
        expiryYear: data.cardInfo.expiryYear,
        ccv: data.cardInfo.ccv,
      };
      paymentData.creditCardHolderInfo = {
        name: data.cardInfo.holderName,
        email: data.cardInfo.email || user.email,
        cpfCnpj: data.cardInfo.cpfCnpj || user.cpf,
        postalCode: data.cardInfo.postalCode || user.zip_code,
        addressNumber: data.cardInfo.addressNumber || '',
        addressComplement: data.cardInfo.addressComplement || '',
        phone: data.cardInfo.phone || user.phone,
        mobilePhone: data.cardInfo.mobilePhone || user.phone,
      };
      if (data.cardInfo.remoteIp) {
        paymentData.remoteIp = data.cardInfo.remoteIp;
      }
    }

    const response = await fetch('https://api.asaas.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${asaasApiKey}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao processar pagamento');
    }

    const payment = await response.json();

    // Save payment info to user's transactions in Prisma
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: Math.round(plan.price * 100), // ASAAS expects cents as int
        status: payment.status,
        type: data.paymentMethod,
        transactionId: payment.id,
        boletoUrl: payment.bankSlipUrl || payment.invoiceUrl,
        boletoCode: payment.barCode || null,
        createdAt: new Date(payment.dateCreated || Date.now()),
        updatedAt: new Date(),
      },
    });

    // Optionally, save credit card token if present
    if (payment.creditCardToken) {
      await prisma.paymentMethod.upsert({
        where: {
          userId_type_type: {
            userId: user.id,
            type: 'CREDIT_CARD',
          },
        },
        update: {
          lastFour: payment.creditCardNumber,
          brand: payment.creditCardBrand,
          holderName: data.cardInfo?.holderName,
          expiryMonth: data.cardInfo?.expiryMonth,
          expiryYear: data.cardInfo?.expiryYear,
        },
        create: {
          userId: user.id,
          type: 'CREDIT_CARD',
          lastFour: payment.creditCardNumber,
          brand: payment.creditCardBrand,
          holderName: data.cardInfo?.holderName,
          expiryMonth: data.cardInfo?.expiryMonth,
          expiryYear: data.cardInfo?.expiryYear,
          isDefault: true,
        },
      });
    }

    return payment;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

export async function getPaymentStatus(paymentId: string) {
  try {
    const asaasApiKey = process.env.ASAAS_API_KEY;
    if (!asaasApiKey) {
      throw new Error('Missing ASAAS_API_KEY environment variable');
    }

    const response = await fetch(`https://api.asaas.com/v3/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${asaasApiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar status do pagamento');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
}

// Webhook handler for payment status updates
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