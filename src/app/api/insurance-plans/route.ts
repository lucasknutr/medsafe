import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configure the route to use edge runtime
export const runtime = 'edge';

// Public endpoint - no auth required
export async function GET() {
  try {
    console.log('Fetching insurance plans...');
    
    const { data: plans, error } = await supabase
      .from('insurance_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log('Plans fetched successfully:', plans);
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Detailed error fetching insurance plans:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch insurance plans',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Protected endpoints - using Supabase service role key
export async function POST(request: Request) {
  try {
    console.log('Starting POST request...');
    const body = await request.json();
    console.log('Received request body:', body);

    // Validate required fields
    if (!body.name || !body.description || !body.price || !body.features) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'Missing required fields',
          required: ['name', 'description', 'price', 'features'],
          received: Object.keys(body),
        },
        { status: 400 }
      );
    }

    // Validate price is a number
    if (isNaN(Number(body.price))) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'Price must be a number',
          received: body.price,
        },
        { status: 400 }
      );
    }

    // Validate features is an array
    if (!Array.isArray(body.features)) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'Features must be an array',
          received: body.features,
        },
        { status: 400 }
      );
    }

    console.log('Creating insurance plan with data:', {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      features: body.features,
    });

    const { data: plan, error } = await supabase
      .from('insurance_plans')
      .insert({
        name: body.name,
        description: body.description,
        price: Number(body.price),
        features: body.features,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('Insurance plan created successfully:', plan);
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Detailed error creating insurance plan:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to create insurance plan',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    if (!body.id) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Missing plan ID' },
        { status: 400 }
      );
    }

    const { data: plan, error } = await supabase
      .from('insurance_plans')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        features: body.features,
        is_active: body.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('Insurance plan updated successfully:', plan);
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Detailed error updating insurance plan:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to update insurance plan',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
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
        { error: 'Invalid request', details: 'Missing plan ID' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('insurance_plans')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    console.log('Insurance plan deleted successfully:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Detailed error deleting insurance plan:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to delete insurance plan',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
} 