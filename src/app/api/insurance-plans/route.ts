import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  });
  throw new Error('Missing required Supabase environment variables');
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching insurance plans...');
    const { data: plans, error } = await supabaseAdmin
      .from('insurance_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Successfully fetched plans:', plans?.length);
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching insurance plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance plans', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description, price, features, is_active } = await request.json();
    console.log('Creating plan with data:', { name, description, price, features, is_active });

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

    // Create plan in Supabase
    const { data: plan, error } = await supabaseAdmin
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
      console.error('Supabase error creating plan:', error);
      throw error;
    }

    console.log('Successfully created plan:', plan);
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating insurance plan:', error);
    return NextResponse.json(
      { 
        error: 'Falha ao criar plano de seguro',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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

    const { data: plan, error } = await supabaseAdmin
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

    const { error } = await supabaseAdmin
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