# Step-by-Step Guide: Creating English Database for Bilingual Platform

## Overview
This guide will help you create a complete English version of your IPMA certification platform database. We'll use the **separate language tables** approach (recommended) to maintain clean separation between Finnish and English content.

## Prerequisites
- Access to Supabase SQL Editor
- Current Finnish database with topics, subtopics, questions, and KPIs
- Professional translation services (recommended)

---

## Step 1: Create English Database Tables

### 1.1 Create English Topics Table
```sql
-- Create English topics table
CREATE TABLE public.topics_en (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policy for topics_en
ALTER TABLE public.topics_en ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to read topics_en" ON public.topics_en
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage topics_en" ON public.topics_en
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'trainer')
    )
  );
```

### 1.2 Create English Subtopics Table
```sql
-- Create English subtopics table
CREATE TABLE public.subtopics_en (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  topic_id TEXT NOT NULL REFERENCES public.topics_en(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policy for subtopics_en
ALTER TABLE public.subtopics_en ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to read subtopics_en" ON public.subtopics_en
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage subtopics_en" ON public.subtopics_en
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'trainer')
    )
  );
```

### 1.3 Create English KPIs Table
```sql
-- Create English KPIs table
CREATE TABLE public.kpis_en (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_essential BOOLEAN DEFAULT true,
  topic_id TEXT NOT NULL REFERENCES public.topics_en(id) ON DELETE CASCADE,
  subtopic_id TEXT NOT NULL REFERENCES public.subtopics_en(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policy for kpis_en
ALTER TABLE public.kpis_en ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to read kpis_en" ON public.kpis_en
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage kpis_en" ON public.kpis_en
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'trainer')
    )
  );
```

### 1.4 Create English Questions Table
```sql
-- Create English questions table
CREATE TABLE public.questions_en (
  id TEXT PRIMARY KEY,
  prompt TEXT NOT NULL,
  topic_id TEXT NOT NULL REFERENCES public.topics_en(id) ON DELETE CASCADE,
  subtopic_id TEXT NOT NULL REFERENCES public.subtopics_en(id) ON DELETE CASCADE,
  connectedkpis JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policy for questions_en
ALTER TABLE public.questions_en ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to read questions_en" ON public.questions_en
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage questions_en" ON public.questions_en
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'trainer')
    )
  );
```

---

## Step 2: Copy Structure from Finnish Tables

### 2.1 Copy Topics Structure
```sql
-- Copy topics structure (without data)
INSERT INTO public.topics_en (id, title, description, is_active, created_at, updated_at)
SELECT 
  id,
  '[EN] ' || title as title,  -- Temporary prefix for identification
  description,
  is_active,
  created_at,
  updated_at
FROM public.topics
WHERE is_active = true;
```

### 2.2 Copy Subtopics Structure
```sql
-- Copy subtopics structure
INSERT INTO public.subtopics_en (id, title, description, topic_id, is_active, created_at, updated_at)
SELECT 
  s.id,
  '[EN] ' || s.title as title,  -- Temporary prefix
  s.description,
  s.topic_id,
  s.is_active,
  s.created_at,
  s.updated_at
FROM public.subtopics s
JOIN public.topics t ON s.topic_id = t.id
WHERE s.is_active = true AND t.is_active = true;
```

### 2.3 Copy KPIs Structure
```sql
-- Copy KPIs structure
INSERT INTO public.kpis_en (id, name, description, is_essential, topic_id, subtopic_id, created_at, updated_at)
SELECT 
  k.id,
  '[EN] ' || k.name as name,  -- Temporary prefix
  k.description,
  k.is_essential,
  k.topic_id,
  k.subtopic_id,
  k.created_at,
  k.updated_at
FROM public.kpis k
JOIN public.subtopics s ON k.subtopic_id = s.id
JOIN public.topics t ON s.topic_id = t.id
WHERE s.is_active = true AND t.is_active = true;
```

### 2.4 Copy Questions Structure
```sql
-- Copy questions structure
INSERT INTO public.questions_en (id, prompt, topic_id, subtopic_id, connectedkpis, is_active, created_at, updated_at)
SELECT 
  q.id,
  '[EN] ' || q.prompt as prompt,  -- Temporary prefix
  q.topic_id,
  q.subtopic_id,
  q.connectedkpis,
  q.is_active,
  q.created_at,
  q.updated_at
FROM public.questions q
JOIN public.subtopics s ON q.subtopic_id = s.id
JOIN public.topics t ON s.topic_id = t.id
WHERE q.is_active = true AND s.is_active = true AND t.is_active = true;
```

---

## Step 3: Professional Translation

### 3.1 Export Data for Translation
```sql
-- Export topics for translation
SELECT id, title, description FROM public.topics_en ORDER BY id;

-- Export subtopics for translation
SELECT id, title, description, topic_id FROM public.subtopics_en ORDER BY topic_id, id;

-- Export KPIs for translation
SELECT id, name, description, topic_id, subtopic_id FROM public.kpis_en ORDER BY topic_id, subtopic_id, id;

-- Export questions for translation
SELECT id, prompt, topic_id, subtopic_id FROM public.questions_en ORDER BY topic_id, subtopic_id, id;
```

### 3.2 Translation Guidelines
- **Topics**: Translate titles and descriptions maintaining professional terminology
- **Subtopics**: Ensure consistency with parent topic terminology
- **KPIs**: Use standard project management terminology (PMBOK, IPMA standards)
- **Questions**: Maintain question structure while translating naturally

### 3.3 Update Translated Content
```sql
-- Update topics with translations
UPDATE public.topics_en 
SET title = 'Strategic Management', 
    description = 'Understanding strategic planning and organizational alignment'
WHERE id = 'topic_1759433245656';

-- Update subtopics with translations
UPDATE public.subtopics_en 
SET title = 'Strategy'
WHERE id = 'subtopic_1759433672159';

-- Update KPIs with translations
UPDATE public.kpis_en 
SET name = 'Strategic Alignment'
WHERE id = 'kpi_1759433672159_1';

-- Update questions with translations
UPDATE public.questions_en 
SET prompt = 'How do you ensure project objectives align with organizational strategy?'
WHERE id = 'question_1759439510243';
```

---

## Step 4: Link Questions to KPIs

### 4.1 Link Questions to English KPIs
```sql
-- Link questions to KPIs from their subtopics
UPDATE public.questions_en 
SET connectedkpis = (
  SELECT jsonb_agg(k.id)
  FROM public.kpis_en k
  WHERE k.subtopic_id = questions_en.subtopic_id
)
WHERE connectedkpis = '[]'::jsonb OR connectedkpis IS NULL;
```

---

## Step 5: Update Application Code

### 5.1 Update DataContext.tsx
```typescript
// Add English data arrays
const [topicsEn, setTopicsEn] = useState<Topic[]>([])
const [subtopicsEn, setSubtopicsEn] = useState<Subtopic[]>([])
const [kpisEn, setKpisEn] = useState<KPI[]>([])
const [questionsEn, setQuestionsEn] = useState<Question[]>([])

// Add language-aware getters
const getTopics = (language: 'fi' | 'en') => {
  return language === 'fi' ? topics : topicsEn
}

const getQuestions = (language: 'fi' | 'en') => {
  return language === 'fi' ? questions : questionsEn
}

const selectRandomQuestions = (topicId: string, language: 'fi' | 'en'): string[] => {
  const topics = language === 'fi' ? topicsFi : topicsEn
  const questions = language === 'fi' ? questionsFi : questionsEn
  const subtopics = language === 'fi' ? subtopicsFi : subtopicsEn
  
  // Rest of logic remains the same
}
```

### 5.2 Update Components
```typescript
// In exam components, use language-aware data
const { language } = useLanguage()
const topics = getTopics(language)
const questions = getQuestions(language)
```

---

## Step 6: Testing and Validation

### 6.1 Test English Content
```sql
-- Verify English content structure
SELECT 
  t.title as topic_title,
  s.title as subtopic_title,
  COUNT(q.id) as question_count,
  COUNT(k.id) as kpi_count
FROM public.topics_en t
LEFT JOIN public.subtopics_en s ON t.id = s.topic_id
LEFT JOIN public.questions_en q ON s.id = q.subtopic_id
LEFT JOIN public.kpis_en k ON s.id = k.subtopic_id
GROUP BY t.id, t.title, s.id, s.title
ORDER BY t.title, s.title;
```

### 6.2 Test Question Selection
```sql
-- Test question selection for English
WITH topic_subtopics AS (
  SELECT s.id, s.title, s.topic_id
  FROM public.subtopics_en s
  WHERE s.topic_id = (SELECT id FROM public.topics_en LIMIT 1)
    AND s.is_active = true
),
selected_questions AS (
  SELECT 
    ts.title as subtopic_title,
    q.id as question_id,
    LEFT(q.prompt, 30) as question_preview,
    jsonb_array_length(q.connectedkpis) as kpi_count
  FROM topic_subtopics ts
  LEFT JOIN public.questions_en q ON ts.id = q.subtopic_id AND q.is_active = true
  WHERE q.id IS NOT NULL
)
SELECT * FROM selected_questions ORDER BY subtopic_title;
```

---

## Step 7: Deployment Checklist

### 7.1 Pre-deployment
- [ ] All English tables created
- [ ] RLS policies applied
- [ ] Content translated and updated
- [ ] Questions linked to KPIs
- [ ] Application code updated
- [ ] Tests passing

### 7.2 Post-deployment
- [ ] Test English exam flow
- [ ] Verify KPI detection works
- [ ] Check exam history shows both languages
- [ ] Test language switching
- [ ] Verify admin panel works with both languages

---

## Estimated Timeline

- **Database Setup**: 2-3 hours
- **Content Translation**: 1-2 weeks (professional translation)
- **Code Updates**: 1-2 days
- **Testing**: 2-3 days
- **Total**: 2-3 weeks

## Cost Estimate

- **Professional Translation**: $500-1000
- **Development Time**: 1-2 weeks
- **Testing**: 2-3 days

---

## Next Steps After Implementation

1. **Add Language Toggle**: Update UI to switch between languages
2. **Admin Panel Updates**: Add language selection in admin interface
3. **Analytics**: Track usage by language
4. **Content Management**: Tools for managing both language versions
5. **Additional Languages**: Framework for adding more languages later

This approach provides a clean, maintainable solution that scales well for future language additions.
