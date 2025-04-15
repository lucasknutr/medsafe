import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { createAsaasPlan, deleteAsaasPlan } from './asaas';

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data: plans, error } = await supabase
      .from('insurance_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching insurance plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, price, features, is_active } = await request.json();

    // Validate required fields with specific error messages
    if (!name) {
      return NextResponse.json(
        { error: 'Nome do plano é obrigatório' },
        { status: 400 }
      );
    }
    if (!description) {
      return NextResponse.json(
        { error: 'Descrição do plano é obrigatória' },
        { status: 400 }
      );
    }
    if (!price) {
      return NextResponse.json(
        { error: 'Preço do plano é obrigatório' },
        { status: 400 }
      );
    }
    if (!features || !Array.isArray(features) || features.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos uma característica do plano é obrigatória' },
        { status: 400 }
      );
    }

    console.log('Creating plan in Supabase with data:', {
      name,
      description,
      price,
      features,
      is_active: is_active ?? true,
    });

    // Create plan in Supabase
    const { data: plan, error: supabaseError } = await supabase
      .from('insurance_plans')
      .insert({
        name,
        description,
        price,
        features,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      throw new Error(`Erro ao criar plano no banco de dados: ${supabaseError.message}`);
    }

    console.log('Plan created in Supabase:', plan);

    // Create corresponding plan in Asaas
    try {
      console.log('Creating plan in Asaas...');
      const asaasPlan = await createAsaasPlan({
        name,
        description,
        price,
        features,
      });

      console.log('Plan created in Asaas:', asaasPlan);

      // Update the Supabase record with the Asaas plan ID
      const { error: updateError } = await supabase
        .from('insurance_plans')
        .update({ asaas_plan_id: asaasPlan.id })
        .eq('id', plan.id);

      if (updateError) {
        console.error('Error updating Asaas plan ID:', updateError);
        throw new Error(`Erro ao atualizar ID do plano Asaas: ${updateError.message}`);
      }

      // Get the updated plan
      const { data: updatedPlan, error: fetchError } = await supabase
        .from('insurance_plans')
        .select('*')
        .eq('id', plan.id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated plan:', fetchError);
        throw new Error(`Erro ao buscar plano atualizado: ${fetchError.message}`);
      }

      return NextResponse.json(updatedPlan);
    } catch (asaasError) {
      console.error('Asaas error:', asaasError);
      // If Asaas creation fails, delete the Supabase record
      await supabase
        .from('insurance_plans')
        .delete()
        .eq('id', plan.id);

      throw new Error(`Erro ao criar plano no Asaas: ${asaasError.message}`);
    }
  } catch (error) {
    console.error('Error creating insurance plan:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao criar plano de seguro' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, description, price, features, is_active } = body;

    if (!id || !name || !description || !price || !features) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: plan, error } = await supabase
      .from('insurance_plans')
      .update({
        name,
        description,
        price: parseFloat(price),
        features,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error updating insurance plan:', error);
    return NextResponse.json(
      { error: 'Failed to update insurance plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get the plan to get the Asaas plan ID
    const { data: plan, error: fetchError } = await supabase
      .from('insurance_plans')
      .select('asaas_plan_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Delete plan from Asaas if it exists
    if (plan.asaas_plan_id) {
      try {
        await deleteAsaasPlan(plan.asaas_plan_id);
      } catch (asaasError) {
        console.error('Error deleting Asaas plan:', asaasError);
        // Continue with Supabase deletion even if Asaas deletion fails
      }
    }

    // Delete plan from Supabase
    const { error } = await supabase
      .from('insurance_plans')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting insurance plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete insurance plan' },
      { status: 500 }
    );
  }
} 