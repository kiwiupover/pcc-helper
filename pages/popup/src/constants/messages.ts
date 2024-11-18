import type { SearchResult } from '../types';

export const MESSAGES = {
  INJECT_ERROR: 'You cannot inject script here!',
  INJECT_ERROR_TITLE: 'Injecting content script error',
  CHECKBOX_CLICKED: 'View All checkbox clicked successfully',
  CHECKBOX_NOT_FOUND: 'View All checkbox not found on page',
  CHECKBOX_ALREADY_CHECKED: 'View All checkbox is already checked',
  INVALID_PAGE: 'This feature only works on the Client Evaluations page',
  WRONG_PAGE_INSTRUCTION: 'Please navigate to the Client Evaluations page and try again',
  SEARCH_RESULTS: (results: SearchResult[]) =>
    results.map(({ term, date }) => (date ? `${term} — Date: ${date}` : `${term} Not found`)).join('\n'),
} as const;
