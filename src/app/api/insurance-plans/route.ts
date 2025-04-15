import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { createAsaasPlan, deleteAsaasPlan } from './asaas';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Validate required fields
    if (!name || !description || !price || !features) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create plan in Supabase
    const { data: plan, error } = await supabase
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

    if (error) {
      throw error;
    }

    // Create corresponding plan in Asaas
    try {
      await createAsaasPlan({
        name,
        description,
        price,
        features,
      });
    } catch (asaasError) {
      // If Asaas creation fails, delete the Supabase record
      await supabase
        .from('insurance_plans')
        .delete()
        .eq('id', plan.id);

      throw asaasError;
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating insurance plan:', error);
    return NextResponse.json(
      { error: 'Failed to create insurance plan' },
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