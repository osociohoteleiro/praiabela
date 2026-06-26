export interface GeneralSettings {
  siteName: string;
  logoText: string;
  logoSubtext: string;
  location: string;
  instagramHandle: string;
}

export interface HeroSettings {
  mode: "image" | "video";
  imageUrl: string;
  videoUrl: string;
  badge: string;
  title: string;
  subtitle: string;
  showBooking: boolean;
}

export interface AboutSettings {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaUrl: string;
  ctaNote: string;
  images: string[];
}

export interface LocationSettings {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  image: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface PromoSettings {
  title: string;
  ctaLabel: string;
  ctaUrl: string;
  image: string;
}

export interface ContactSettings {
  cnpj: string;
  groupText: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
}

export interface SectionTitle {
  title?: string;
  eyebrow?: string;
}

export interface ThemeSettings {
  brand: string;
  brandDark: string;
  brandLight: string;
  ink: string;
  eyebrow: string;
}

export interface TourSettings {
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  url: string;
}

export interface Room {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  amenities: string[];
  sort_order: number;
}

export interface Highlight {
  id: number;
  title: string;
  image_url: string;
  sort_order: number;
}

export interface Amenity {
  id: number;
  icon: string;
  label: string;
  description: string;
  sort_order: number;
}

export interface Testimonial {
  id: number;
  title: string;
  quote: string;
  author: string;
  rating: number;
  sort_order: number;
}

export interface GalleryItem {
  id: number;
  image_url: string;
  caption: string;
  sort_order: number;
}

export interface Experience {
  id: number;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discount: number;
  valid_until: string;
  image_url: string;
  sort_order: number;
}

export interface Package {
  id: number;
  title: string;
  description: string;
  price: number;
  inclusions: string[];
  image_url: string;
  featured: number;
  sort_order: number;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  published_at: string;
  sort_order: number;
}

export interface SiteContent {
  settings: {
    general: GeneralSettings;
    hero: HeroSettings;
    about: AboutSettings;
    location: LocationSettings;
    promo: PromoSettings;
    contact: ContactSettings;
    highlightsSection: SectionTitle;
    amenitiesSection: SectionTitle;
    roomsSection: SectionTitle;
    testimonialsSection: SectionTitle;
    gallerySection: SectionTitle;
    experiencesSection: SectionTitle;
    packagesSection: SectionTitle;
    promotionsSection: SectionTitle;
    blogSection: SectionTitle;
    theme?: ThemeSettings;
    tour?: TourSettings;
  };
  rooms: Room[];
  highlights: Highlight[];
  amenities: Amenity[];
  testimonials: Testimonial[];
  gallery: GalleryItem[];
  experiences: Experience[];
  promotions: Promotion[];
  packages: Package[];
  posts: Post[];
}
