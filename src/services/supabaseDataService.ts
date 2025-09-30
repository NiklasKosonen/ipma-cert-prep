import { supabase } from '../lib/supabase'
import { 
  Topic, Subtopic, Question, KPI, CompanyCode, 
  SampleAnswer, TrainingExample, UserProfile, Subscription,
  Attempt, AttemptItem
} from '../types'

/**
 * SupabaseDataService
 * Handles all Supabase database operations for the IPMA platform
 * Ensures data persistence with RLS enabled
 */
export class SupabaseDataService {
  private static instance: SupabaseDataService

  static getInstance(): SupabaseDataService {
    if (!SupabaseDataService.instance) {
      SupabaseDataService.instance = new SupabaseDataService()
    }
    return SupabaseDataService.instance
  }

  // =====================================================
  // TOPICS
  // =====================================================

  async upsertTopic(topic: Topic): Promise<void> {
    const { error } = await supabase
      .from('topics')
      .upsert({
        id: topic.id,
        title: topic.title,
        description: topic.description,
        is_active: topic.isActive,
        created_at: topic.createdAt,
        updated_at: topic.updatedAt
      }, { onConflict: 'id' })

    if (error) throw new Error(`Failed to save topic: ${error.message}`)
  }

  async deleteTopic(id: string): Promise<void> {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete topic: ${error.message}`)
  }

  async getAllTopics(): Promise<Topic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch topics: ${error.message}`)
    
    return (data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      isActive: t.is_active,
      subtopics: [],
      createdAt: t.created_at,
      updatedAt: t.updated_at
    }))
  }

  // =====================================================
  // SUBTOPICS
  // =====================================================

  async upsertSubtopic(subtopic: Subtopic): Promise<void> {
    const { error } = await supabase
      .from('subtopics')
      .upsert({
        id: subtopic.id,
        topic_id: subtopic.topicId,
        title: subtopic.title,
        description: subtopic.description,
        is_active: subtopic.isActive,
        created_at: subtopic.createdAt,
        updated_at: subtopic.updatedAt
      }, { onConflict: 'id' })

    if (error) throw new Error(`Failed to save subtopic: ${error.message}`)
  }

  async deleteSubtopic(id: string): Promise<void> {
    const { error } = await supabase
      .from('subtopics')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete subtopic: ${error.message}`)
  }

  async getAllSubtopics(): Promise<Subtopic[]> {
    const { data, error } = await supabase
      .from('subtopics')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch subtopics: ${error.message}`)
    
    return (data || []).map((s: any) => ({
      id: s.id,
      topicId: s.topic_id,
      title: s.title,
      description: s.description,
      isActive: s.is_active,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }))
  }

  // =====================================================
  // QUESTIONS
  // =====================================================

  async upsertQuestion(question: Question): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .upsert({
        id: question.id,
        topic_id: question.topicId,
        subtopic_id: question.subtopicId,
        prompt: question.prompt,
        is_active: question.isActive,
        created_at: question.createdAt,
        updated_at: question.updatedAt
      }, { onConflict: 'id' })

    if (error) throw new Error(`Failed to save question: ${error.message}`)
  }

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete question: ${error.message}`)
  }

  async getAllQuestions(): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch questions: ${error.message}`)
    
    return (data || []).map((q: any) => ({
      id: q.id,
      topicId: q.topic_id,
      subtopicId: q.subtopic_id,
      prompt: q.prompt,
      isActive: q.is_active,
      connectedKPIs: [],
      createdAt: q.created_at,
      updatedAt: q.updated_at
    }))
  }

  // =====================================================
  // KPIS
  // =====================================================

  async upsertKPI(kpi: KPI): Promise<void> {
    const { error } = await supabase
      .from('kpis')
      .upsert({
        id: kpi.id,
        topic_id: kpi.topicId,
        subtopic_id: kpi.subtopicId,
        name: kpi.name,
        is_essential: kpi.isEssential,
        created_at: kpi.createdAt,
        updated_at: kpi.updatedAt
      }, { onConflict: 'id' })

    if (error) throw new Error(`Failed to save KPI: ${error.message}`)
  }

  async deleteKPI(id: string): Promise<void> {
    const { error } = await supabase
      .from('kpis')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete KPI: ${error.message}`)
  }

  async getAllKPIs(): Promise<KPI[]> {
    const { data, error } = await supabase
      .from('kpis')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch KPIs: ${error.message}`)
    
    return (data || []).map((k: any) => ({
      id: k.id,
      topicId: k.topic_id,
      subtopicId: k.subtopic_id,
      name: k.name,
      isEssential: k.is_essential,
      connectedQuestions: [],
      createdAt: k.created_at,
      updatedAt: k.updated_at
    }))
  }

  // =====================================================
  // COMPANY CODES
  // =====================================================

  async upsertCompanyCode(company: CompanyCode): Promise<void> {
    const { error } = await supabase
      .from('company_codes')
      .upsert({
        id: company.id,
        code: company.code,
        company_name: company.companyName,
        admin_email: company.adminEmail,
        is_active: company.isActive,
        max_users: company.maxUsers,
        expires_at: company.expiresAt,
        created_at: company.createdAt,
        updated_at: company.updatedAt
      }, { onConflict: 'id' })

    if (error) throw new Error(`Failed to save company code: ${error.message}`)
  }

  async deleteCompanyCode(id: string): Promise<void> {
    const { error } = await supabase
      .from('company_codes')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete company code: ${error.message}`)
  }

  async getAllCompanyCodes(): Promise<CompanyCode[]> {
    const { data, error } = await supabase
      .from('company_codes')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch company codes: ${error.message}`)
    
    return (data || []).map((c: any) => ({
      id: c.id,
      code: c.code,
      companyName: c.company_name,
      adminEmail: c.admin_email,
      isActive: c.is_active,
      maxUsers: c.max_users,
      expiresAt: c.expires_at,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }))
  }

  // =====================================================
  // SAMPLE ANSWERS
  // =====================================================

  async upsertSampleAnswer(answer: SampleAnswer): Promise<void> {
    const { error } = await supabase
      .from('sample_answers')
      .upsert({
        id: answer.id,
        question_id: answer.questionId,
        answer_text: answer.answerText,
        quality_rating: answer.qualityRating,
        detected_kpis: answer.detectedKPIs,
        feedback: answer.feedback,
        created_at: answer.createdAt,
        updated_at: answer.updatedAt
      }, { onConflict: 'id' })

    if (error) throw new Error(`Failed to save sample answer: ${error.message}`)
  }

  async deleteSampleAnswer(id: string): Promise<void> {
    const { error } = await supabase
      .from('sample_answers')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete sample answer: ${error.message}`)
  }

  async getAllSampleAnswers(): Promise<SampleAnswer[]> {
    const { data, error } = await supabase
      .from('sample_answers')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch sample answers: ${error.message}`)
    
    return (data || []).map((a: any) => ({
      id: a.id,
      questionId: a.question_id,
      answerText: a.answer_text,
      qualityRating: a.quality_rating,
      detectedKPIs: a.detected_kpis || [],
      feedback: a.feedback,
      createdAt: a.created_at,
      updatedAt: a.updated_at
    }))
  }

  // =====================================================
  // TRAINING EXAMPLES
  // =====================================================

  async upsertTrainingExample(example: TrainingExample): Promise<void> {
    const { error } = await supabase
      .from('training_examples')
      .upsert({
        id: example.id,
        question_id: example.questionId,
        answer_text: example.answerText,
        quality_rating: example.qualityRating,
        detected_kpis: example.detectedKPIs,
        feedback: example.feedback,
        example_type: example.exampleType,
        created_at: example.createdAt,
        updated_at: example.updatedAt
      }, { onConflict: 'id' })

    if (error) throw new Error(`Failed to save training example: ${error.message}`)
  }

  async deleteTrainingExample(id: string): Promise<void> {
    const { error } = await supabase
      .from('training_examples')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete training example: ${error.message}`)
  }

  async getAllTrainingExamples(): Promise<TrainingExample[]> {
    const { data, error } = await supabase
      .from('training_examples')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch training examples: ${error.message}`)
    
    return (data || []).map((e: any) => ({
      id: e.id,
      questionId: e.question_id,
      answerText: e.answer_text,
      qualityRating: e.quality_rating,
      detectedKPIs: e.detected_kpis || [],
      feedback: e.feedback,
      exampleType: e.example_type,
      createdAt: e.created_at,
      updatedAt: e.updated_at
    }))
  }

  // =====================================================
  // USERS
  // =====================================================

  async upsertUser(user: UserProfile): Promise<void> {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company_code: user.companyCode,
        company_name: user.companyName,
        created_at: user.createdAt,
        updated_at: user.updatedAt
      }, { onConflict: 'id' })

    if (error) throw new Error(`Failed to save user: ${error.message}`)
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete user: ${error.message}`)
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch users: ${error.message}`)
    
    return (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      companyCode: u.company_code,
      companyName: u.company_name,
      createdAt: u.created_at,
      updatedAt: u.updated_at
    }))
  }

  // =====================================================
  // SUBSCRIPTIONS
  // =====================================================

  async upsertSubscription(subscription: Subscription): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        id: subscription.id,
        user_id: subscription.userId,
        start_date: subscription.startDate,
        end_date: subscription.endDate,
        is_active: subscription.isActive,
        plan_type: subscription.planType,
        auto_renew: subscription.autoRenew,
        reminder_sent: subscription.reminderSent,
        created_at: subscription.createdAt,
        updated_at: subscription.updatedAt
      }, { onConflict: 'id' })

    if (error) throw new Error(`Failed to save subscription: ${error.message}`)
  }

  async deleteSubscription(id: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete subscription: ${error.message}`)
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch subscriptions: ${error.message}`)
    
    return (data || []).map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      startDate: s.start_date,
      endDate: s.end_date,
      isActive: s.is_active,
      planType: s.plan_type,
      autoRenew: s.auto_renew,
      reminderSent: s.reminder_sent,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }))
  }

  // =====================================================
  // ATTEMPTS
  // =====================================================

  async upsertAttempt(attempt: Attempt): Promise<void> {
    const { error } = await supabase
      .from('attempts')
      .upsert({
        id: attempt.id,
        user_id: attempt.userId,
        topic_id: attempt.topicId,
        selected_question_ids: attempt.selectedQuestionIds,
        start_time: attempt.startTime,
        end_time: attempt.endTime,
        status: attempt.status,
        total_time: attempt.totalTime,
        time_remaining: attempt.timeRemaining,
        submitted_at: attempt.submittedAt,
        created_at: attempt.createdAt,
        updated_at: attempt.updatedAt
      }, { onConflict: 'id' })

    if (error) throw new Error(`Failed to save attempt: ${error.message}`)
  }

  async getUserAttempts(userId: string): Promise<Attempt[]> {
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch attempts: ${error.message}`)
    
    return (data || []).map((a: any) => ({
      id: a.id,
      userId: a.user_id,
      topicId: a.topic_id,
      selectedQuestionIds: a.selected_question_ids,
      startTime: a.start_time,
      endTime: a.end_time,
      status: a.status,
      totalTime: a.total_time,
      timeRemaining: a.time_remaining,
      submittedAt: a.submitted_at,
      createdAt: a.created_at,
      updatedAt: a.updated_at
    }))
  }

  // =====================================================
  // ATTEMPT ITEMS
  // =====================================================

  async upsertAttemptItem(item: AttemptItem): Promise<void> {
    const { error } = await supabase
      .from('attempt_items')
      .upsert({
        id: item.id,
        attempt_id: item.attemptId,
        question_id: item.questionId,
        answer: item.answer,
        kpis_detected: item.kpisDetected,
        kpis_missing: item.kpisMissing,
        score: item.score,
        max_score: item.maxScore,
        feedback: item.feedback,
        is_evaluated: item.isEvaluated,
        evaluation_json: item.evaluationJSON,
        duration_sec: item.durationSec,
        submitted_at: item.submittedAt,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      }, { onConflict: 'id' })

    if (error) throw new Error(`Failed to save attempt item: ${error.message}`)
  }

  async getAttemptItems(attemptId: string): Promise<AttemptItem[]> {
    const { data, error } = await supabase
      .from('attempt_items')
      .select('*')
      .eq('attempt_id', attemptId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(`Failed to fetch attempt items: ${error.message}`)
    
    return (data || []).map((i: any) => ({
      id: i.id,
      attemptId: i.attempt_id,
      questionId: i.question_id,
      answer: i.answer,
      kpisDetected: i.kpis_detected || [],
      kpisMissing: i.kpis_missing || [],
      score: i.score,
      maxScore: i.max_score,
      feedback: i.feedback,
      isEvaluated: i.is_evaluated,
      evaluationJSON: i.evaluation_json,
      durationSec: i.duration_sec,
      submittedAt: i.submitted_at,
      createdAt: i.created_at,
      updatedAt: i.updated_at
    }))
  }

  // =====================================================
  // BULK SYNC OPERATIONS
  // =====================================================

  async syncAllData(data: {
    topics?: Topic[]
    subtopics?: Subtopic[]
    questions?: Question[]
    kpis?: KPI[]
    companyCodes?: CompanyCode[]
    sampleAnswers?: SampleAnswer[]
    trainingExamples?: TrainingExample[]
    users?: UserProfile[]
    subscriptions?: Subscription[]
  }): Promise<void> {
    console.log('🔄 Starting bulk sync to Supabase...')

    try {
      if (data.topics && data.topics.length > 0) {
        for (const topic of data.topics) {
          await this.upsertTopic(topic)
        }
        console.log(`✅ Synced ${data.topics.length} topics`)
      }

      if (data.subtopics && data.subtopics.length > 0) {
        for (const subtopic of data.subtopics) {
          await this.upsertSubtopic(subtopic)
        }
        console.log(`✅ Synced ${data.subtopics.length} subtopics`)
      }

      if (data.questions && data.questions.length > 0) {
        for (const question of data.questions) {
          await this.upsertQuestion(question)
        }
        console.log(`✅ Synced ${data.questions.length} questions`)
      }

      if (data.kpis && data.kpis.length > 0) {
        for (const kpi of data.kpis) {
          await this.upsertKPI(kpi)
        }
        console.log(`✅ Synced ${data.kpis.length} KPIs`)
      }

      if (data.companyCodes && data.companyCodes.length > 0) {
        for (const company of data.companyCodes) {
          await this.upsertCompanyCode(company)
        }
        console.log(`✅ Synced ${data.companyCodes.length} company codes`)
      }

      if (data.sampleAnswers && data.sampleAnswers.length > 0) {
        for (const answer of data.sampleAnswers) {
          await this.upsertSampleAnswer(answer)
        }
        console.log(`✅ Synced ${data.sampleAnswers.length} sample answers`)
      }

      if (data.trainingExamples && data.trainingExamples.length > 0) {
        for (const example of data.trainingExamples) {
          await this.upsertTrainingExample(example)
        }
        console.log(`✅ Synced ${data.trainingExamples.length} training examples`)
      }

      console.log('🎉 Bulk sync completed successfully!')
    } catch (error) {
      console.error('❌ Bulk sync failed:', error)
      throw error
    }
  }
}

