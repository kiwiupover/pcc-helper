import { SearchTermConfig, TimeRange } from '../types';

export const NOTIFICATION_CONFIG = {
  type: 'basic' as const,
  iconUrl: chrome.runtime.getURL('icon-32.png'),
} as const;

export const isOlderThanThreeMonths = (date: Date): boolean => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return date < threeMonthsAgo;
};

export const isOlderThanOneYear = (date: Date): boolean => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return date < oneYearAgo;
};

export const isDateTooOld = (date: Date, timeRange: TimeRange): boolean => {
  switch (timeRange) {
    case 'THREE_MONTHS':
      return isOlderThanThreeMonths(date);
    case 'ONE_YEAR':
      return isOlderThanOneYear(date);
    default:
      return false;
  }
};

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
