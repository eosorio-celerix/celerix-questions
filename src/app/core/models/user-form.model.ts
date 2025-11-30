export interface UserFormData {
  // Personal Information
  fullName: string;
  identityDocument: string;
  birthDate: string;
  birthPlace: string;
  email: string;
  city: string;
  country: string;
  phoneNumber: string;
  phoneCountryCode?: string;

  // Professional History
  school?: string;
  degree?: string;

  // Work Experience
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  immediateLeader?: string;
  mainResponsibilities?: string;
  achievements?: string;
  whyCloseCycle?: string;

  // Languages
  englishLevel?: 'Básico' | 'Intermedio' | 'Avanzado';
  englishLearningPlace?: string;
  otherLanguage?: string;
  otherLanguageLevel?: 'Básico' | 'Intermedio' | 'Avanzado';

  // Additional Personal Information
  preferredName?: string;
  superpowerAndKryptonite?: string;
  whatCaughtAttention?: string;
  uniqueWorkStyle?: string;
  questionForCandidates?: string;

  // Energy Distribution and Scenario
  energyAspect1?: number;
  energyAspect2?: number;
  energyAspect3?: number;
  energyAspect4?: number;
  scenarioAction?: 'public' | 'private' | 'other';
  scenarioExplanation?: string;

  // Answer to Own Question
  answerToOwnQuestion?: string;
}

export interface FormStep {
  stepNumber: number;
  title: string;
  isCompleted: boolean;
  isActive: boolean;
}
