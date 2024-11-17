import { useCallback } from 'react';
import type { NotificationType, SearchResult } from '../types';
import { NOTIFICATION_CONFIG, SEARCH_TERMS } from '../constants/config';
import { MESSAGES } from '../constants/messages';

export const useChromeActions = () => {
  const getCurrentTab = useCallback(async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    if (!tab?.id || !tab.url) return null;
    return tab;
  }, []);

  const showNotification = useCallback((title: string, message: string, type: NotificationType = 'info') => {
    chrome.notifications.create(type, {
      ...NOTIFICATION_CONFIG,
      title,
      message,
    });
  }, []);

  const injectContentScript = useCallback(async () => {
    try {
      const tab = await getCurrentTab();
      if (!tab?.url) return;

      if (tab.url.startsWith('about:') || tab.url.startsWith('chrome:')) {
        showNotification(MESSAGES.INJECT_ERROR_TITLE, MESSAGES.INJECT_ERROR, 'error');
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/content-runtime/index.iife.js'],
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes('Cannot access a chrome:// URL')) {
        showNotification(MESSAGES.INJECT_ERROR_TITLE, MESSAGES.INJECT_ERROR, 'error');
      }
      console.error('Error injecting content script:', err);
    }
  }, [getCurrentTab, showNotification]);

  const findOccurrencesWithDates = useCallback(async (): Promise<SearchResult[] | null> => {
    try {
      const tab = await getCurrentTab();
      if (!tab?.id) return null;

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (searchTerms: string[]) => {
          const rows = Array.from(document.querySelectorAll('#msg table tr'));
          return searchTerms.map(term => {
            for (const row of rows) {
              const cells = Array.from(row.querySelectorAll('td'));
              const dateCell = cells.find(cell => /\d{1,2}\/\d{1,2}\/\d{4}/.test(cell.innerText));
              const matchingCell = cells.find(cell => cell.innerText.toLowerCase().includes(term.toLowerCase()));
              if (dateCell && matchingCell) {
                return { term, date: dateCell.innerText };
              }
            }
            return { term, date: null };
          });
        },
        args: [SEARCH_TERMS],
      });

      return results[0]?.result || null;
    } catch (err) {
      console.error('Error finding occurrences with dates:', err);
      return null;
    }
  }, [getCurrentTab]);

  const clickViewAllCheckbox = useCallback(async () => {
    try {
      const tab = await getCurrentTab();
      if (!tab?.id) return;

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const viewAllCheckbox = document.querySelector(
            'input[type="checkbox"][name="ESOLviewall"][value="Y"]',
          ) as HTMLInputElement | null;

          if (viewAllCheckbox) {
            if (!viewAllCheckbox.checked) {
              viewAllCheckbox.click();
              return 'clicked';
            }
            return 'already_checked';
          }
          return 'not_found';
        },
      });

      const status = results[0]?.result;

      switch (status) {
        case 'clicked':
          showNotification('Success', MESSAGES.CHECKBOX_CLICKED, 'success');
          break;
        case 'not_found':
          showNotification('Not Found', MESSAGES.CHECKBOX_NOT_FOUND, 'error');
          break;
        case 'already_checked':
          showNotification('Already Checked', MESSAGES.CHECKBOX_ALREADY_CHECKED, 'info');
          break;
      }

      return status;
    } catch (err) {
      console.error('Error clicking view all checkbox:', err);
      return 'error';
    }
  }, [getCurrentTab, showNotification]);

  return {
    injectContentScript,
    findOccurrencesWithDates,
    clickViewAllCheckbox,
  };
};
