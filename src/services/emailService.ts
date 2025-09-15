import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG, EmailData } from '../config/emailConfig';

export class EmailService {
  private static instance: EmailService;
  private isInitialized = false;

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public initialize(): void {
    if (this.isConfigured()) {
      emailjs.init(EMAIL_CONFIG.publicKey);
      this.isInitialized = true;
      console.log('✅ EmailJS initialized successfully');
    } else {
      console.warn('⚠️ EmailJS not configured. Using mock email service.');
    }
  }

  public async sendEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized || !this.isConfigured()) {
      return this.sendMockEmail(emailData);
    }

    try {
      const response = await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateId,
        emailData,
        EMAIL_CONFIG.publicKey
      );

      console.log('✅ Email sent successfully:', response.status);
      return { success: true };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private async sendMockEmail(emailData: EmailData): Promise<{ success: boolean }> {
    console.log('📧 MOCK EMAIL SENT:');
    console.log('To:', emailData.to_email);
    console.log('Subject:', emailData.subject);
    console.log('Message:', emailData.message);
    return { success: true };
  }

  private isConfigured(): boolean {
    return EMAIL_CONFIG.serviceId !== 'YOUR_SERVICE_ID' &&
           EMAIL_CONFIG.templateId !== 'YOUR_TEMPLATE_ID' &&
           EMAIL_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY';
  }

  public getConfigStatus(): { configured: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (EMAIL_CONFIG.serviceId === 'YOUR_SERVICE_ID') missing.push('Service ID');
    if (EMAIL_CONFIG.templateId === 'YOUR_TEMPLATE_ID') missing.push('Template ID');
    if (EMAIL_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') missing.push('Public Key');
    
    return {
      configured: missing.length === 0,
      missing
    };
  }

  /**
   * Send subscription expiry warning email
   */
  public async sendExpiryWarning(to_email: string, to_name: string, daysLeft: number, expiryDate: string): Promise<{ success: boolean; error?: string }> {
    const emailData: EmailData = {
      to_email,
      to_name,
      subject: `Your IPMA Certification Prep access expires in ${daysLeft} days`,
      message: this.generateExpiryWarningMessage(to_name, daysLeft, expiryDate),
      days_left: daysLeft,
      expiry_date: expiryDate,
    };

    return this.sendEmail(emailData);
  }

  /**
   * Send final expiry warning email
   */
  public async sendFinalExpiry(to_email: string, to_name: string, expiryDate: string): Promise<{ success: boolean; error?: string }> {
    const emailData: EmailData = {
      to_email,
      to_name,
      subject: 'Final reminder - Your IPMA Certification Prep access expires tomorrow',
      message: this.generateFinalExpiryMessage(to_name, expiryDate),
      days_left: 1,
      expiry_date: expiryDate,
    };

    return this.sendEmail(emailData);
  }

  /**
   * Send subscription extension confirmation email
   */
  public async sendExtensionConfirmation(to_email: string, to_name: string, extensionDays: number, newExpiryDate: string): Promise<{ success: boolean; error?: string }> {
    const emailData: EmailData = {
      to_email,
      to_name,
      subject: 'Your IPMA Certification Prep access has been extended',
      message: this.generateExtensionMessage(to_name, extensionDays, newExpiryDate),
      expiry_date: newExpiryDate,
    };

    return this.sendEmail(emailData);
  }

  /**
   * Generate expiry warning message
   */
  private generateExpiryWarningMessage(name: string, daysLeft: number, expiryDate: string): string {
    return `
Dear ${name},

Your IPMA Certification Prep platform access will expire in ${daysLeft} days.

To continue your certification preparation, please contact your administrator to renew your subscription.

Important reminders:
- You have ${daysLeft} days left to complete your studies
- Your progress will be saved until the expiry date
- Contact your administrator for subscription renewal

Expiry Date: ${expiryDate}

Best regards,
IPMA Certification Prep Team
    `.trim();
  }

  /**
   * Generate final expiry message
   */
  private generateFinalExpiryMessage(name: string, expiryDate: string): string {
    return `
Dear ${name},

This is your final reminder - your IPMA Certification Prep platform access expires tomorrow.

Please contact your administrator immediately if you need to extend your subscription.

Your progress has been saved and will be available once your subscription is renewed.

Expiry Date: ${expiryDate}

Best regards,
IPMA Certification Prep Team
    `.trim();
  }

  /**
   * Generate extension confirmation message
   */
  private generateExtensionMessage(name: string, extensionDays: number, newExpiryDate: string): string {
    return `
Dear ${name},

Great news! Your IPMA Certification Prep platform access has been extended by ${extensionDays} days.

You can now continue your certification preparation with full access to all features.

New Expiry Date: ${newExpiryDate}

Happy studying!
IPMA Certification Prep Team
    `.trim();
  }
}

export const emailService = EmailService.getInstance();
