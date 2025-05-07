import { createClient } from '@supabase/supabase-js';
import prisma from '@/app/lib/prisma';
import { getAsaasClient } from '@/lib/asaas'; // Assuming getAsaasClient is defined elsewhere

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
  customerId: number | string; // Can be user ID (number) or email (string)
  paymentMethod: 'BOLETO' | 'CREDIT_CARD';
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

interface AsaasCustomerData {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  // Add other relevant fields like address, etc.
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

export async function createPayment(data: PaymentData) {
  // Sanitize cardInfo for logging
  const logData = { ...data };
  if (logData.cardInfo && typeof logData.cardInfo.number === 'string') {
    logData.cardInfo = {
      ...logData.cardInfo,
      number: '**** **** **** ' + logData.cardInfo.number.slice(-4),
      ccv: '***',
    };
  }
  console.log('[createPayment] Starting payment creation with data:', JSON.stringify(logData, null, 2));
  const asaasClient = getAsaasClient(); // Use your Asaas client instance

  try {
    // 1. Get Plan Details
    console.log(`[createPayment] Fetching plan with ID: ${data.planId}`);
    const plan = await prisma.insurancePlan.findUnique({
      where: { id: data.planId },
    });
    if (!plan) {
      console.error(`[createPayment] Plan not found for ID: ${data.planId}`);
      throw new Error('Plano não encontrado');
    }
    console.log('[createPayment] Plan details:', plan);

    // 2. Get User Details (Try by ID first, then email)
    let userIdentifier = typeof data.customerId === 'number' ? { id: data.customerId } : { email: data.customerId };
    console.log('[createPayment] Fetching user with identifier:', userIdentifier);
    let user = await prisma.user.findUnique({ where: userIdentifier });

    if (!user && typeof data.customerId === 'number') {
        // If lookup by ID failed, try fetching by email using the ID (assuming ID lookup failed but email might be available)
        // This fallback logic might need adjustment based on how customerId is truly passed
        console.warn(`[createPayment] User not found by ID ${data.customerId}, attempting lookup by email associated with potential session`);
        // Potentially fetch email based on ID if needed, or rely on email being passed separately
        // For now, this fallback might not be robust without more context
    } else if (!user && typeof data.customerId === 'string') {
        console.log(`[createPayment] User not found by email ${data.customerId}`);
        // Handle case where neither ID nor email match
    }

    if (!user) {
      console.error(`[createPayment] User not found for identifier: ${JSON.stringify(userIdentifier)}`);
      throw new Error('Usuário não encontrado');
    }
    console.log('[createPayment] User details:', { id: user.id, email: user.email, name: user.name, asaasCustomerId: user.asaasCustomerId });

    // 3. Ensure Asaas Customer Exists
    let asaasCustomerId = user.asaasCustomerId;
    if (!asaasCustomerId) {
      console.log(`[createPayment] Asaas customer ID not found for user ${user.id}. Creating customer in Asaas...`);
      try {
        const customerPayload = {
          name: user.name,
          email: user.email,
          cpfCnpj: user.cpf, // Pass user.cpf directly (assuming it exists)
          phone: user.phone || undefined, // Keep phone optional if it truly is
          // Add other required fields from your User model if necessary
        };
        // Basic check: Ensure required fields are present before calling Asaas
        if (!customerPayload.cpfCnpj) {
            console.error(`[createPayment] Cannot create Asaas customer for user ${user.id}: Missing CPF.`);
            throw new Error('CPF do usuário é necessário para criar cliente Asaas.');
        }
        console.log('[createPayment] Asaas customer creation payload:', customerPayload);
        // Note: Ensure asaasClient.createCustomer type matches this payload or adjust here
        const newAsaasCustomer = await asaasClient.createCustomer(customerPayload as any); // Use 'as any' temporarily if type mismatch persists, but ideally fix the type
        asaasCustomerId = newAsaasCustomer.id;
        console.log(`[createPayment] Asaas customer created with ID: ${asaasCustomerId}. Updating user record.`);

        // Update user in Prisma with the new Asaas ID
        await prisma.user.update({
          where: { id: user.id },
          data: { asaasCustomerId: asaasCustomerId },
        });
        console.log(`[createPayment] User ${user.id} updated with Asaas Customer ID.`);
      } catch (customerError: any) {
        console.error('[createPayment] Error creating Asaas customer:', customerError?.response?.data || customerError.message);
        throw new Error(`Failed to create Asaas customer: ${customerError?.response?.data?.errors?.[0]?.description || customerError.message}`);
      }
    }

    // 4. Prepare Payment Data for Asaas
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // Set due date 3 days from now
    const formattedDueDate = dueDate.toISOString().split('T')[0];

    const paymentPayload: any = {
      customer: asaasCustomerId,
      billingType: data.paymentMethod, // Ensure this is 'CREDIT_CARD' or 'BOLETO'
      value: plan.price, // Use price from the fetched plan
      dueDate: formattedDueDate,
      description: `Pagamento Plano: ${plan.name}`, // Clearer description
      externalReference: `plan_${data.planId}_user_${user.id}_${Date.now()}`, // More unique reference
    };

    if (data.paymentMethod === 'CREDIT_CARD' && data.cardInfo) { // Standardize on 'CREDIT_CARD'
        console.log('[createPayment] Preparing Credit Card payment details...');
        paymentPayload.creditCard = {
            holderName: data.cardInfo.holderName,
            number: data.cardInfo.number, // Asaas SDK handles this directly
            expiryMonth: data.cardInfo.expiryMonth,
            expiryYear: data.cardInfo.expiryYear,
            ccv: data.cardInfo.ccv
        };
        paymentPayload.creditCardHolderInfo = {
            name: data.cardInfo.holderName, // Use holder name from card info
            email: user.email, // Use user's primary email
            cpfCnpj: user.cpf, // Use user's CPF
            postalCode: user.zip_code, // Use user's zip code
            addressNumber: data.cardInfo.addressNumber || 'N/A', // Use card info or fallback
            // addressComplement: user.address_complement || data.cardInfo.addressComplement || '',
            phone: user.phone, // Use user's primary phone
            // mobilePhone: user.mobile_phone || user.phone, // Optional: use mobile if available
        };
        // Asaas often requires remote IP for fraud prevention
        paymentPayload.remoteIp = data.cardInfo.remoteIp || '127.0.0.1'; // Get IP from request if possible
        console.log('[createPayment] Credit Card Payload Snippet:', { creditCard: paymentPayload.creditCard, creditCardHolderInfo: paymentPayload.creditCardHolderInfo, remoteIp: paymentPayload.remoteIp });
    }

    console.log('[createPayment] Asaas payment payload (sensitive details like full card number are NOT logged here, they are in paymentPayload object passed to Asaas):', 
      {
        ...paymentPayload, 
        creditCard: paymentPayload.creditCard ? { ...paymentPayload.creditCard, number: 'REDACTED', ccv: 'REDACTED'} : undefined 
      }
    );

    // 5. Create Payment in Asaas
    let paymentResponse: AsaasPaymentResponse;
    try {
        console.log(`[${new Date().toISOString()}] [createPayment] >>> Attempting Asaas createPayment...`);
        paymentResponse = await asaasClient.createPayment(paymentPayload);
        console.log(`[${new Date().toISOString()}] [createPayment] <<< Asaas createPayment successful.`);
        console.log('[createPayment] Payment creation response from Asaas:', {
          id: paymentResponse.id,
          status: paymentResponse.status,
          billingType: paymentResponse.billingType,
          value: paymentResponse.value,
          invoiceUrl: paymentResponse.invoiceUrl,
          bankSlipUrl: paymentResponse.bankSlipUrl, // Asaas might use bankSlipUrl for boleto URL
        });
    } catch (paymentError: any) {
        console.error('[createPayment] Error calling Asaas createPayment API:');
        if (paymentError.response) {
            console.error('  Status:', paymentError.response.status);
            console.error('  Data:', JSON.stringify(paymentError.response.data, null, 2));
            const errorDetail = paymentError.response.data?.errors?.[0]?.description || JSON.stringify(paymentError.response.data);
            throw new Error(`Asaas API Error (${paymentError.response.status}): ${errorDetail}`);
        } else {
            console.error('  Message:', paymentError.message);
            throw new Error(`Asaas API Request Failed: ${paymentError.message}`);
        }
    }

    // 6. Save Transaction to Database
    console.log('[createPayment] Saving transaction to database...');
    try {
      const transactionData = {
        user: { connect: { id: user.id } }, // CORRECTED: Explicitly connect the user
        amount: Math.round(plan.price * 100), // Store amount as integer cents
        status: paymentResponse.status,
        type: data.paymentMethod,
        transactionId: paymentResponse.id, // Asaas payment ID
        boletoUrl: paymentResponse.bankSlipUrl || paymentResponse.invoiceUrl || null,
        boletoCode: paymentResponse.barCode || null,
        createdAt: paymentResponse.dateCreated ? new Date(paymentResponse.dateCreated) : new Date(),
        updatedAt: new Date(),
        paymentMethod: {
          connectOrCreate: {
            where: {
              userId_type_type: { 
                userId: user.id,
                type: data.paymentMethod // This will be 'BOLETO' or 'CREDIT_CARD'
              }
            },
            create: {
              user: { connect: { id: user.id } },
              type: data.paymentMethod, // 'BOLETO' or 'CREDIT_CARD'
              ...(data.paymentMethod === 'CREDIT_CARD' && data.cardInfo && paymentResponse.creditCardNumber ? {
                lastFour: paymentResponse.creditCardNumber,
                brand: paymentResponse.creditCardBrand,
                holderName: data.cardInfo.holderName,
              } : {})
            }
          }
        },
        // insurance: { connect: { id: insuranceId } }, // Ensure insuranceId is defined and connected
      };

      console.log('[createPayment] Prisma Transaction Payload:', JSON.stringify(transactionData, null, 2));

      console.log(`[${new Date().toISOString()}] [createPayment] >>> Attempting Prisma transaction.create...`);
      const transaction = await prisma.transaction.create({ data: transactionData });
      console.log(`[${new Date().toISOString()}] [createPayment] <<< Prisma transaction.create successful.`);
      console.log('[createPayment] Transaction saved successfully:', transaction.id);

      // Return relevant payment info to the frontend
      return {
          success: true,
          transactionId: transaction.id,
          asaasPaymentId: paymentResponse.id,
          status: paymentResponse.status,
          boletoUrl: paymentResponse.bankSlipUrl || paymentResponse.invoiceUrl,
          boletoCode: paymentResponse.barCode,
          // Add card details if needed, but be cautious
      };

    } catch (dbError: any) {
        console.error('[createPayment] Error saving transaction to database:', dbError);
        // Consider compensating action: try to cancel/refund Asaas payment if DB fails?
        throw new Error(`Failed to save transaction details: ${dbError.message}`);
    }

  } catch (error: any) {
    console.error('!!! [createPayment] Overall Error:', error.message);
    // Ensure the error thrown includes useful info
    throw new Error(error.message || 'An unexpected error occurred during payment creation.');
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