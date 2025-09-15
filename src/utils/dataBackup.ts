import { Topic, Subtopic, KPI, Question, SampleAnswer, TrainingExample, CompanyCode, Attempt, AttemptItem, UserProfile, Subscription, UserSession } from '../types';
import { DEVELOPMENT_CONFIG } from '../config/development';

export interface BackupData {
  version: string;
  timestamp: string;
  topics: Topic[];
  subtopics: Subtopic[];
  kpis: KPI[];
  questions: Question[];
  sampleAnswers: SampleAnswer[];
  trainingExamples: TrainingExample[];
  companyCodes: CompanyCode[];
  users: UserProfile[];
  subscriptions: Subscription[];
  sessions: UserSession[];
  attempts: Attempt[];
  attemptItems: AttemptItem[];
}

export interface UserBackupData {
  version: string;
  timestamp: string;
  userId: string;
  attempts: Attempt[];
  attemptItems: AttemptItem[];
  userProfile: UserProfile;
}

/**
 * Create a complete backup of all application data
 */
export const createBackup = (): BackupData => {
  const timestamp = new Date().toISOString();
  
  try {
    const backup: BackupData = {
      version: DEVELOPMENT_CONFIG.DATA.version,
      timestamp,
      topics: JSON.parse(localStorage.getItem('ipma_topics') || '[]'),
      subtopics: JSON.parse(localStorage.getItem('ipma_subtopics') || '[]'),
      kpis: JSON.parse(localStorage.getItem('ipma_kpis') || '[]'),
      questions: JSON.parse(localStorage.getItem('ipma_questions') || '[]'),
      sampleAnswers: JSON.parse(localStorage.getItem('ipma_sample_answers') || '[]'),
      trainingExamples: JSON.parse(localStorage.getItem('ipma_training_examples') || '[]'),
      companyCodes: JSON.parse(localStorage.getItem('ipma_company_codes') || '[]'),
      users: JSON.parse(localStorage.getItem('ipma_users') || '[]'),
      subscriptions: JSON.parse(localStorage.getItem('ipma_subscriptions') || '[]'),
      sessions: JSON.parse(localStorage.getItem('ipma_sessions') || '[]'),
      attempts: JSON.parse(localStorage.getItem('ipma_attempts') || '[]'),
      attemptItems: JSON.parse(localStorage.getItem('ipma_attempt_items') || '[]')
    };

    if (DEVELOPMENT_CONFIG.DATA.debugLogs) {
      console.log('✅ Backup created successfully:', {
        timestamp,
        topics: backup.topics.length,
        subtopics: backup.subtopics.length,
        kpis: backup.kpis.length,
        questions: backup.questions.length,
        attempts: backup.attempts.length
      });
    }

    return backup;
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
    throw new Error('Failed to create data backup');
  }
};

/**
 * Create a backup for a specific user
 */
export const createUserBackup = (userId: string): UserBackupData => {
  const timestamp = new Date().toISOString();
  
  try {
    const allAttempts = JSON.parse(localStorage.getItem('ipma_attempts') || '[]');
    const allAttemptItems = JSON.parse(localStorage.getItem('ipma_attempt_items') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('ipma_users') || '[]');
    
    const userAttempts = allAttempts.filter((attempt: Attempt) => attempt.userId === userId);
    const userAttemptItems = allAttemptItems.filter((item: AttemptItem) => 
      userAttempts.some((attempt: Attempt) => attempt.id === item.attemptId)
    );
    const userProfile = allUsers.find((user: UserProfile) => user.id === userId);

    const backup: UserBackupData = {
      version: DEVELOPMENT_CONFIG.DATA.version,
      timestamp,
      userId,
      attempts: userAttempts,
      attemptItems: userAttemptItems,
      userProfile: userProfile || {} as UserProfile
    };

    if (DEVELOPMENT_CONFIG.DATA.debugLogs) {
      console.log(`✅ User backup created for ${userId}:`, {
        timestamp,
        attempts: backup.attempts.length,
        attemptItems: backup.attemptItems.length
      });
    }

    return backup;
  } catch (error) {
    console.error('❌ Failed to create user backup:', error);
    throw new Error('Failed to create user backup');
  }
};

/**
 * Restore data from a backup
 */
export const restoreFromBackup = (backup: BackupData): void => {
  try {
    // Validate backup version
    if (backup.version !== DEVELOPMENT_CONFIG.DATA.version) {
      console.warn(`⚠️ Backup version mismatch. Backup: ${backup.version}, Current: ${DEVELOPMENT_CONFIG.DATA.version}`);
    }

    // Create a safety backup before restoring
    if (DEVELOPMENT_CONFIG.DATA.autoBackup) {
      const safetyBackup = createBackup();
      localStorage.setItem('ipma_backup_safety', JSON.stringify(safetyBackup));
      console.log('🛡️ Safety backup created before restore');
    }

    // Restore all data
    localStorage.setItem('ipma_topics', JSON.stringify(backup.topics || []));
    localStorage.setItem('ipma_subtopics', JSON.stringify(backup.subtopics || []));
    localStorage.setItem('ipma_kpis', JSON.stringify(backup.kpis || []));
    localStorage.setItem('ipma_questions', JSON.stringify(backup.questions || []));
    localStorage.setItem('ipma_sample_answers', JSON.stringify(backup.sampleAnswers || []));
    localStorage.setItem('ipma_training_examples', JSON.stringify(backup.trainingExamples || []));
    localStorage.setItem('ipma_company_codes', JSON.stringify(backup.companyCodes || []));
    localStorage.setItem('ipma_users', JSON.stringify(backup.users || []));
    localStorage.setItem('ipma_subscriptions', JSON.stringify(backup.subscriptions || []));
    localStorage.setItem('ipma_sessions', JSON.stringify(backup.sessions || []));
    localStorage.setItem('ipma_attempts', JSON.stringify(backup.attempts || []));
    localStorage.setItem('ipma_attempt_items', JSON.stringify(backup.attemptItems || []));

    console.log('✅ Data restored successfully from backup:', {
      timestamp: backup.timestamp,
      topics: backup.topics?.length || 0,
      subtopics: backup.subtopics?.length || 0,
      kpis: backup.kpis?.length || 0,
      questions: backup.questions?.length || 0,
      attempts: backup.attempts?.length || 0
    });
  } catch (error) {
    console.error('❌ Failed to restore from backup:', error);
    throw new Error('Failed to restore data from backup');
  }
};

/**
 * Restore user data from a backup
 */
export const restoreUserFromBackup = (backup: UserBackupData): void => {
  try {
    // Get existing data
    const allAttempts = JSON.parse(localStorage.getItem('ipma_attempts') || '[]');
    const allAttemptItems = JSON.parse(localStorage.getItem('ipma_attempt_items') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('ipma_users') || '[]');

    // Remove existing user data
    const filteredAttempts = allAttempts.filter((attempt: Attempt) => attempt.userId !== backup.userId);
    const filteredAttemptItems = allAttemptItems.filter((item: AttemptItem) => 
      !backup.attempts.some((attempt: Attempt) => attempt.id === item.attemptId)
    );
    const filteredUsers = allUsers.filter((user: UserProfile) => user.id !== backup.userId);

    // Add restored data
    const restoredAttempts = [...filteredAttempts, ...backup.attempts];
    const restoredAttemptItems = [...filteredAttemptItems, ...backup.attemptItems];
    const restoredUsers = [...filteredUsers, backup.userProfile];

    // Save restored data
    localStorage.setItem('ipma_attempts', JSON.stringify(restoredAttempts));
    localStorage.setItem('ipma_attempt_items', JSON.stringify(restoredAttemptItems));
    localStorage.setItem('ipma_users', JSON.stringify(restoredUsers));

    console.log(`✅ User data restored for ${backup.userId}:`, {
      timestamp: backup.timestamp,
      attempts: backup.attempts.length,
      attemptItems: backup.attemptItems.length
    });
  } catch (error) {
    console.error('❌ Failed to restore user data from backup:', error);
    throw new Error('Failed to restore user data from backup');
  }
};

/**
 * Export backup data to JSON file
 */
export const exportBackupToFile = (backup: BackupData, filename?: string): void => {
  try {
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `ipma-backup-${backup.timestamp.split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Backup exported to file:', link.download);
  } catch (error) {
    console.error('❌ Failed to export backup to file:', error);
    throw new Error('Failed to export backup to file');
  }
};

/**
 * Import backup data from JSON file
 */
export const importBackupFromFile = (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string) as BackupData;
          
          // Validate backup structure
          if (!backup.version || !backup.timestamp) {
            throw new Error('Invalid backup file format');
          }

          console.log('✅ Backup file imported successfully:', {
            version: backup.version,
            timestamp: backup.timestamp
          });

          resolve(backup);
        } catch (parseError) {
          console.error('❌ Failed to parse backup file:', parseError);
          reject(new Error('Invalid backup file format'));
        }
      };
      reader.onerror = () => {
        console.error('❌ Failed to read backup file');
        reject(new Error('Failed to read backup file'));
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('❌ Failed to import backup file:', error);
      reject(new Error('Failed to import backup file'));
    }
  });
};

/**
 * Get backup information without loading full data
 */
export const getBackupInfo = (): { lastBackup?: string; dataSize: number } => {
  try {
    const lastBackup = localStorage.getItem('ipma_last_backup');
    let dataSize = 0;
    
    // Calculate approximate data size
    const keys = ['ipma_topics', 'ipma_subtopics', 'ipma_kpis', 'ipma_questions', 'ipma_sample_answers', 'ipma_training_examples', 'ipma_company_codes', 'ipma_users', 'ipma_subscriptions', 'ipma_sessions', 'ipma_attempts', 'ipma_attempt_items'];
    
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        dataSize += data.length;
      }
    });

    return {
      lastBackup: lastBackup || undefined,
      dataSize
    };
  } catch (error) {
    console.error('❌ Failed to get backup info:', error);
    return { dataSize: 0 };
  }
};

/**
 * Clear all application data (with safety backup)
 */
export const clearAllData = (): void => {
  try {
    // Create safety backup before clearing
    if (DEVELOPMENT_CONFIG.DATA.autoBackup) {
      const safetyBackup = createBackup();
      localStorage.setItem('ipma_backup_clear_safety', JSON.stringify(safetyBackup));
      console.log('🛡️ Safety backup created before clearing all data');
    }

    // Clear all data
    const keys = ['ipma_topics', 'ipma_subtopics', 'ipma_kpis', 'ipma_questions', 'ipma_sample_answers', 'ipma_training_examples', 'ipma_company_codes', 'ipma_users', 'ipma_subscriptions', 'ipma_sessions', 'ipma_attempts', 'ipma_attempt_items'];
    
    keys.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('✅ All application data cleared');
  } catch (error) {
    console.error('❌ Failed to clear all data:', error);
    throw new Error('Failed to clear all data');
  }
};
