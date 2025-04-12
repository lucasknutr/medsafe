import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
  }

  interface Session extends DefaultSession {
    user?: {
      role?: string;
    } & DefaultSession['user'];
  }
} 