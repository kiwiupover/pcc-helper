export const NOTIFICATION_CONFIG = {
  type: 'basic' as const,
  iconUrl: chrome.runtime.getURL('icon-32.png'),
} as const;

export const SEARCH_TERMS = ['Weekly', 'Nutrition Note', 'Sud', 'Progression Note'] as const;
