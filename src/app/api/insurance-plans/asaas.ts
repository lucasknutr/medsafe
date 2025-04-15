import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createAsaasPlan(planData: {
  name: string;
  description: string;
  price: number;
  features: string[];
}) {
  try {
    // Create payment plan in Asaas
    const response = await fetch('https://api.asaas.com/v3/plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ASAAS_API_KEY!,
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create Asaas plan');
    }

    const asaasPlan = await response.json();

    // Store Asaas plan ID in Supabase
    const { error } = await supabase
      .from('insurance_plans')
      .update({ asaas_plan_id: asaasPlan.id })
      .eq('name', planData.name);

    if (error) {
      throw error;
    }

    return asaasPlan;
  } catch (error) {
    console.error('Error creating Asaas plan:', error);
    throw error;
  }
}

export async function deleteAsaasPlan(asaasPlanId: string) {
  try {
    const response = await fetch(`https://api.asaas.com/v3/plans/${asaasPlanId}`, {
      method: 'DELETE',
      headers: {
        'access_token': process.env.ASAAS_API_KEY!,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete Asaas plan');
    }

    return true;
  } catch (error) {
    console.error('Error deleting Asaas plan:', error);
    throw error;
  }
} 