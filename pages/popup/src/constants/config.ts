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

export const isDateTooOld = (date: Date, timeRange: TimeRange, status: string | null): boolean => {
  console.log(`\nChecking if date is too old:
    Term Date: ${date.toLocaleDateString()}
    Time Range: ${timeRange}
    Status: ${status || 'None'}
  `);

  // Always check status first - if it's Errors or In Progress, it's overdue regardless of date
  if (status && (status.includes('Errors') || status === 'In Progress')) {
    console.log('Item is overdue due to status:', status);
    return true;
  }

  // Only check date expiration if status is not Errors or In Progress
  const now = new Date();
  const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
  console.log(`Months difference: ${monthsDiff}`);

  let result = false;
  switch (timeRange) {
    case 'ONE_TIME':
      result = false; // ONE_TIME items never expire based on date
      console.log('ONE_TIME item - never expires based on date');
      break;
    case 'THREE_MONTHS':
      result = monthsDiff > 3;
      console.log('THREE_MONTHS item - expires after 3 months');
      break;
    case 'ONE_YEAR':
      result = monthsDiff > 12;
      console.log('ONE_YEAR item - expires after 12 months');
      break;
    default:
      result = false;
      console.log('Unknown time range - defaulting to not expired');
  }

  console.log(`Final result: ${result ? 'EXPIRED' : 'VALID'}\n`);
  return result;
};

export const SEARCH_TERMS: SearchTermConfig[] = [
  { term: 'Care Conference', timeRange: 'THREE_MONTHS' },
  { term: 'Quarterly social service evaluation', timeRange: 'THREE_MONTHS' },
  { term: 'Psychotropic drug and behavior monthly', timeRange: 'THREE_MONTHS' },
  { term: 'Elopement/ Exit Seeking Evaluation', timeRange: 'THREE_MONTHS' },
  { term: 'Social Determinants of Health', timeRange: 'THREE_MONTHS' },
];

export const SEARCH_TERMS_ONE_YEAR: SearchTermConfig[] = [{ term: 'Trauma informed care', timeRange: 'ONE_YEAR' }];

export const SEARCH_TERMS_ONE_TIME: SearchTermConfig[] = [
  { term: 'Social Service Admission and History Evaluation', timeRange: 'ONE_TIME' },
  { term: 'PHQ-9', timeRange: 'ONE_TIME' },
  { term: 'SUD Risk-Based Evaluation', timeRange: 'ONE_TIME' },
];
