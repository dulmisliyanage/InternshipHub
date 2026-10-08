import type { DiscoverySkill } from '../types/internshipDiscovery';
import type { StudentSkill } from '../types/student';

export interface ComparedSkill extends DiscoverySkill {
  isMatched: boolean;
}

export interface SkillComparisonResult {
  /** Total number of REQUIRED skills on the internship */
  totalRequired: number;
  /** Number of REQUIRED skills matched by the student */
  matchedRequiredCount: number;
  /** Number of REQUIRED skills missing from the student's profile */
  missingRequiredCount: number;
  /** Required skill coverage percentage (0 - 100), or null if totalRequired is 0 */
  coveragePercentage: number | null;
  /** Human-readable display string for coverage, e.g. "67%" or "Not available" */
  coverageDisplay: string;

  /** Total number of PREFERRED skills on the internship */
  totalPreferred: number;
  /** Number of PREFERRED skills matched by the student */
  matchedPreferredCount: number;
  /** Number of PREFERRED skills missing from the student's profile */
  missingPreferredCount: number;

  /** Matched required skills list */
  matchedRequiredSkills: ComparedSkill[];
  /** Missing required skills list */
  missingRequiredSkills: ComparedSkill[];
  /** Complete list of required skills with match status */
  allRequiredSkills: ComparedSkill[];

  /** Matched preferred skills list */
  matchedPreferredSkills: ComparedSkill[];
  /** Missing preferred skills list */
  missingPreferredSkills: ComparedSkill[];
  /** Complete list of preferred skills with match status */
  allPreferredSkills: ComparedSkill[];
}

/**
 * Compares an internship's required and preferred skills with a student's profile skills
 * based strictly on standardized skillId identifiers.
 *
 * @param internshipSkills - List of required & preferred skills from the internship
 * @param studentSkills - List of skills from the student's profile
 * @returns Structured comparison result with counts, percentages, and categorized skills
 */
export function compareSkills(
  internshipSkills: DiscoverySkill[] = [],
  studentSkills: (StudentSkill | { id?: string; skillId?: string })[] = []
): SkillComparisonResult {
  // Collect all standardized IDs from the student's skill profile
  const studentSkillIdSet = new Set<string>();

  for (const s of studentSkills) {
    const id = (s as any).skillId || (s as any).id;
    if (typeof id === 'string' && id.trim().length > 0) {
      studentSkillIdSet.add(id.trim());
    }
  }

  // Separate required and preferred internship skills
  const requiredSkills = internshipSkills.filter((s) => s.type === 'REQUIRED');
  const preferredSkills = internshipSkills.filter((s) => s.type === 'PREFERRED');

  const matchedRequiredSkills: ComparedSkill[] = [];
  const missingRequiredSkills: ComparedSkill[] = [];
  const allRequiredSkills: ComparedSkill[] = [];

  for (const skill of requiredSkills) {
    const id = skill.skillId || (skill as any).id;
    const isMatched = studentSkillIdSet.has(id);
    const compared: ComparedSkill = { ...skill, isMatched };

    allRequiredSkills.push(compared);
    if (isMatched) {
      matchedRequiredSkills.push(compared);
    } else {
      missingRequiredSkills.push(compared);
    }
  }

  const matchedPreferredSkills: ComparedSkill[] = [];
  const missingPreferredSkills: ComparedSkill[] = [];
  const allPreferredSkills: ComparedSkill[] = [];

  for (const skill of preferredSkills) {
    const id = skill.skillId || (skill as any).id;
    const isMatched = studentSkillIdSet.has(id);
    const compared: ComparedSkill = { ...skill, isMatched };

    allPreferredSkills.push(compared);
    if (isMatched) {
      matchedPreferredSkills.push(compared);
    } else {
      missingPreferredSkills.push(compared);
    }
  }

  const totalRequired = requiredSkills.length;
  const matchedRequiredCount = matchedRequiredSkills.length;
  const missingRequiredCount = missingRequiredSkills.length;

  let coveragePercentage: number | null = null;
  let coverageDisplay = 'Not available';

  // Coverage formula: (Matched Required Skills / Total Required Skills) * 100
  // Handled safely for zero-required-skills case
  if (totalRequired > 0) {
    coveragePercentage = Math.round((matchedRequiredCount / totalRequired) * 100);
    coverageDisplay = `${coveragePercentage}%`;
  }

  return {
    totalRequired,
    matchedRequiredCount,
    missingRequiredCount,
    coveragePercentage,
    coverageDisplay,
    totalPreferred: preferredSkills.length,
    matchedPreferredCount: matchedPreferredSkills.length,
    missingPreferredCount: missingPreferredSkills.length,
    matchedRequiredSkills,
    missingRequiredSkills,
    allRequiredSkills,
    matchedPreferredSkills,
    missingPreferredSkills,
    allPreferredSkills,
  };
}
