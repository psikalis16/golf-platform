// Shared TypeScript types for the golf platform

export interface Colors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface Tenant {
  id: number;
  slug: string;
  name: string;
  custom_domain: string | null;
  logo_url: string | null;
  colors: Colors | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  course: Course | null;
}

export interface Course {
  id: number;
  tenant_id: number;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  holes: number;
  par: number;
  images: string[] | null;
  amenities: string[] | null;
  hours: Record<string, string> | null;
}

export interface TeeTimeSlot {
  id: number;
  tenant_id: number;
  date: string;
  start_time: string;
  max_players: number;
  booked_players: number;
  spots_remaining: number;
  price_per_player: string;
  cart_fee: string;
  walking_allowed: boolean;
  is_available: boolean;
}

export interface Booking {
  id: number;
  tenant_id: number;
  tee_time_slot_id: number;
  user_id: number | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  players: number;
  cart_requested: boolean;
  total_price: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  tee_time_slot?: TeeTimeSlot;
  booker_name?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'golfer';
  tenant_id: number;
  // When true the user must set a new password before accessing the app
  must_change_password: boolean;
}

export interface CourseClosure {
  id: number;
  tenant_id: number;
  date: string;
  reason: string | null;
}

export interface PricingRule {
  id: number;
  tenant_id: number;
  date: string | null;
  day_of_week: number | null;
  name: string | null;
  price_per_player: string;
  cart_fee: string;
  priority: number;
}
