// EmailJS Configuration
export const EMAIL_CONFIG = {
  serviceId: 'service_i6e64ig',
  templateId: 'template_ndt42fy',
  publicKey: 'KjrQsyWuyRe9mHx0O',
  
  // Email templates for different purposes
  templates: {
    expiryWarning: 'template_expiry_warning',
    finalWarning: 'template_final_warning', 
    extensionConfirmation: 'template_extension'
  }
};

export interface EmailData {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  company_name?: string;
  days_left?: number;
  expiry_date?: string;
}
