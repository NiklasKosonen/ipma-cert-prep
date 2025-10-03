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
export const evaluateAnswer = async (answer: string, kpis: string[], language: string = 'fi'): Promise<EvaluationResult> => {
  console.log('🤖 OpenAI Evaluation - Answer:', answer.substring(0, 100))
  console.log('🤖 OpenAI Evaluation - KPIs to detect:', kpis)
  console.log('🤖 OpenAI Evaluation - Language:', language)
  
  try {
    // Use OpenAI API for evaluation
    const evaluation = await evaluateWithOpenAI(answer, kpis, language)
    console.log('✅ OpenAI Evaluation Result:', evaluation)
    return evaluation
  } catch (error) {
    console.error('❌ OpenAI Evaluation Error:', error)
    
    // Fallback to mock evaluation if OpenAI fails
    console.log('🔄 Falling back to mock evaluation')
    const detectedKPIs = detectKPIs(answer, kpis)
    const missingKPIs = kpis.filter(kpi => !detectedKPIs.includes(kpi))
    const score = calculateScore(detectedKPIs.length)
    const feedback = generateFeedback(detectedKPIs, missingKPIs, score, language)

    return {
      toteutuneet_kpi: detectedKPIs,
      puuttuvat_kpi: missingKPIs,
      pisteet: score,
      sanallinen_arvio: feedback
    }
  }
}

// OpenAI-based evaluation function
const evaluateWithOpenAI = async (answer: string, kpis: string[], language: string = 'fi'): Promise<EvaluationResult> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.')
  }

  // Check if KPIs are provided
  if (!kpis || kpis.length === 0) {
    console.warn('⚠️ No KPIs provided for evaluation, using fallback')
    throw new Error('No KPIs provided for evaluation')
  }

  const isFinnish = language === 'fi'
  const feedbackLanguage = isFinnish ? 'Finnish' : 'English'
  
  const prompt = `You are an expert evaluator for IPMA Level C certification exams. Your task is to evaluate a student's answer and detect which Key Performance Indicators (KPIs) are mentioned or demonstrated.

KPIs to detect: ${kpis.join(', ')}

Student's answer: "${answer}"

Please analyze the answer and:
1. Identify which KPIs are mentioned, demonstrated, or implied in the answer
2. Provide a score from 0-3 based on how well the student addressed the KPIs
3. Give constructive feedback

Return your response as a JSON object with this exact structure:
{
  "detected_kpis": ["list of KPI names that were found"],
  "missing_kpis": ["list of KPI names that were not found"],
  "score": number (0-3),
  "feedback": "constructive feedback in ${feedbackLanguage}"
}

Scoring criteria:
- 3 points: 3+ KPIs clearly addressed
- 2 points: 2 KPIs addressed
- 1 point: 1 KPI addressed
- 0 points: No KPIs addressed or answer is irrelevant

Be generous in detecting KPIs - look for synonyms, related concepts, and implied understanding.

IMPORTANT: The feedback must be written in ${feedbackLanguage}.`

  // Add retry logic for rate limiting
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 OpenAI API attempt ${attempt}/${maxRetries}`)
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert evaluator for IPMA Level C certification exams. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      })

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit - wait and retry
          const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff
          console.log(`⏳ Rate limit hit, waiting ${waitTime}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      // Success - break out of retry loop
      const data = await response.json()
      const content = data.choices[0].message.content
      
      try {
        const result = JSON.parse(content)
        
        return {
          toteutuneet_kpi: result.detected_kpis || [],
          puuttuvat_kpi: result.missing_kpis || [],
          pisteet: result.score || 0,
          sanallinen_arvio: result.feedback || 'No feedback provided'
        }
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content)
        throw new Error('Invalid response format from OpenAI')
      }
    } catch (error) {
      lastError = error as Error
      console.error(`❌ OpenAI API attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Wait before retry
      const waitTime = Math.pow(2, attempt) * 1000
      console.log(`⏳ Waiting ${waitTime}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError || new Error('All retry attempts failed')
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
  score: number,
  language: string = 'fi'
): string => {
  const detectedNames = detectedKPIs
  const isFinnish = language === 'fi'
  
  if (score === 3) {
    if (isFinnish) {
      return `Erinomaista työtä! Olet käsitellyt kaikki keskeiset alueet: ${detectedNames.join(', ')}. Vastauksesi osoittaa kattavaa ymmärrystä aiheesta. Tekoäly onnistui tunnistamaan nämä KPI:t vaikka sanamuodot vaihtelivat.`
    } else {
      return `Excellent work! You've covered all the key areas: ${detectedNames.join(', ')}. Your answer demonstrates comprehensive understanding of the topic. The AI has successfully detected these KPIs even with variations in wording.`
    }
  }
  
  if (score === 2) {
    if (isFinnish) {
      return `Hyvä yritys! Olet käsitellyt ${detectedNames.join(' ja ')}, mikä osoittaa vankkaa ymmärrystä. Tekoäly tunnisti nämä käsitteet vaikka ne eivät olleet kirjoitettu täsmälleen KPI-nimillä. Harkitse myös ${missingKPIs.slice(0, 2).join(' ja ')} käsittelemistä vahvistaaksesi vastaustasi.`
    } else {
      return `Good effort! You've addressed ${detectedNames.join(' and ')}, which shows solid understanding. The AI detected these concepts even though they weren't written exactly as the KPI names. Consider also discussing ${missingKPIs.slice(0, 2).join(' and ')} to strengthen your response.`
    }
  }
  
  if (score === 1) {
    if (isFinnish) {
      return `Olet aloittanut hyvin mainitsemalla ${detectedNames[0]}, mikä on hyvä. Tekoäly pystyi tunnistamaan tämän käsitteen sanamuodostasi. Parantaaksesi vastausta, yritä sisällyttää ${missingKPIs.slice(0, 2).join(' ja ')} vastaukseesi kattavamman vastauksen saamiseksi.`
    } else {
      return `You've made a start by mentioning ${detectedNames[0]}, which is good. The AI was able to detect this concept from your wording. To improve, try to incorporate ${missingKPIs.slice(0, 2).join(' and ')} in your answer for a more comprehensive response.`
    }
  }
  
  if (isFinnish) {
    return `Vastaustasi voisi vahvistaa käsittelemällä keskeisiä alueita kuten ${missingKPIs.slice(0, 3).join(', ')}. Harkitse tarkempien yksityiskohtien ja esimerkkien antamista ymmärryksesi osoittamiseksi. Tekoäly on koulutettu tunnistamaan nämä käsitteet vaikka sanamuodot vaihtelisivat.`
  } else {
    return `Your answer could be strengthened by addressing key areas such as ${missingKPIs.slice(0, 3).join(', ')}. Consider providing more specific details and examples to demonstrate your understanding. The AI is trained to detect these concepts even with different wording.`
  }
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
