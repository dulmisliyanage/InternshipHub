export type WorkType = 'REMOTE' | 'HYBRID' | 'ONSITE';

export type ProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Skill {
  id: string;
  name: string;
  categoryId?: string;
  category?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description?: string | null;
  skills: Skill[];
}

export interface StudentSkill {
  id: string;
  name: string;
  category?: string;
  proficiency: ProficiencyLevel;
}

export interface SelectedSkill {
  skillId: string;
  name: string;
  category: string;
  proficiency: ProficiencyLevel;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  profileImage?: string | null;
  university?: string | null;
  degree?: string | null;
  fieldOfStudy?: string | null;
  currentYear?: number | null;
  expectedGraduation?: string | null;
  location?: string | null;
  preferredRole?: string | null;
  preferredWorkType?: WorkType | null;
  bio?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  cvUrl?: string | null;
  skills: StudentSkill[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateStudentProfilePayload {
  university?: string | null;
  degree?: string | null;
  fieldOfStudy?: string | null;
  currentYear?: number | null;
  expectedGraduation?: string | null;
  location?: string | null;
  preferredRole?: string | null;
  preferredWorkType?: WorkType | null;
  bio?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  cvUrl?: string | null;
  skills?: {
    skillId: string;
    proficiency: ProficiencyLevel;
  }[];
}

export type StudentProfilePayload = UpdateStudentProfilePayload;

export interface StudentProfileResponse {
  status: 'success' | 'error';
  profile: StudentProfile | null;
  message?: string;
}

export interface SkillsCatalogResponse {
  status: 'success' | 'error';
  categories: SkillCategory[];
  message?: string;
}
