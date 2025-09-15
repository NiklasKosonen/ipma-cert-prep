export const DEVELOPMENT_CONFIG = {
  // Enable/disable development mode
  ENABLED: true,
  
  // Auto-login settings for development
  AUTO_LOGIN: {
    enabled: true,
    adminEmail: 'admin@ipma-prep.com',
    adminPassword: 'admin123',
    adminName: 'Admin User',
    adminCompany: 'IPMA Prep Platform'
  },
  
  // Session settings for development
  SESSION: {
    // Never expire sessions in development mode
    neverExpire: true,
    // Default session duration (30 days)
    defaultDuration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    // Activity timeout (2 hours of inactivity)
    activityTimeout: 2 * 60 * 60 * 1000 // 2 hours in milliseconds
  },
  
  // Data persistence settings
  DATA: {
    // Backup data before major operations
    autoBackup: true,
    // Show debug logs
    debugLogs: true,
    // Data version for migration
    version: '1.0.0'
  },
  
  // Subscription settings for development
  SUBSCRIPTION: {
    // Default subscription duration (2 months)
    defaultDuration: 60, // days
    // Email reminder settings
    emailReminders: {
      enabled: false, // Disable in development
      daysBeforeExpiry: [7, 1]
    }
  }
};

// Helper function to check if development mode is enabled
export const isDevelopmentMode = (): boolean => {
  return DEVELOPMENT_CONFIG.ENABLED && process.env.NODE_ENV === 'development';
};

// Helper function to get auto-login config
export const getAutoLoginConfig = () => {
  return DEVELOPMENT_CONFIG.AUTO_LOGIN;
};

// Helper function to get session config
export const getSessionConfig = () => {
  return DEVELOPMENT_CONFIG.SESSION;
};
