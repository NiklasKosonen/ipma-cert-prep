import { supabase } from '../lib/supabase'
import { Attempt, AttemptItem, ExamResult } from '../types'

export class ExamDataService {
  // Save exam attempt to Supabase
  static async saveAttempt(attempt: Attempt): Promise<void> {
    try {
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
        })

      if (error) {
        console.error('Error saving attempt:', error)
        throw error
      }

      console.log('✅ Attempt saved to Supabase:', attempt.id)
    } catch (error) {
      console.error('Failed to save attempt:', error)
      throw error
    }
  }

  // Save attempt item (individual question answer) to Supabase
  static async saveAttemptItem(attemptItem: AttemptItem): Promise<void> {
    try {
      const { error } = await supabase
        .from('attempt_items')
        .upsert({
          id: attemptItem.id,
          user_id: attemptItem.attemptId, // This will be updated to use proper user_id
          attempt_id: attemptItem.attemptId,
          question_id: attemptItem.questionId,
          answer: attemptItem.answer,
          kpis_detected: attemptItem.kpisDetected,
          kpis_missing: attemptItem.kpisMissing,
          score: attemptItem.score,
          max_score: attemptItem.maxScore,
          feedback: attemptItem.feedback,
          is_evaluated: attemptItem.isEvaluated,
          evaluation_json: attemptItem.evaluationJSON,
          duration_sec: attemptItem.durationSec,
          submitted_at: attemptItem.submittedAt,
          created_at: attemptItem.createdAt,
          updated_at: attemptItem.updatedAt
        })

      if (error) {
        console.error('Error saving attempt item:', error)
        throw error
      }

      console.log('✅ Attempt item saved to Supabase:', attemptItem.id)
    } catch (error) {
      console.error('Failed to save attempt item:', error)
      throw error
    }
  }

  // Save exam result to Supabase
  static async saveExamResult(examResult: ExamResult, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('exam_results')
        .insert({
          user_id: userId,
          attempt_id: examResult.attemptId,
          topic_id: examResult.questionResults[0]?.attemptId || '', // Get topic from first question
          total_questions: examResult.totalQuestions,
          total_kpis: examResult.totalKpis,
          kpis_detected: examResult.kpisDetected,
          kpis_missing: examResult.kpisMissing,
          total_score: examResult.totalScore,
          max_score: examResult.maxScore,
          kpi_percentage: examResult.kpiPercentage,
          score_percentage: examResult.scorePercentage,
          passed: examResult.passed,
          feedback: examResult.feedback,
          exam_duration_minutes: Math.round(examResult.questionResults.reduce((acc, q) => acc + q.durationSec, 0) / 60),
          submitted_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving exam result:', error)
        throw error
      }

      console.log('✅ Exam result saved to Supabase:', examResult.attemptId)
    } catch (error) {
      console.error('Failed to save exam result:', error)
      throw error
    }
  }

  // Get user's exam history
  static async getUserExamHistory(userId: string): Promise<ExamResult[]> {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('Error fetching exam history:', error)
        throw error
      }

      // Convert to ExamResult format
      const examResults: ExamResult[] = data.map(row => ({
        attemptId: row.attempt_id,
        totalQuestions: row.total_questions,
        totalKpis: row.total_kpis,
        kpisDetected: row.kpis_detected,
        kpisMissing: row.kpis_missing,
        totalScore: row.total_score,
        maxScore: row.max_score,
        kpiPercentage: row.kpi_percentage,
        scorePercentage: row.score_percentage,
        passed: row.passed,
        feedback: row.feedback,
        questionResults: [] // Will be loaded separately if needed
      }))

      console.log('✅ Exam history loaded:', examResults.length, 'results')
      return examResults
    } catch (error) {
      console.error('Failed to fetch exam history:', error)
      return []
    }
  }

  // Get user's detailed attempt items (answers)
  static async getUserAttemptItems(userId: string, attemptId?: string): Promise<AttemptItem[]> {
    try {
      let query = supabase
        .from('attempt_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (attemptId) {
        query = query.eq('attempt_id', attemptId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching attempt items:', error)
        throw error
      }

      // Convert to AttemptItem format
      const attemptItems: AttemptItem[] = data.map(row => ({
        id: row.id,
        attemptId: row.attempt_id,
        questionId: row.question_id,
        answer: row.answer,
        kpisDetected: row.kpis_detected || [],
        kpisMissing: row.kpis_missing || [],
        score: row.score,
        maxScore: row.max_score,
        feedback: row.feedback,
        isEvaluated: row.is_evaluated,
        evaluationJSON: row.evaluation_json,
        durationSec: row.duration_sec,
        submittedAt: row.submitted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))

      console.log('✅ Attempt items loaded:', attemptItems.length, 'items')
      return attemptItems
    } catch (error) {
      console.error('Failed to fetch attempt items:', error)
      return []
    }
  }

  // Get company exam statistics (for trainers)
  static async getCompanyExamStats(companyCode: string): Promise<{
    totalExams: number
    averageScore: number
    passRate: number
    recentExams: ExamResult[]
  }> {
    try {
      // Get all users in the company
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('company_code', companyCode)

      if (usersError) {
        console.error('Error fetching company users:', usersError)
        throw usersError
      }

      const userIds = users.map(user => user.id)

      if (userIds.length === 0) {
        return {
          totalExams: 0,
          averageScore: 0,
          passRate: 0,
          recentExams: []
        }
      }

      // Get exam results for all company users
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .in('user_id', userIds)
        .order('submitted_at', { ascending: false })
        .limit(50) // Recent 50 exams

      if (error) {
        console.error('Error fetching company exam stats:', error)
        throw error
      }

      const totalExams = data.length
      const averageScore = totalExams > 0 ? data.reduce((sum, exam) => sum + exam.score_percentage, 0) / totalExams : 0
      const passedExams = data.filter(exam => exam.passed).length
      const passRate = totalExams > 0 ? (passedExams / totalExams) * 100 : 0

      const recentExams: ExamResult[] = data.map(row => ({
        attemptId: row.attempt_id,
        totalQuestions: row.total_questions,
        totalKpis: row.total_kpis,
        kpisDetected: row.kpis_detected,
        kpisMissing: row.kpis_missing,
        totalScore: row.total_score,
        maxScore: row.max_score,
        kpiPercentage: row.kpi_percentage,
        scorePercentage: row.score_percentage,
        passed: row.passed,
        feedback: row.feedback,
        questionResults: []
      }))

      console.log('✅ Company exam stats loaded:', { totalExams, averageScore, passRate })
      return {
        totalExams,
        averageScore,
        passRate,
        recentExams
      }
    } catch (error) {
      console.error('Failed to fetch company exam stats:', error)
      return {
        totalExams: 0,
        averageScore: 0,
        passRate: 0,
        recentExams: []
      }
    }
  }
}
