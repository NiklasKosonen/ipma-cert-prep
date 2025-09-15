import { UserProfile, Subscription } from '../types';
import { emailService } from '../services/emailService';

export interface EmailTemplate {
  subject: string;
  body: string;
  type: 'expiry_warning' | 'expiry_final' | 'subscription_extended';
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  expiry_warning: {
    subject: 'Your IPMA Certification Prep access expires soon',
    body: `Dear {{userName}},

Your IPMA Certification Prep platform access will expire in {{daysLeft}} days.

To continue your certification preparation, please contact your administrator to renew your subscription.

Important reminders:
- You have {{daysLeft}} days left to complete your studies
- Your progress will be saved until the expiry date
- Contact your administrator for renewal options

Best regards,
IPMA Certification Prep Team`,
    type: 'expiry_warning'
  },
  
  expiry_final: {
    subject: 'Final reminder: Your IPMA Certification Prep access expires tomorrow',
    body: `Dear {{userName}},

This is your final reminder that your IPMA Certification Prep platform access expires tomorrow.

Please contact your administrator immediately if you need to extend your access.

Your progress has been saved and will be available once your subscription is renewed.

Best regards,
IPMA Certification Prep Team`,
    type: 'expiry_final'
  },
  
  subscription_extended: {
    subject: 'Your IPMA Certification Prep access has been extended',
    body: `Dear {{userName}},

Your IPMA Certification Prep platform access has been extended by {{extensionDays}} days.

You now have access until {{newExpiryDate}}.

Continue your certification preparation with confidence!

Best regards,
IPMA Certification Prep Team`,
    type: 'subscription_extended'
  }
};

export interface EmailReminder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  templateType: keyof typeof EMAIL_TEMPLATES;
  scheduledFor: string;
  sent: boolean;
  sentAt?: string;
  createdAt: string;
}

/**
 * Check which users need email reminders
 */
export const checkEmailReminders = (
  users: UserProfile[], 
  subscriptions: Subscription[]
): { warning: UserProfile[], final: UserProfile[] } => {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
  const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

  const warning: UserProfile[] = [];
  const final: UserProfile[] = [];

  users.forEach(user => {
    if (user.role !== 'user') return; // Only send reminders to regular users

    const subscription = subscriptions.find(s => s.userId === user.id && s.isActive);
    if (!subscription) return;

    const endDate = new Date(subscription.endDate);
    
    // Check if subscription expires in 7 days (and reminder not sent)
    if (endDate <= sevenDaysFromNow && endDate > oneDayFromNow && !subscription.reminderSent.sevenDays) {
      warning.push(user);
    }
    
    // Check if subscription expires in 1 day (and reminder not sent)
    if (endDate <= oneDayFromNow && endDate > now && !subscription.reminderSent.oneDay) {
      final.push(user);
    }
  });

  return { warning, final };
};

/**
 * Generate email content from template
 */
export const generateEmailContent = (
  template: EmailTemplate,
  user: UserProfile,
  subscription?: Subscription,
  extensionDays?: number
): { subject: string, body: string } => {
  let subject = template.subject;
  let body = template.body;

  // Replace user placeholders
  subject = subject.replace(/{{userName}}/g, user.name || user.email.split('@')[0]);
  body = body.replace(/{{userName}}/g, user.name || user.email.split('@')[0]);

  // Replace subscription-specific placeholders
  if (subscription) {
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    subject = subject.replace(/{{daysLeft}}/g, daysLeft.toString());
    body = body.replace(/{{daysLeft}}/g, daysLeft.toString());
    body = body.replace(/{{newExpiryDate}}/g, endDate.toLocaleDateString());
  }

  // Replace extension-specific placeholders
  if (extensionDays) {
    subject = subject.replace(/{{extensionDays}}/g, extensionDays.toString());
    body = body.replace(/{{extensionDays}}/g, extensionDays.toString());
  }

  return { subject, body };
};

/**
 * Mock email sending function
 * In a real application, this would integrate with an email service like SendGrid, AWS SES, etc.
 */
export const sendEmail = async (
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Use real email service
    const result = await emailService.sendEmail({
      to_email: to,
      to_name: to.split('@')[0], // Extract name from email
      subject: subject,
      message: body,
    });
    
    if (result.success) {
      return {
        success: true,
        messageId: `email_${Date.now()}`,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Unknown error',
      };
    }
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Send expiry warning emails
 */
export const sendExpiryWarningEmails = async (
  users: UserProfile[],
  subscriptions: Subscription[]
): Promise<{ sent: number; failed: number; results: Array<{ user: UserProfile; success: boolean; error?: string }> }> => {
  const results: Array<{ user: UserProfile; success: boolean; error?: string }> = [];
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const subscription = subscriptions.find(s => s.userId === user.id);
    if (!subscription) continue;

    const template = EMAIL_TEMPLATES.expiry_warning;
    const { subject, body } = generateEmailContent(template, user, subscription);

    const result = await sendEmail(user.email, subject, body);
    
    if (result.success) {
      sent++;
      results.push({ user, success: true });
    } else {
      failed++;
      results.push({ user, success: false, error: result.error });
    }
  }

  return { sent, failed, results };
};

/**
 * Send final expiry emails
 */
export const sendFinalExpiryEmails = async (
  users: UserProfile[],
  subscriptions: Subscription[]
): Promise<{ sent: number; failed: number; results: Array<{ user: UserProfile; success: boolean; error?: string }> }> => {
  const results: Array<{ user: UserProfile; success: boolean; error?: string }> = [];
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const subscription = subscriptions.find(s => s.userId === user.id);
    if (!subscription) continue;

    const template = EMAIL_TEMPLATES.expiry_final;
    const { subject, body } = generateEmailContent(template, user, subscription);

    const result = await sendEmail(user.email, subject, body);
    
    if (result.success) {
      sent++;
      results.push({ user, success: true });
    } else {
      failed++;
      results.push({ user, success: false, error: result.error });
    }
  }

  return { sent, failed, results };
};

/**
 * Send subscription extension notification
 */
export const sendSubscriptionExtensionEmail = async (
  user: UserProfile,
  subscription: Subscription,
  extensionDays: number
): Promise<{ success: boolean; error?: string }> => {
  const template = EMAIL_TEMPLATES.subscription_extended;
  const { subject, body } = generateEmailContent(template, user, subscription, extensionDays);

  const result = await sendEmail(user.email, subject, body);
  return result;
};

/**
 * Process all pending email reminders
 */
export const processEmailReminders = async (
  users: UserProfile[],
  subscriptions: Subscription[],
  updateSubscriptionReminderStatus: (subscriptionId: string, reminderType: 'sevenDays' | 'oneDay') => void
): Promise<{ warningSent: number; finalSent: number; totalFailed: number }> => {
  const { warning, final } = checkEmailReminders(users, subscriptions);
  
  let warningSent = 0;
  let finalSent = 0;
  let totalFailed = 0;

  // Send warning emails
  if (warning.length > 0) {
    console.log(`📧 Sending ${warning.length} expiry warning emails...`);
    const warningResults = await sendExpiryWarningEmails(warning, subscriptions);
    warningSent = warningResults.sent;
    totalFailed += warningResults.failed;

    // Update reminder status for successfully sent emails
    warningResults.results.forEach(result => {
      if (result.success) {
        const subscription = subscriptions.find(s => s.userId === result.user.id);
        if (subscription) {
          updateSubscriptionReminderStatus(subscription.id, 'sevenDays');
        }
      }
    });
  }

  // Send final emails
  if (final.length > 0) {
    console.log(`📧 Sending ${final.length} final expiry emails...`);
    const finalResults = await sendFinalExpiryEmails(final, subscriptions);
    finalSent = finalResults.sent;
    totalFailed += finalResults.failed;

    // Update reminder status for successfully sent emails
    finalResults.results.forEach(result => {
      if (result.success) {
        const subscription = subscriptions.find(s => s.userId === result.user.id);
        if (subscription) {
          updateSubscriptionReminderStatus(subscription.id, 'oneDay');
        }
      }
    });
  }

  return { warningSent, finalSent, totalFailed };
};
