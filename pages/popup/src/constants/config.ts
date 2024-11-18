export const NOTIFICATION_CONFIG = {
  type: 'basic' as const,
  iconUrl: chrome.runtime.getURL('icon-32.png'),
} as const;

export const SEARCH_TERMS = [
  'Care Conference',
  'Quarterly social service evaluation',
  'PHQ-9',
  'SUD evaluation',
  'Trauma informed care',
] as const;
