export interface ProfileCompletionItem {
  key: string;
  label: string;
  completed: boolean;
  weight: number;
}

export interface ProfileCompletion {
  percentage: number;
  completedWeight: number;
  totalWeight: number;
  completedItems: number;
  totalItems: number;
  missing: ProfileCompletionItem[];
}
