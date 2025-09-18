import { supabase } from '../lib/supabase'
import { 
  Topic, Question, KPI, CompanyCode, Subtopic, SampleAnswer, 
  TrainingExample, Attempt, AttemptItem, UserProfile, Subscription 
} from '../types'

export interface DataSnapshot {
  topics: Topic[]
  questions: Question[]
  kpis: KPI[]
  companyCodes: CompanyCode[]
  subtopics: Subtopic[]
  sampleAnswers: SampleAnswer[]
  trainingExamples: TrainingExample[]
  users: UserProfile[]
  subscriptions: Subscription[]
  attempts: Attempt[]
  attemptItems: AttemptItem[]
  metadata: {
    version: string
    timestamp: string
    recordCount: number
  }
}

export class DataMigrationService {
  private static instance: DataMigrationService
  private isInitialized = false

  static getInstance(): DataMigrationService {
    if (!DataMigrationService.instance) {
      DataMigrationService.instance = new DataMigrationService()
    }
    return DataMigrationService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return
    
    try {
      // Check if we can connect to Supabase
      const { error } = await supabase.from('topics').select('count').limit(1)
      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
        throw error
      }
      this.isInitialized = true
      console.log('✅ DataMigrationService initialized')
    } catch (error) {
      console.warn('⚠️ Supabase not available, using localStorage fallback:', error)
      this.isInitialized = true
    }
  }

  // Export all data from localStorage
  async exportAllData(): Promise<DataSnapshot> {
    const snapshot: DataSnapshot = {
      topics: this.loadFromStorage('ipma_topics', []),
      questions: this.loadFromStorage('ipma_questions', []),
      kpis: this.loadFromStorage('ipma_kpis', []),
      companyCodes: this.loadFromStorage('ipma_company_codes', []),
      subtopics: this.loadFromStorage('ipma_subtopics', []),
      sampleAnswers: this.loadFromStorage('ipma_sample_answers', []),
      trainingExamples: this.loadFromStorage('ipma_training_examples', []),
      users: this.loadFromStorage('ipma_users', []),
      subscriptions: this.loadFromStorage('ipma_subscriptions', []),
      attempts: this.loadAllAttempts(),
      attemptItems: this.loadAllAttemptItems(),
      metadata: {
        version: '1.0',
        timestamp: new Date().toISOString(),
        recordCount: 0
      }
    }

    // Calculate total record count
    snapshot.metadata.recordCount = Object.values(snapshot).reduce((total, arr) => {
      return total + (Array.isArray(arr) ? arr.length : 0)
    }, 0)

    return snapshot
  }

  // Import data to localStorage
  async importData(snapshot: DataSnapshot): Promise<void> {
    try {
      // Save all data to localStorage
      localStorage.setItem('ipma_topics', JSON.stringify(snapshot.topics))
      localStorage.setItem('ipma_questions', JSON.stringify(snapshot.questions))
      localStorage.setItem('ipma_kpis', JSON.stringify(snapshot.kpis))
      localStorage.setItem('ipma_company_codes', JSON.stringify(snapshot.companyCodes))
      localStorage.setItem('ipma_subtopics', JSON.stringify(snapshot.subtopics))
      localStorage.setItem('ipma_sample_answers', JSON.stringify(snapshot.sampleAnswers))
      localStorage.setItem('ipma_training_examples', JSON.stringify(snapshot.trainingExamples))
      localStorage.setItem('ipma_users', JSON.stringify(snapshot.users))
      localStorage.setItem('ipma_subscriptions', JSON.stringify(snapshot.subscriptions))

      // Save attempts and attempt items
      this.saveAllAttempts(snapshot.attempts)
      this.saveAllAttemptItems(snapshot.attemptItems)

      console.log('✅ Data imported successfully:', snapshot.metadata)
    } catch (error) {
      console.error('❌ Error importing data:', error)
      throw error
    }
  }

  // Sync data to Supabase
  async syncToSupabase(): Promise<void> {
    try {
      console.log('🔄 Starting Supabase sync...')
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
      }
      
      console.log('✅ Supabase configuration found')
      const snapshot = await this.exportAllData()
      console.log('📊 Data snapshot created:', {
        topics: snapshot.topics.length,
        questions: snapshot.questions.length,
        kpis: snapshot.kpis.length,
        companyCodes: snapshot.companyCodes.length,
        subtopics: snapshot.subtopics.length,
        sampleAnswers: snapshot.sampleAnswers.length,
        trainingExamples: snapshot.trainingExamples.length,
        users: snapshot.users.length,
        subscriptions: snapshot.subscriptions.length,
        attempts: snapshot.attempts.length,
        attemptItems: snapshot.attemptItems.length
      })
      
      // Sync each data type
      await this.syncTopics(snapshot.topics)
      await this.syncQuestions(snapshot.questions)
      await this.syncKPIs(snapshot.kpis)
      await this.syncCompanyCodes(snapshot.companyCodes)
      await this.syncSubtopics(snapshot.subtopics)
      await this.syncSampleAnswers(snapshot.sampleAnswers)
      await this.syncTrainingExamples(snapshot.trainingExamples)
      await this.syncUsers(snapshot.users)
      await this.syncSubscriptions(snapshot.subscriptions)
      await this.syncAttempts(snapshot.attempts)
      await this.syncAttemptItems(snapshot.attemptItems)

      // Save backup to Supabase
      await this.saveBackupToSupabase(snapshot, 'auto_sync')

      console.log('✅ All data synced to Supabase successfully!')
    } catch (error) {
      console.error('❌ Error syncing to Supabase:', error)
      throw error
    }
  }

  // Sync data from Supabase
  async syncFromSupabase(): Promise<void> {
    try {
      const snapshot = await this.loadFromSupabase()
      await this.importData(snapshot)
      console.log('✅ Data synced from Supabase successfully')
    } catch (error) {
      console.error('❌ Error syncing from Supabase:', error)
      throw error
    }
  }

  // Automatic backup before deployment
  async createAutomaticBackup(): Promise<string> {
    try {
      const snapshot = await this.exportAllData()
      const backupName = `auto_backup_${new Date().toISOString().split('T')[0]}_${Date.now()}`
      
      // Save to localStorage
      localStorage.setItem('last_auto_backup', JSON.stringify({
        name: backupName,
        data: snapshot,
        timestamp: new Date().toISOString()
      }))

      // Try to save to Supabase if available
      try {
        await this.saveBackupToSupabase(snapshot, 'automatic', backupName)
      } catch (error) {
        console.warn('⚠️ Could not save backup to Supabase:', error)
      }

      // Download backup file
      this.downloadBackupFile(snapshot, backupName)

      console.log('✅ Automatic backup created:', backupName)
      return backupName
    } catch (error) {
      console.error('❌ Error creating automatic backup:', error)
      throw error
    }
  }

  // Restore from automatic backup
  async restoreFromAutomaticBackup(): Promise<void> {
    try {
      const backupData = localStorage.getItem('last_auto_backup')
      if (!backupData) {
        throw new Error('No automatic backup found')
      }

      const backup = JSON.parse(backupData)
      await this.importData(backup.data)
      console.log('✅ Restored from automatic backup:', backup.name)
    } catch (error) {
      console.error('❌ Error restoring from automatic backup:', error)
      throw error
    }
  }

  // Private helper methods
  private loadFromStorage<T>(key: string, fallback: T[]): T[] {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : fallback
    } catch (error) {
      console.warn(`⚠️ Error loading ${key}:`, error)
      return fallback
    }
  }

  // Generate a consistent UUID from a string ID
  private generateUUID(inputId: string): string {
    // Create a deterministic UUID from the input string using browser-compatible method
    const encoder = new TextEncoder()
    const data = encoder.encode(inputId)
    
    // Simple hash function for browser compatibility
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data[i]
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Convert to hex string
    const hex = Math.abs(hash).toString(16).padStart(8, '0')
    const hex2 = Math.abs(hash * 31).toString(16).padStart(8, '0')
    const hex3 = Math.abs(hash * 17).toString(16).padStart(8, '0')
    const hex4 = Math.abs(hash * 13).toString(16).padStart(8, '0')
    
    return [
      hex.substring(0, 8),
      hex2.substring(0, 4),
      hex3.substring(0, 4),
      hex4.substring(0, 4),
      hex.substring(0, 4) + hex2.substring(0, 8)
    ].join('-')
  }

  private loadAllAttempts(): Attempt[] {
    const attempts: Attempt[] = []
    const sessions = JSON.parse(localStorage.getItem('ipma_sessions') || '[]')
    
    sessions.forEach((session: any) => {
      const userAttempts = this.loadFromStorage(`ipma_attempts_${session.userId}`, [])
      attempts.push(...userAttempts)
    })

    return attempts
  }

  private loadAllAttemptItems(): AttemptItem[] {
    const attemptItems: AttemptItem[] = []
    const sessions = JSON.parse(localStorage.getItem('ipma_sessions') || '[]')
    
    sessions.forEach((session: any) => {
      const userAttemptItems = this.loadFromStorage(`ipma_attempt_items_${session.userId}`, [])
      attemptItems.push(...userAttemptItems)
    })

    return attemptItems
  }

  private saveAllAttempts(attempts: Attempt[]): void {
    const attemptsByUser = attempts.reduce((acc, attempt) => {
      const userId = attempt.userId
      if (!acc[userId]) acc[userId] = []
      acc[userId].push(attempt)
      return acc
    }, {} as Record<string, Attempt[]>)

    Object.entries(attemptsByUser).forEach(([userId, userAttempts]) => {
      localStorage.setItem(`ipma_attempts_${userId}`, JSON.stringify(userAttempts))
    })
  }

  private saveAllAttemptItems(attemptItems: AttemptItem[]): void {
    // Group attempt items by attempt ID since AttemptItem doesn't have userId
    const itemsByAttempt = attemptItems.reduce((acc, item) => {
      const attemptId = item.attemptId
      if (!acc[attemptId]) acc[attemptId] = []
      acc[attemptId].push(item)
      return acc
    }, {} as Record<string, AttemptItem[]>)

    Object.entries(itemsByAttempt).forEach(([attemptId, attemptItems]) => {
      localStorage.setItem(`ipma_attempt_items_${attemptId}`, JSON.stringify(attemptItems))
    })
  }

  private async syncTopics(topics: Topic[]): Promise<void> {
    if (!topics.length) return
    
    const { error } = await supabase
      .from('topics')
      .upsert(topics.map(topic => ({
        id: this.generateUUID(topic.id), // Convert to proper UUID
        title: topic.title,
        description: topic.description,
        order_index: 0, // Default order since Topic doesn't have orderIndex
        is_active: topic.isActive !== false,
        created_at: topic.createdAt || new Date().toISOString(),
        updated_at: topic.updatedAt || new Date().toISOString()
      })), { onConflict: 'id' })

    if (error) {
      console.error('❌ Error syncing topics:', error)
      console.error('❌ Error details:', error.message, error.code, error.details)
      throw error
    }
    console.log(`✅ Synced ${topics.length} topics to Supabase`)
  }

  private async syncQuestions(questions: Question[]): Promise<void> {
    if (!questions.length) return
    
    const { error } = await supabase
      .from('questions')
      .upsert(questions.map(question => ({
        id: this.generateUUID(question.id), // Convert to proper UUID
        topic_id: this.generateUUID(question.topicId), // Convert topic ID to UUID
        subtopic_id: question.subtopicId ? this.generateUUID(question.subtopicId) : null,
        prompt: question.prompt,
        difficulty_level: 1, // Default since Question doesn't have difficultyLevel
        time_limit: 300, // Default since Question doesn't have timeLimit
        is_active: question.isActive !== false,
        created_at: question.createdAt || new Date().toISOString(),
        updated_at: question.updatedAt || new Date().toISOString()
      })), { onConflict: 'id' })

    if (error) {
      console.error('❌ Error syncing questions:', error)
      console.error('❌ Error details:', error.message, error.code, error.details)
      throw error
    }
    console.log(`✅ Synced ${questions.length} questions to Supabase`)
  }

  private async syncKPIs(kpis: KPI[]): Promise<void> {
    if (!kpis.length) return
    
    const { error } = await supabase
      .from('kpis')
      .upsert(kpis.map(kpi => ({
        id: this.generateUUID(kpi.id), // Convert to proper UUID
        name: kpi.name,
        description: '', // Default since KPI doesn't have description
        weight: 1.00, // Default since KPI doesn't have weight
        is_active: true, // Default since KPI doesn't have isActive
        created_at: kpi.createdAt || new Date().toISOString(),
        updated_at: kpi.updatedAt || new Date().toISOString()
      })), { onConflict: 'id' })

    if (error) {
      console.error('❌ Error syncing KPIs:', error)
      console.error('❌ Error details:', error.message, error.code, error.details)
      throw error
    }
    console.log(`✅ Synced ${kpis.length} KPIs to Supabase`)
  }

  private async syncCompanyCodes(companyCodes: CompanyCode[]): Promise<void> {
    if (!companyCodes.length) return
    
    const { error } = await supabase
      .from('company_codes')
      .upsert(companyCodes.map(code => ({
        id: this.generateUUID(code.id), // Convert to proper UUID
        code: code.code,
        name: code.companyName, // Use companyName instead of name
        description: '', // Default since CompanyCode doesn't have description
        is_active: code.isActive !== false,
        created_at: code.createdAt,
        updated_at: code.updatedAt
      })), { onConflict: 'id' })

    if (error) {
      console.error('❌ Error syncing company codes:', error)
      throw error
    }
    console.log(`✅ Synced ${companyCodes.length} company codes to Supabase`)
  }

  private async syncSubtopics(subtopics: Subtopic[]): Promise<void> {
    if (!subtopics.length) return
    
    const { error } = await supabase
      .from('subtopics')
      .upsert(subtopics.map(subtopic => ({
        id: this.generateUUID(subtopic.id), // Convert to proper UUID
        topic_id: this.generateUUID(subtopic.topicId), // Convert topic ID to UUID
        title: subtopic.title,
        description: subtopic.description,
        order_index: 0, // Default since Subtopic doesn't have orderIndex
        created_at: subtopic.createdAt,
        updated_at: subtopic.updatedAt
      })), { onConflict: 'id' })

    if (error) {
      console.error('❌ Error syncing subtopics:', error)
      throw error
    }
    console.log(`✅ Synced ${subtopics.length} subtopics to Supabase`)
  }

  private async syncSampleAnswers(sampleAnswers: SampleAnswer[]): Promise<void> {
    if (!sampleAnswers.length) return
    
    const { error } = await supabase
      .from('sample_answers')
      .upsert(sampleAnswers.map(answer => ({
        id: this.generateUUID(answer.id), // Convert to proper UUID
        question_id: this.generateUUID(answer.questionId), // Convert question ID to UUID
        answer_text: answer.answerText,
        quality_score: answer.qualityRating || 3.00, // Use qualityRating instead of qualityScore
        is_active: true, // Default since SampleAnswer doesn't have isActive
        created_at: answer.createdAt || new Date().toISOString(),
        updated_at: answer.updatedAt || new Date().toISOString()
      })), { onConflict: 'id' })

    if (error) {
      console.error('❌ Error syncing sample answers:', error)
      console.error('❌ Error details:', error.message, error.code, error.details)
      throw error
    }
    console.log(`✅ Synced ${sampleAnswers.length} sample answers to Supabase`)
  }

  private async syncTrainingExamples(trainingExamples: TrainingExample[]): Promise<void> {
    if (!trainingExamples.length) return
    
    const { error } = await supabase
      .from('training_examples')
      .upsert(trainingExamples.map(example => ({
        id: this.generateUUID(example.id), // Convert to proper UUID
        question_id: this.generateUUID(example.questionId), // Convert question ID to UUID
        example_text: example.answerText, // Use answerText instead of exampleText
        quality_score: example.qualityRating || 3.00, // Use qualityRating instead of qualityScore
        is_active: true, // Default since TrainingExample doesn't have isActive
        created_at: example.createdAt || new Date().toISOString(),
        updated_at: example.updatedAt || new Date().toISOString()
      })), { onConflict: 'id' })

    if (error) {
      console.error('❌ Error syncing training examples:', error)
      console.error('❌ Error details:', error.message, error.code, error.details)
      throw error
    }
    console.log(`✅ Synced ${trainingExamples.length} training examples to Supabase`)
  }

  private async syncUsers(users: UserProfile[]): Promise<void> {
    if (!users.length) return
    
    const { error } = await supabase
      .from('users')
      .upsert(users.map(user => ({
        id: this.generateUUID(user.id), // Convert to proper UUID
        email: user.email,
        name: user.name,
        role: user.role,
        company_code: user.companyCode,
        company_name: user.companyName,
        subscription_id: user.subscription?.id ? this.generateUUID(user.subscription.id) : null,
        created_at: user.createdAt || new Date().toISOString(),
        updated_at: user.updatedAt || new Date().toISOString()
      })), { onConflict: 'id' })

    if (error) {
      console.error('❌ Error syncing users:', error)
      console.error('❌ Error details:', error.message, error.code, error.details)
      throw error
    }
    console.log(`✅ Synced ${users.length} users to Supabase`)
  }

  private async syncSubscriptions(subscriptions: Subscription[]): Promise<void> {
    if (!subscriptions.length) return
    
    const { error } = await supabase
      .from('subscriptions')
      .upsert(subscriptions.map(sub => ({
        id: this.generateUUID(sub.id), // Convert to proper UUID
        user_id: this.generateUUID(sub.userId), // Convert user ID to UUID
        start_date: sub.startDate,
        end_date: sub.endDate,
        is_active: sub.isActive,
        plan_type: sub.planType,
        auto_renew: sub.autoRenew,
        reminder_sent: sub.reminderSent,
        created_at: sub.createdAt || new Date().toISOString(),
        updated_at: sub.updatedAt || new Date().toISOString()
      })), { onConflict: 'id' })

    if (error) {
      console.error('❌ Error syncing subscriptions:', error)
      console.error('❌ Error details:', error.message, error.code, error.details)
      throw error
    }
    console.log(`✅ Synced ${subscriptions.length} subscriptions to Supabase`)
  }

  private async syncAttempts(attempts: Attempt[]): Promise<void> {
    if (!attempts.length) return
    
    const { error } = await supabase
      .from('attempts')
      .upsert(attempts.map(attempt => ({
        id: this.generateUUID(attempt.id), // Convert to proper UUID
        user_id: this.generateUUID(attempt.userId), // Convert user ID to UUID
        topic_id: this.generateUUID(attempt.topicId), // Convert topic ID to UUID
        selected_question_ids: attempt.selectedQuestionIds.map(id => this.generateUUID(id)), // Convert question IDs to UUIDs
        start_time: attempt.startTime,
        end_time: attempt.endTime,
        total_score: null, // Default since Attempt doesn't have totalScore
        status: attempt.status,
        created_at: attempt.createdAt || new Date().toISOString(),
        updated_at: attempt.updatedAt || new Date().toISOString()
      })), { onConflict: 'id' })

    if (error) {
      console.error('❌ Error syncing attempts:', error)
      console.error('❌ Error details:', error.message, error.code, error.details)
      throw error
    }
    console.log(`✅ Synced ${attempts.length} attempts to Supabase`)
  }

  private async syncAttemptItems(attemptItems: AttemptItem[]): Promise<void> {
    if (!attemptItems.length) return
    
    const { error } = await supabase
      .from('attempt_items')
      .upsert(attemptItems.map(item => ({
        id: this.generateUUID(item.id), // Convert to proper UUID
        attempt_id: this.generateUUID(item.attemptId), // Convert attempt ID to UUID
        question_id: this.generateUUID(item.questionId), // Convert question ID to UUID
        answer_text: item.answer, // Use answer instead of answerText
        kpi_scores: {}, // Default since AttemptItem doesn't have kpiScores
        total_score: item.score, // Use score instead of totalScore
        time_spent: item.durationSec || 0, // Use durationSec instead of timeSpent
        created_at: item.createdAt || new Date().toISOString(),
        updated_at: item.updatedAt || new Date().toISOString()
      })), { onConflict: 'id' })

    if (error) {
      console.error('❌ Error syncing attempt items:', error)
      console.error('❌ Error details:', error.message, error.code, error.details)
      throw error
    }
    console.log(`✅ Synced ${attemptItems.length} attempt items to Supabase`)
  }

  private async saveBackupToSupabase(snapshot: DataSnapshot, type: string, name?: string): Promise<void> {
    const backupName = name || `backup_${new Date().toISOString()}`
    
    const { error } = await supabase
      .from('data_backups')
      .insert({
        backup_name: backupName,
        backup_type: type,
        data_snapshot: snapshot,
        version: '1.0',
        metadata: {
          recordCount: snapshot.metadata.recordCount,
          timestamp: snapshot.metadata.timestamp
        }
      })

    if (error) throw error
  }

  private async loadFromSupabase(): Promise<DataSnapshot> {
    // Get the latest backup
    const { data, error } = await supabase
      .from('data_backups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    return data.data_snapshot
  }

  private downloadBackupFile(snapshot: DataSnapshot, filename: string): void {
    const dataStr = JSON.stringify(snapshot, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `${filename}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Export singleton instance
export const dataMigration = DataMigrationService.getInstance()
