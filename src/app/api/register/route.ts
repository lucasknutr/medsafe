import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received registration data:', body);

    // Validate required fields
    const requiredFields = [
      'name',
      'email',
      'cpf',
      'profession',
      'phone',
      'address',
      'city',
      'state',
      'zip_code',
      'password'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email, cpf')
      .or(`email.eq.${body.email},cpf.eq.${body.cpf}`)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User already exists',
          details: existingUser.email === body.email ? 'Email already in use' : 'CPF already in use',
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user in Supabase
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        name: body.name,
        email: body.email,
        cpf: body.cpf,
        profession: body.profession,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zip_code: body.zip_code,
        password: hashedPassword,
        role: 'SEGURADO',
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Remove sensitive data before sending response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: 'Failed to register user',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}