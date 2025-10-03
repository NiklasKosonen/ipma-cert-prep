import { EvaluationResult, TrainingExample, SampleAnswer } from '../types'

/**
 * Evaluation Engine for IPMA Level C Certification Prep
 * 
 * This is a mock implementation that provides deterministic scoring based on KPI detection.
 * In production, this would be replaced with OpenAI API integration.
 */

// In-memory AI model (in production, this would be a real ML model)
let aiModel = {
  patterns: new Map<string, number>(),
  feedbackTemplates: new Map<string, string[]>(),
  isTrained: false,
  learnedPatterns: new Map<string, string[]>(), // KPI name -> learned variations
  contextPatterns: new Map<string, string[]>(), // Context -> related KPIs
}
export const evaluateAnswer = async (answer: string, kpis: string[]): Promise<EvaluationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock KPI detection based on keyword matching
  const detectedKPIs = detectKPIs(answer, kpis)
  const missingKPIs = kpis.filter(kpi => !detectedKPIs.includes(kpi))

  // Calculate score based on KPI count rubric
  const score = calculateScore(detectedKPIs.length)
  
  // Generate coaching feedback
  const feedback = generateFeedback(detectedKPIs, missingKPIs, score)

  return {
    toteutuneet_kpi: detectedKPIs,
    puuttuvat_kpi: missingKPIs,
    pisteet: score,
    sanallinen_arvio: feedback
  }
}

/**
 * Detect KPIs in the answer text using keyword matching and learned patterns
 */
const detectKPIs = (answer: string, kpis: string[]): string[] => {
  const answerLower = answer.toLowerCase()
  const detectedKPIs: string[] = []
  
  console.log('🔍 KPI Detection - Answer:', answer.substring(0, 100))
  console.log('🔍 KPI Detection - KPIs to check:', kpis)
  
  for (const kpi of kpis) {
    const kpiLower = kpi.toLowerCase()
    let detected = false
    
    // 1. Check exact name match
    if (answerLower.includes(kpiLower)) {
      detected = true
      console.log(`✅ Exact match found for: ${kpi}`)
    }
    
    // 2. Check individual words from KPI name
    if (!detected) {
      const kpiWords = kpiLower.split(/\s+/).filter(word => word.length > 2)
      const wordMatches = kpiWords.filter(word => answerLower.includes(word))
      if (wordMatches.length >= Math.ceil(kpiWords.length * 0.6)) { // 60% of words must match
        detected = true
        console.log(`✅ Word match found for: ${kpi} (matched: ${wordMatches.join(', ')})`)
      }
    }
    
    // 3. Check synonyms and related terms
    if (!detected) {
      const synonyms = getKPISynonyms(kpi)
      for (const synonym of synonyms) {
        if (answerLower.includes(synonym.toLowerCase())) {
          detected = true
          console.log(`✅ Synonym match found for: ${kpi} (synonym: ${synonym})`)
          break
        }
      }
    }
    
    // 4. Check learned patterns
    if (!detected) {
      const learnedPatterns = aiModel.learnedPatterns.get(kpi) || []
      if (learnedPatterns.some(pattern => 
        answerLower.includes(pattern.toLowerCase())
      )) {
        detected = true
        console.log(`✅ Learned pattern match found for: ${kpi}`)
      }
    }
    
    if (detected) {
      detectedKPIs.push(kpi)
    } else {
      console.log(`❌ No match found for: ${kpi}`)
    }
  }
  
  console.log('🔍 Final detected KPIs:', detectedKPIs)
  return detectedKPIs
}

// Helper function to get synonyms for common KPI terms
const getKPISynonyms = (kpi: string): string[] => {
  const synonymMap: Record<string, string[]> = {
    'leadership': ['lead', 'manage', 'guide', 'direct', 'supervise', 'oversee'],
    'communication': ['communicate', 'discuss', 'talk', 'speak', 'convey', 'express'],
    'teamwork': ['collaborate', 'cooperate', 'work together', 'team work', 'joint effort'],
    'planning': ['plan', 'organize', 'schedule', 'prepare', 'arrange', 'coordinate'],
    'problem solving': ['solve', 'resolve', 'address', 'tackle', 'fix', 'handle'],
    'decision making': ['decide', 'choose', 'select', 'determine', 'conclude'],
    'stakeholder management': ['stakeholder', 'client', 'customer', 'partner', 'relationship'],
    'risk management': ['risk', 'threat', 'danger', 'uncertainty', 'mitigate'],
    'quality management': ['quality', 'standard', 'excellence', 'improvement', 'control'],
    'change management': ['change', 'transformation', 'transition', 'adaptation', 'evolution'],
    'project management': ['project', 'initiative', 'deliverable', 'milestone', 'timeline'],
    'resource management': ['resource', 'budget', 'cost', 'allocation', 'utilization'],
    'performance management': ['performance', 'evaluation', 'assessment', 'review', 'feedback'],
    'strategic thinking': ['strategy', 'strategic', 'vision', 'direction', 'long-term'],
    'innovation': ['innovate', 'creative', 'new', 'novel', 'improvement', 'enhancement']
  }
  
  const kpiLower = kpi.toLowerCase()
  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if (kpiLower.includes(key)) {
      return synonyms
    }
  }
  
  return []
}

/**
 * Calculate score based on KPI count rubric:
 * 3 pts = ≥3 KPIs, 2 pts = 2 KPIs, 1 pt = 1 KPI, 0 pts = 0 KPIs
 */
const calculateScore = (detectedCount: number): 0 | 1 | 2 | 3 => {
  if (detectedCount >= 3) return 3
  if (detectedCount === 2) return 2
  if (detectedCount === 1) return 1
  return 0
}

/**
 * Train the AI model with sample answers and training examples
 */
export const trainAIModel = async (sampleAnswers: SampleAnswer[], trainingExamples: TrainingExample[]): Promise<void> => {
  // Simulate training delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Learn patterns from sample answers
  sampleAnswers.forEach(sample => {
    if (sample.answerText && sample.questionId) {
      // Extract potential KPI patterns from the sample answer
      const words = sample.answerText.toLowerCase().split(/\s+/)
      const phrases = extractPhrases(sample.answerText.toLowerCase())
      
      // Store patterns for future detection
      words.forEach((word: string) => {
        if (word.length > 3) { // Only meaningful words
          aiModel.patterns.set(word, (aiModel.patterns.get(word) || 0) + 1)
        }
      })
      
      phrases.forEach(phrase => {
        if (phrase.length > 5) { // Only meaningful phrases
          aiModel.patterns.set(phrase, (aiModel.patterns.get(phrase) || 0) + 1)
        }
      })
    }
  })
  
  // Learn from training examples
  trainingExamples.forEach(example => {
    if (example.answerText && example.detectedKPIs) {
      // Learn which patterns correspond to which KPIs
      const answerWords = example.answerText.toLowerCase().split(/\s+/)
      const answerPhrases = extractPhrases(example.answerText.toLowerCase())
      
      example.detectedKPIs.forEach(kpiName => {
        // Store learned patterns for this KPI
        if (!aiModel.learnedPatterns.has(kpiName)) {
          aiModel.learnedPatterns.set(kpiName, [])
        }
        
        // Add significant words and phrases as patterns
        answerWords.forEach((word: string) => {
          if (word.length > 3 && !aiModel.learnedPatterns.get(kpiName)!.includes(word)) {
            aiModel.learnedPatterns.get(kpiName)!.push(word)
          }
        })
        
        answerPhrases.forEach(phrase => {
          if (phrase.length > 5 && !aiModel.learnedPatterns.get(kpiName)!.includes(phrase)) {
            aiModel.learnedPatterns.get(kpiName)!.push(phrase)
          }
        })
      })
    }
  })
  
  aiModel.isTrained = true
  console.log('AI Model trained successfully with', sampleAnswers.length, 'sample answers and', trainingExamples.length, 'training examples')
}

/**
 * Extract meaningful phrases from text
 */
const extractPhrases = (text: string): string[] => {
  const phrases: string[] = []
  
  // Extract 2-4 word phrases
  const words = text.split(/\s+/)
  for (let i = 0; i < words.length - 1; i++) {
    for (let j = 2; j <= 4 && i + j <= words.length; j++) {
      const phrase = words.slice(i, i + j).join(' ')
      if (phrase.length > 5) {
        phrases.push(phrase)
      }
    }
  }
  
  return phrases
}

/**
 * Generate coaching feedback based on detected and missing KPIs
 */
const generateFeedback = (
  detectedKPIs: string[], 
  missingKPIs: string[], 
  score: number
): string => {
  const detectedNames = detectedKPIs
  
  if (score === 3) {
    return `Excellent work! You've covered all the key areas: ${detectedNames.join(', ')}. Your answer demonstrates comprehensive understanding of the topic. The AI has successfully detected these KPIs even with variations in wording.`
  }
  
  if (score === 2) {
    return `Good effort! You've addressed ${detectedNames.join(' and ')}, which shows solid understanding. The AI detected these concepts even though they weren't written exactly as the KPI names. Consider also discussing ${missingKPIs.slice(0, 2).join(' and ')} to strengthen your response.`
  }
  
  if (score === 1) {
    return `You've made a start by mentioning ${detectedNames[0]}, which is good. The AI was able to detect this concept from your wording. To improve, try to incorporate ${missingKPIs.slice(0, 2).join(' and ')} in your answer for a more comprehensive response.`
  }
  
  return `Your answer could be strengthened by addressing key areas such as ${missingKPIs.slice(0, 3).join(', ')}. Consider providing more specific details and examples to demonstrate your understanding. The AI is trained to detect these concepts even with different wording.`
}


/**
 * Get the current status of the AI model
 */
export const getAIModelStatus = () => {
  return {
    isTrained: aiModel.isTrained,
    patternsCount: aiModel.patterns.size,
    feedbackTemplatesCount: aiModel.feedbackTemplates.size
  }
}
