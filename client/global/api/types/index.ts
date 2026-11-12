// Response types mirror the server's { success, message, data } envelope and service shapes.

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  code?: string;
  details?: { path: string; message: string }[];
}

export interface ApiError {
  status: number | string;
  message: string;
  code?: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  country: string | null;
  createdAt: string;
}

export interface AuthPayload {
  customer: Customer;
  accessToken: string;
}

export interface Stay {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export interface RoomType {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  bedType: string;
  outdoorSpace: string;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  baseRate: number;
  features: string[];
  images: string[];
  sortOrder: number;
  totalApartments: number;
  minAreaSqft: number | null;
  maxAreaSqft: number | null;
}

export interface RatePlan {
  id: string;
  code: string;
  name: string;
  description: string;
  refundable: boolean;
  freeCancelHours: number | null;
  breakfastIncluded: boolean;
  breakfastPerGuest: number;
  discountPercent: number;
}

export interface Quote {
  currency: string;
  nights: number;
  rooms: number;
  nightly: { date: string; rate: number }[];
  roomSubtotal: number;
  discountTotal: number;
  breakfastTotal: number;
  taxPercent: number;
  taxTotal: number;
  grandTotal: number;
  avgNightlyPerRoom: number;
  ratePlanCode?: string;
}

export interface AvailabilityResult {
  roomType: RoomType;
  available: number;
  soldOut: boolean;
  fitsParty: boolean;
  lowestQuote: Quote | null;
}

export interface AvailabilityResponse {
  stay: Stay;
  nights: number;
  results: AvailabilityResult[];
  summary: { roomTypes: number; bookable: number };
}

export interface Apartment {
  number: string;
  floor: number;
  floorLabel: string;
  areaSqft: number | null;
  outdoorSpace: string;
}

export interface RoomTypeDetail extends RoomType {
  apartments: Apartment[];
  floors: { floor: number; label: string }[];
  ratePlans: RatePlan[];
}

export interface RatesResponse {
  stay: Stay;
  roomType: Pick<RoomType, "id" | "slug" | "name" | "maxAdults" | "maxChildren" | "maxOccupancy">;
  available: number;
  soldOut: boolean;
  fitsParty: boolean;
  rates: { ratePlan: RatePlan; quote: Quote }[];
}

export type PaymentMethod = "PAY_AT_PROPERTY" | "CARD" | "BANK_TRANSFER";
export type BookingStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

export interface Booking {
  reference: string;
  status: BookingStatus;
  displayStatus: BookingStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  guest: { firstName: string; lastName: string; email: string; phone: string; country: string | null };
  arrivalTime: string | null;
  specialRequests: string | null;
  roomType: { slug: string; name: string; image: string | null; bedType: string; outdoorSpace: string };
  ratePlan: Pick<RatePlan, "code" | "name" | "refundable" | "freeCancelHours" | "breakfastIncluded">;
  price: {
    currency: string;
    roomSubtotal: number;
    discountTotal: number;
    breakfastTotal: number;
    taxTotal: number;
    grandTotal: number;
    nightly: { date: string; rate: number }[];
  };
  payment: { method: PaymentMethod; status: "UNPAID" | "PENDING" | "PAID" | "REFUNDED" };
  freeCancellationUntil: string | null;
  canCancel: boolean;
  cancelIsFree: boolean;
  canReview: boolean;
  cancelledAt: string | null;
  createdAt: string;
  property: { name: string; address: string; phone: string; checkIn: string; checkOut: string };
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CreateBookingInput extends Stay {
  roomTypeSlug: string;
  ratePlanCode: string;
  guest: { firstName: string; lastName: string; email: string; phone: string; country?: string };
  arrivalTime?: string;
  specialRequests?: string;
  paymentMethod: PaymentMethod;
  acceptTerms: true;
}

export interface Amenity {
  key: string;
  name: string;
  group: string;
  description?: string;
}

export interface Property {
  name: string;
  brand: string;
  established: number;
  tagline: string;
  headline: string;
  description: string;
  developer: string;
  altitudeFt: number;
  address: string;
  mapsQuery: string;
  contact: {
    phone: string;
    whatsapp: string;
    headOffice: string;
    social: Record<"instagram" | "facebook" | "linkedin" | "youtube", string>;
  };
  distances: { place: string; distance: string; drive?: string }[];
  access: string[];
  policies: Record<"checkIn" | "checkOut" | "children" | "pets" | "smoking" | "id" | "payment", string>;
  highlights: { label: string; value: string }[];
  amenities: Amenity[];
  experiences: { title: string; image: string }[];
  floors: { key: string; label: string; summary: string; plans: string[] }[];
  gallery: { src: string; alt: string }[];
  stats: { apartments: number; reviewCount: number; averageRating: number | null };
}

export interface PublicConfig {
  currency: string;
  taxPercent: number;
  maxStayNights: number;
  maxRoomsPerBooking: number;
  paymentsEnabled: boolean;
  reviewsEnabled: boolean;
  timezone: string;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  author: string;
  country: string | null;
  roomType: string;
  stayedNights: number;
  stayedMonth: string;
}

export interface ReviewsResponse {
  summary: { total: number; average: number | null; distribution: { rating: number; count: number }[] };
  items: Review[];
  page: number;
  pageSize: number;
  totalPages: number;
}
