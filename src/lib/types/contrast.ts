export type WcagLevel = 'AA' | 'AAA';

export type WcagCriterionId =
  | 'normal-aa'
  | 'large-aa'
  | 'normal-aaa'
  | 'large-aaa'
  | 'ui-aa';

export type WcagTargetType = 'normal-text' | 'large-text' | 'ui-component';

export interface WcagCriterion {
  id: WcagCriterionId;
  name: string;
  level: WcagLevel;
  minRatio: number;
  description: string;
  targetType: WcagTargetType;
  largeTextNote?: string;
  passed: boolean;
}

export interface ContrastPreset {
  id: string;
  name: string;
  foreground: string;
  background: string;
  description: string;
}

export interface ContrastSuggestion {
  id: string;
  targetRequirement: WcagLevel;
  targetRatio: number;
  type: 'foreground' | 'background';
  suggestedHex: string;
  currentHex: string;
  fixedHex: string;
  resultingRatio: number;
  formattedRatio: string;
  label: string;
  explanation: string;
}

export type OverallContrastStatus =
  | 'pass-aaa'
  | 'pass-aa'
  | 'partial'
  | 'fail';

export interface ContrastEvaluation {
  foreground: string;
  background: string;
  ratio: number;
  formattedRatio: string;
  fgLuminance: number;
  bgLuminance: number;
  criteria: WcagCriterion[];
  passedCount: number;
  totalCount: number;
  overallStatus: OverallContrastStatus;
  statusLabel: string;
  summary: string;
}
