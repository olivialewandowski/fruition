// src/types/index.ts

export interface NavigationItem {
    label: string;
    variant?: 'button';
  }
  
  export interface ResearchProject {
    title: string;
    description: string;
    tags: string[];
  }
  
  export interface FeatureCard {
    number: string;
    title: string;
    subtitle: string;
    description: string;
  }
  
  export interface BenefitCard {
    title: string;
    description: string;
    iconSrc: string;
    iconAlt: string;
  }
  
  // Add new type for waitlist form data
  export interface WaitlistFormData {
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    institution?: string;
  }
  
  // Add new type for API responses
  export interface ApiResponse {
    message?: string;
    error?: string;
    data?: any;
  }