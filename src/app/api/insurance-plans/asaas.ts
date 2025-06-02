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

interface AsaasCustomerData {
  name: string;
  email: string;
  cpfCnpj: string; 
  phone: string; 
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
    // 1. Get Plan Details (still useful for description, plan name, etc.)
    console.log(`[createPayment] Fetching plan with ID: ${data.planId}`);
    const plan = await prisma.insurancePlan.findUnique({
      where: { id: data.planId },
    });
    if (!plan) {
      console.error(`[createPayment] Plan not found for ID: ${data.planId}`);
      throw new Error('Plano não encontrado');
    }
    console.log('[createPayment] Plan details (for reference):', plan);
    // Ensure originalAmount is set if not provided, for consistency
    const originalAmount = data.originalAmount !== undefined ? data.originalAmount : plan.price;

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

    // 3. Create or Retrieve Asaas Customer
    let asaasCustomerId = user.asaasCustomerId;
    if (!asaasCustomerId) {
      console.log('[createPayment] Asaas customer ID not found, creating new Asaas customer for user:', user.id);
      
      // Ensure user.cpf exists, as Asaas requires it for customer creation
      if (!user.cpf) {
        console.error(`[createPayment] Cannot create Asaas customer for user ${user.id}: Missing CPF.`);
        throw new Error('CPF do usuário é necessário para criar cliente Asaas.');
      }
      // Ensure user.phone exists, as Asaas seems to require it
      if (!user.phone) {
        console.error(`[createPayment] Cannot create Asaas customer for user ${user.id}: Missing Phone.`);
        throw new Error('Telefone do usuário é necessário para criar cliente Asaas.');
      }

      const customerPayload: AsaasCustomerData = {
        name: user.name || 'Nome não fornecido',
        email: user.email,
        cpfCnpj: user.cpf, 
        phone: user.phone, 
      };
      console.log('[createPayment] Creating Asaas customer with payload:', customerPayload);
      const asaasCustomer = await asaasClient.createCustomer(customerPayload); 
      asaasCustomerId = asaasCustomer.id;
      console.log('[createPayment] Asaas customer created with ID:', asaasCustomerId, 'Updating user record.');
      await prisma.user.update({
        where: { id: user.id },
        data: { asaasCustomerId },
      });
    } else {
      console.log('[createPayment] Found existing Asaas customer ID:', asaasCustomerId, 'for user:', user.id);
    }

    // 4. Prepare Payment Payload for Asaas
    const paymentPayload: any = {
      customer: asaasCustomerId,
      billingType: data.paymentMethod === 'BOLETO' ? 'BOLETO' : 'CREDIT_CARD',
      value: data.finalAmount, // USE FINAL AMOUNT FOR THE CHARGE
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], // Example: 5 days from now
      description: `Pagamento do plano ${plan.name} - MedSafe`, // Use plan name from DB
      // externalReference: `TX-${Date.now()}-${plan.id}`, // Optional: your internal transaction reference
    };

    if (data.couponCode) {
      paymentPayload.description += ` (Cupom: ${data.couponCode})`;
    }

    if (data.paymentMethod === 'CREDIT_CARD' && data.cardInfo) {
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
    console.log('[createPayment] Creating Asaas payment with payload:', paymentPayload);
    const asaasPayment: AsaasPaymentResponse = await asaasClient.createPayment(paymentPayload);
    console.log('[createPayment] Asaas payment created:', asaasPayment);

    // --- START: Upsert User's Insurance Policy ---
    console.log(`[createPayment] Upserting insurance policy for user ${user.id} with plan ${plan.name}`);
    const userInsurancePolicy = await prisma.insurance.upsert({
      where: {
        userId: user.id, // userId is @unique in Insurance model
      },
      update: {
        plan: plan.name, // Update to the new plan's name from InsurancePlan
        status: 'ACTIVE', // Set status (can be refined based on asaasPayment.status later)
      },
      create: {
        userId: user.id,
        plan: plan.name, // Set to the new plan's name from InsurancePlan
        status: 'ACTIVE', // Set status
      },
    });
    console.log('[createPayment] User insurance policy upserted:', userInsurancePolicy);
    // --- END: Upsert User's Insurance Policy ---

    // --- START: Upsert PaymentMethod ---
    console.log(`[createPayment] Upserting payment method for user ${user.id}, type ${data.paymentMethod}`);
    const paymentMethodRecord = await prisma.paymentMethod.upsert({
      where: {
        userId_type_type: { // Using the @@unique([userId, type]) constraint
          userId: user.id,
          type: data.paymentMethod,
        }
      },
      update: {
        // Update card details if it's a credit card and info is provided
        ...(data.paymentMethod === 'CREDIT_CARD' && data.cardInfo && asaasPayment.creditCardNumber ? {
          lastFour: asaasPayment.creditCardNumber.slice(-4), // Store last four of the card number from Asaas response
          brand: asaasPayment.creditCardBrand,     
          holderName: data.cardInfo.holderName,
          // expiryMonth: data.cardInfo.expiryMonth, // If you collect these
          // expiryYear: data.cardInfo.expiryYear,   // If you collect these
        } : {}),
      },
      create: {
        userId: user.id, // Direct assignment for foreign key
        type: data.paymentMethod,
        ...(data.paymentMethod === 'CREDIT_CARD' && data.cardInfo && asaasPayment.creditCardNumber ? {
          lastFour: asaasPayment.creditCardNumber.slice(-4), // Store last four
          brand: asaasPayment.creditCardBrand,
          holderName: data.cardInfo.holderName,
        } : {}),
      },
    });
    console.log('[createPayment] Payment method upserted:', paymentMethodRecord);
    // --- END: Upsert PaymentMethod ---

    // 6. Store Transaction in your Database
    console.log('[createPayment] Storing transaction in local database.');

    // @ts-ignore // Re-added as a precaution, though this structure should be type-correct.
    const transaction = await prisma.transaction.create({
      data: {
        // Foreign Key IDs
        userId: user.id, 
        insuranceId: userInsurancePolicy.id,
        paymentMethodId: paymentMethodRecord.id,

        // Scalar fields
        transactionId: asaasPayment.id,
        status: asaasPayment.status,
        amount: data.finalAmount,
        couponCode: data.couponCode,
        type: data.paymentMethod, // This 'type' is for the transaction itself
        paymentDetails: JSON.stringify({ message: "Asaas payment details temporarily simplified for debugging", asaasPaymentId: asaasPayment.id, status: asaasPayment.status }), // Simplified for debugging
        planNameSnapshot: plan.name, 
        planPriceSnapshot: plan.price, 
        boletoUrl: asaasPayment.bankSlipUrl || asaasPayment.invoiceUrl,
        boletoCode: asaasPayment.barCode,
      },
    });
    console.log('[createPayment] Transaction stored with ID:', transaction.id);

    // 7. Update User's Current Insurance (if applicable)
    // ... (rest of the code remains the same)

    // Return relevant payment info to the frontend
    return {
        success: true,
        transactionId: transaction.id,
        asaasPaymentId: asaasPayment.id,
        status: asaasPayment.status,
        boletoUrl: asaasPayment.bankSlipUrl || asaasPayment.invoiceUrl,
        boletoCode: asaasPayment.barCode,
        // Add card details if needed, but be cautious
    };

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