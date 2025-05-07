import axios from 'axios';

class AsaasClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';
    this.apiKey = process.env.ASAAS_API_KEY || '';
    
    // Remove any quotes from the API key if present
    if (this.apiKey.startsWith('"') && this.apiKey.endsWith('"')) {
      this.apiKey = this.apiKey.slice(1, -1);
    }
    
    console.log('AsaasClient initialized with:');
    console.log('- API URL:', this.apiUrl);
    console.log('- API Key exists:', !!this.apiKey);
    console.log('- API Key length:', this.apiKey ? this.apiKey.length : 0);
    console.log('- API Key first 10 chars:', this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'Not set');
    
    if (!this.apiKey) {
      console.error('ASAAS_API_KEY is not set in environment variables');
    }
  }

  private get headers() {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'MedSafeFront', // Or your preferred app name
      'access_token': this.apiKey
    };
    console.log('Request headers:', {
      'Content-Type': headers['Content-Type'],
      'User-Agent': headers['User-Agent'],
      'access_token': headers['access_token'] ? '[REDACTED]' : 'Not set' // Redact token for logging
    });
    return headers;
  }

  private handleError(error: any) {
    console.error('Asaas API Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      
      throw new Error(`Asaas API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      throw new Error('No response received from Asaas API');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new Error(`Error setting up Asaas API request: ${error.message}`);
    }
  }

  async createPayment(data: {
    customer: string;
    billingType: string;
    dueDate: string;
    value: number;
    description: string;
  }) {
    try {
      console.log('Creating payment with data:', {
        ...data,
        customer: data.customer.substring(0, 8) + '...' // Log partial customer ID for privacy
      });
      
      console.log('Making request to:', `${this.apiUrl}/payments`);
      
      const response = await axios.post(
        `${this.apiUrl}/payments`,
        data,
        { headers: this.headers }
      );
      
      console.log('Payment created successfully:', {
        id: response.data.id,
        status: response.data.status
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      });
      
      if (error.response) {
        console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw new Error(`Failed to create payment: ${error.response?.data?.message || error.message}`);
    }
  }

  async createCustomer(data: {
    name: string;
    cpfCnpj: string;
    email: string;
    phone: string;
  }) {
    try {
      console.log('Creating customer with data:', {
        ...data,
        cpfCnpj: data.cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4') // Mask CPF for privacy
      });
      
      console.log('Making request to:', `${this.apiUrl}/customers`);
      
      const response = await axios.post(
        `${this.apiUrl}/customers`,
        data,
        { headers: this.headers }
      );
      
      console.log('Customer created successfully:', {
        id: response.data.id,
        name: response.data.name
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating customer:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        errors: error.response?.data?.errors
      });
      
      if (error.response) {
        console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
      }
      
      throw new Error(`Failed to create customer: ${error.response?.data?.message || error.message}`);
    }
  }
}

let asaasClient: AsaasClient | null = null;

export function getAsaasClient() {
  if (!asaasClient) {
    console.log('Creating new AsaasClient instance');
    asaasClient = new AsaasClient();
  } else {
    console.log('Reusing existing AsaasClient instance');
  }
  return asaasClient;
} 