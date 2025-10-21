import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'traveler' | 'host' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  kyc_verified: boolean;
  kyc_documents?: any;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  host_id: string;
  title: string;
  short_description: string;
  long_document: PackageDocument;
  price_per_person: number;
  capacity_min: number;
  capacity_max: number;
  duration_days: number;
  tags: string[];
  images: string[];
  cancellation_policy?: string;
  status: 'draft' | 'published' | 'archived' | 'pending_approval';
  created_at: string;
  updated_at: string;
  host?: Profile;
}

export interface PackageDocument {
  duration_days: number;
  days: Array<{
    day: number;
    activities: string[];
  }>;
  accommodations: Array<{
    name: string;
    address: string;
    nights: number;
    amenities?: string[];
  }>;
  meals: string[];
  transport: string;
  max_capacity: number;
  price_per_person: number;
  includes?: string[];
  excludes?: string[];
  what_to_bring?: string[];
  health_recommendations?: string[];
}

export interface Booking {
  id: string;
  package_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  num_people: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'processing' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
  package?: Package;
  user?: Profile;
}

export interface Transaction {
  id: string;
  booking_id: string;
  amount: number;
  commission: number;
  gateway_fee: number;
  net_amount: number;
  payment_method: 'credit_card' | 'paypal' | 'boleto';
  payment_provider_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  package_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  package_id?: string;
  message: string;
  attachments: string[];
  read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}
