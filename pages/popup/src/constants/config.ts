export const NOTIFICATION_CONFIG = {
  type: 'basic' as const,
  iconUrl: chrome.runtime.getURL('icon-32.png'),
} as const;

interface SearchTermConfig {
  term: string;
  timeRange: 'THREE_MONTHS' | 'ONE_YEAR' | 'PRN';
}

export const TIME_RANGES = {
  THREE_MONTHS: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
  ONE_YEAR: 365 * 24 * 60 * 60 * 1000, // 365 days in milliseconds
} as const;

export const SEARCH_TERMS: SearchTermConfig[] = [
  { term: 'Care Conference', timeRange: 'THREE_MONTHS' },
  { term: 'Quarterly social service evaluation', timeRange: 'THREE_MONTHS' },
  { term: 'Psychotropic drug and behavior monthly', timeRange: 'THREE_MONTHS' },
  { term: 'Elopement/ Exit Seeking Evaluation', timeRange: 'THREE_MONTHS' },
];

export const SEARCH_TERMS_ONE_YEAR: SearchTermConfig[] = [
  { term: 'Social Service Admission and History Evaluation', timeRange: 'ONE_YEAR' },
  { term: 'Social Determinants of Health', timeRange: 'ONE_YEAR' },
  { term: 'PHQ-9', timeRange: 'ONE_YEAR' },
  { term: 'Trauma informed care', timeRange: 'ONE_YEAR' },
  { term: 'SUD Risk-Based Evaluation', timeRange: 'ONE_YEAR' },
];

export const SEARCH_TERMS_PRN: SearchTermConfig[] = [{ term: 'Psychotropic drug and behavior prn', timeRange: 'PRN' }];

export const ALL_SEARCH_TERMS = [...SEARCH_TERMS, ...SEARCH_TERMS_ONE_YEAR, ...SEARCH_TERMS_PRN];

/*
Care Conference needs to have been done in the last three months
Social Determinants of Health needs to have been done in the last three months 
Elopement/ Exit Seeking Evaluation needs to have been done in the last three months 
Quarterly Social Service Evaluation needs to have been done in the last three months

Social Service Admission And History Evaluation needs to be found 1 time  
PHQ-9 needs to be found 1 time 
SUD Eval needs to be found 1 time 
Trauma Informed Care needs to be completed in the last year

Psychotropic Drug and Behavior Monthly & PRN can you have it tell me all the dates it has been completed in a list? 
*/
