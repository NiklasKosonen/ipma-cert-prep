// Language configuration for IPMA Certification Prep Platform
export type Language = 'fi' | 'en';

export interface LanguageConfig {
  current: Language;
  fallback: Language;
}

export const DEFAULT_LANGUAGE: Language = 'fi';

// Finnish translations
export const FINNISH_TRANSLATIONS = {
  // App
  appTitle: 'AI PRO',
  appSubtitle: 'IPMA Certification Prep Platform',
  
  // Navigation
  adminConsole: 'Hallintapaneeli',
  userDashboard: 'Käyttäjäpaneeli',
  traineeDashboard: 'Kouluttajapaneeli',
  logout: 'Kirjaudu ulos',
  login: 'Kirjaudu sisään',
  
  // Admin Console Tabs
  topics: 'Aiheet',
  subtopics: 'Aliaiheet', 
  kpis: 'KPI:t',
  questions: 'Kysymykset',
  sampleAnswers: 'Mallivastaukset',
  trainingExamples: 'Harjoitusesimerkit',
  companyCodes: 'Yrityskoodit',
  emailConfig: 'Sähköpostiasetukset',
  aiEvaluation: 'AI Arviointisäännöt',
  
  // Training Examples
  addTrainingExample: 'Lisää harjoitusesimerkki',
  question: 'Kysymys',
  exampleAnswer: 'Mallivastaus',
  selectKPIs: 'Valitse KPI:t',
  grade: 'Arvosana',
  grade0: '0 pistettä = 0 KPI',
  grade1: '1 piste = 1 KPI', 
  grade2: '2 pistettä = 2 KPI',
  grade3: '3 pistettä = ≥3 KPI',
  submitForEvaluation: 'Lähetä arvioitavaksi',
  evaluationRules: 'Arviointisäännöt',
  
  // AI Evaluation Rules
  scoringRubric: 'Pistemääräsysteemi',
  ruleDescription: 'Arviointisäännöt määrittelevät, miten vastauksia arvioidaan KPI:iden perusteella:',
  rule3Points: '3 pistettä = ≥3 KPI havaittu',
  rule2Points: '2 pistettä = 2 KPI havaittu',
  rule1Point: '1 piste = 1 KPI havaittu',
  rule0Points: '0 pistettä = 0 KPI havaittu',
  additionalRules: 'Lisäsäännöt',
  addRule: 'Lisää sääntö',
  saveRules: 'Tallenna säännöt',
  
  // Common actions
  save: 'Tallenna',
  cancel: 'Peruuta',
  delete: 'Poista',
  edit: 'Muokkaa',
  add: 'Lisää',
  submit: 'Lähetä',
  back: 'Takaisin',
  next: 'Seuraava',
  
  // Status messages
  success: 'Onnistui',
  error: 'Virhe',
  warning: 'Varoitus',
  info: 'Tiedote',
  
  // Email system
  emailSystemActive: 'Sähköpostijärjestelmä aktiivinen',
  emailSystemConfigured: 'Sähköpostijärjestelmä konfiguroitu',
  testEmailSending: 'Testaa sähköpostin lähettämistä',
  
  // Role Picker
  rolePickerTitle: 'Valitse roolisi',
  roleUser: 'Käyttäjä',
  roleUserDesc: 'Opiskelija - suorita tenttejä ja seuraa omaa edistymistäsi',
  roleTrainee: 'Kouluttaja',
  roleTraineeDesc: 'Kouluttaja - seuraa opiskelijoiden edistymistä ja vastauksia',
  roleAdmin: 'Ylläpitäjä',
  roleAdminDesc: 'Ylläpitäjä - hallinnoi järjestelmää ja sisältöä',
  
  // Forms
  required: 'Pakollinen',
  optional: 'Valinnainen',
  name: 'Nimi',
  email: 'Sähköposti',
  company: 'Yritys',
  description: 'Kuvaus',
  title: 'Otsikko',
  
  // Exam system
  selectTopic: 'Valitse aihe',
  startExam: 'Aloita tentti',
  submitExam: 'Lähetä tentti',
  timeRemaining: 'Aikaa jäljellä',
  examCompleted: 'Tentti suoritettu',
  score: 'Pisteet',
  feedback: 'Palaute'
};

// English translations (fallback)
export const ENGLISH_TRANSLATIONS = {
  // App
  appTitle: 'AI PRO',
  appSubtitle: 'IPMA Certification Prep Platform',
  
  // Navigation
  adminConsole: 'Admin Console',
  userDashboard: 'User Dashboard',
  traineeDashboard: 'Trainee Dashboard',
  logout: 'Logout',
  login: 'Login',
  
  // Admin Console Tabs
  topics: 'Topics',
  subtopics: 'Subtopics',
  kpis: 'KPIs',
  questions: 'Questions',
  sampleAnswers: 'Sample Answers',
  trainingExamples: 'Training Examples',
  companyCodes: 'Company Codes',
  emailConfig: 'Email Configuration',
  aiEvaluation: 'AI Evaluation Rules',
  
  // Training Examples
  addTrainingExample: 'Add Training Example',
  question: 'Question',
  exampleAnswer: 'Example Answer',
  selectKPIs: 'Select KPIs',
  grade: 'Grade',
  grade0: '0 points = 0 KPIs',
  grade1: '1 point = 1 KPI',
  grade2: '2 points = 2 KPIs',
  grade3: '3 points = ≥3 KPIs',
  submitForEvaluation: 'Submit for Evaluation',
  evaluationRules: 'Evaluation Rules',
  
  // AI Evaluation Rules
  scoringRubric: 'Scoring Rubric',
  ruleDescription: 'Evaluation rules define how answers are scored based on KPIs:',
  rule3Points: '3 points = ≥3 KPIs detected',
  rule2Points: '2 points = 2 KPIs detected',
  rule1Point: '1 point = 1 KPI detected',
  rule0Points: '0 points = 0 KPIs detected',
  additionalRules: 'Additional Rules',
  addRule: 'Add Rule',
  saveRules: 'Save Rules',
  
  // Common actions
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  submit: 'Submit',
  back: 'Back',
  next: 'Next',
  
  // Status messages
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  
  // Email system
  emailSystemActive: 'Email system active',
  emailSystemConfigured: 'Email system configured',
  testEmailSending: 'Test email sending',
  
  // Role Picker
  rolePickerTitle: 'Select Your Role',
  roleUser: 'User',
  roleUserDesc: 'Student - take exams and track your progress',
  roleTrainee: 'Trainee',
  roleTraineeDesc: 'Trainee - monitor student progress and answers',
  roleAdmin: 'Admin',
  roleAdminDesc: 'Admin - manage system and content',
  
  // Forms
  required: 'Required',
  optional: 'Optional',
  name: 'Name',
  email: 'Email',
  company: 'Company',
  description: 'Description',
  title: 'Title',
  
  // Exam system
  selectTopic: 'Select Topic',
  startExam: 'Start Exam',
  submitExam: 'Submit Exam',
  timeRemaining: 'Time Remaining',
  examCompleted: 'Exam Completed',
  score: 'Score',
  feedback: 'Feedback'
};

export const TRANSLATIONS = {
  fi: FINNISH_TRANSLATIONS,
  en: ENGLISH_TRANSLATIONS
};

// Language context type
export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof FINNISH_TRANSLATIONS) => string;
}
