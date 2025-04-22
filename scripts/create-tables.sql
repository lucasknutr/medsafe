-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  profession TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  policy_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  password TEXT NOT NULL,
  role TEXT DEFAULT 'SEGURADO',
  asaas_customer_id TEXT UNIQUE
);

-- Create lawyer table
CREATE TABLE IF NOT EXISTS lawyer (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policy table
CREATE TABLE IF NOT EXISTS policy (
  id SERIAL PRIMARY KEY,
  policy_number TEXT UNIQUE NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_insured INTEGER NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  is_extended BOOLEAN DEFAULT FALSE,
  new_policy_id INTEGER REFERENCES policy(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insurance table
CREATE TABLE IF NOT EXISTS insurance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create process table
CREATE TABLE IF NOT EXISTS process (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  lawyer_id INTEGER REFERENCES lawyer(id),
  case_number TEXT UNIQUE NOT NULL,
  plaintiff TEXT NOT NULL,
  defendant TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL,
  accident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  contract_date TIMESTAMP WITH TIME ZONE NOT NULL,
  case_value DECIMAL(10,2) NOT NULL,
  is_covered BOOLEAN DEFAULT FALSE,
  probability_of_loss INTEGER NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create broker table
CREATE TABLE IF NOT EXISTS broker (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  commission_rules JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create legal_action table
CREATE TABLE IF NOT EXISTS legal_action (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_method table
CREATE TABLE IF NOT EXISTS payment_method (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  type TEXT NOT NULL,
  last_four TEXT,
  brand TEXT,
  holder_name TEXT,
  expiry_month TEXT,
  expiry_year TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transaction table
CREATE TABLE IF NOT EXISTS transaction (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  payment_method_id INTEGER REFERENCES payment_method(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  type TEXT NOT NULL,
  transaction_id TEXT,
  boleto_url TEXT,
  boleto_code TEXT,
  insurance_id INTEGER REFERENCES insurance(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_box table
CREATE TABLE IF NOT EXISTS service_box (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create slide table
CREATE TABLE IF NOT EXISTS slide (
  id SERIAL PRIMARY KEY,
  image TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  button_link TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insurance_plan table
CREATE TABLE IF NOT EXISTS insurance_plan (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for users.policy_id
ALTER TABLE users
ADD CONSTRAINT fk_users_policy
FOREIGN KEY (policy_id) REFERENCES policy(id);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_insurance_user_id ON insurance(user_id);
CREATE INDEX idx_process_user_id ON process(user_id);
CREATE INDEX idx_process_lawyer_id ON process(lawyer_id);
CREATE INDEX idx_transaction_user_id ON transaction(user_id);
CREATE INDEX idx_transaction_payment_method_id ON transaction(payment_method_id);
CREATE INDEX idx_transaction_insurance_id ON transaction(insurance_id); 