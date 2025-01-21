import { useCallback } from 'react';
import type { NotificationType, SearchResult } from '../types';
import { ALL_SEARCH_TERMS, TIME_RANGES } from '../constants/config';

const ERROR_MESSAGES = {
  INJECT_ERROR: 'You cannot inject script here!',
  INJECT_ERROR_TITLE: 'Injecting content script error',
  CHECKBOX_CLICKED: 'View All checkbox clicked successfully',
  CHECKBOX_NOT_FOUND: 'View All checkbox not found on page',
  CHECKBOX_ALREADY_CHECKED: 'View All checkbox is already checked',
  INVALID_PAGE: 'This feature only works on the Client Evaluations page',
  WRONG_PAGE_INSTRUCTION: 'Please navigate to the Client Evaluations page and try again',
} as const;

export const useChromeActions = (onShowMessage?: (title: string, message: string, type: NotificationType) => void) => {
  const getCurrentTab = useCallback(async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    if (!tab?.id || !tab.url) return null;
    return tab;
  }, []);

  const showNotification = useCallback(
    (title: string, message: string, type: NotificationType = 'info') => {
      if (onShowMessage) {
        onShowMessage(title, message, type);
      }
    },
    [onShowMessage],
  );

  const injectContentScript = useCallback(async () => {
    try {
      const tab = await getCurrentTab();
      if (!tab?.url) return;

      if (tab.url.startsWith('about:') || tab.url.startsWith('chrome:')) {
        showNotification(ERROR_MESSAGES.INJECT_ERROR_TITLE, ERROR_MESSAGES.INJECT_ERROR, 'error');
        return;
      }

      const isValid = await isValidPage();
      if (!isValid) {
        showNotification(ERROR_MESSAGES.INVALID_PAGE, ERROR_MESSAGES.WRONG_PAGE_INSTRUCTION, 'error');
        return;
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('Cannot access a chrome:// URL')) {
        showNotification(ERROR_MESSAGES.INJECT_ERROR_TITLE, ERROR_MESSAGES.INJECT_ERROR, 'error');
      }
      console.error('Error injecting content script:', err);
    }
  }, [getCurrentTab, showNotification]);

  const isValidPage = useCallback(async () => {
    const tab = await getCurrentTab();
    if (!tab?.url) return false;

    const isValid = tab.url.includes('client/cp_assessment.jsp');
    console.log({ isValid });
    return isValid;
  }, [getCurrentTab]);

  const findOccurrencesWithDates = useCallback(async (): Promise<SearchResult[] | null> => {
    try {
      if (!(await isValidPage())) {
        showNotification(ERROR_MESSAGES.INVALID_PAGE, ERROR_MESSAGES.WRONG_PAGE_INSTRUCTION, 'error');
        return null;
      }

      const tab = await getCurrentTab();
      if (!tab?.id) return null;

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: searchTermsConfig => {
          const rows = Array.from(document.querySelectorAll('#msg table tr'));
          const currentDate = new Date();

          return searchTermsConfig.map(config => {
            for (const row of rows) {
              const cells = Array.from(row.querySelectorAll('td'));
              const dateCell = cells.find(cell => /\d{1,2}\/\d{1,2}\/\d{4}/.test(cell.innerText));
              const matchingCell = cells.find(cell => cell.innerText.toLowerCase().includes(config.term.toLowerCase()));

              if (dateCell && matchingCell) {
                const dateText = dateCell.innerText;
                const [month, day, year] = dateText.split('/').map(Number);
                const date = new Date(year, month - 1, day);

                // Set both dates to start of day for accurate comparison
                date.setHours(0, 0, 0, 0);
                const compareDate = new Date(currentDate);
                compareDate.setHours(0, 0, 0, 0);

                let isOld = false;
                if (config.timeRange === 'THREE_MONTHS') {
                  const threeMonthsAgo = new Date(compareDate.getTime() - TIME_RANGES.THREE_MONTHS);
                  isOld = date.getTime() < threeMonthsAgo.getTime();
                } else if (config.timeRange === 'ONE_YEAR') {
                  const oneYearAgo = new Date(compareDate.getTime() - TIME_RANGES.ONE_YEAR);
                  isOld = date.getTime() < oneYearAgo.getTime();
                }

                return { term: config.term, date: dateText, isOld };
              }
            }
            return { term: config.term, date: null, isOld: false };
          });
        },
        args: [ALL_SEARCH_TERMS],
      });

      return results[0]?.result || null;
    } catch (err) {
      console.error('Error finding occurrences with dates:', err);
      return null;
    }
  }, [getCurrentTab, isValidPage, showNotification]);

  const clickViewAllCheckbox = useCallback(async () => {
    try {
      if (!(await isValidPage())) {
        showNotification(ERROR_MESSAGES.INVALID_PAGE, ERROR_MESSAGES.WRONG_PAGE_INSTRUCTION, 'error');
        return 'invalid_page';
      }

      const tab = await getCurrentTab();
      if (!tab?.id) return;

      // First check if checkbox exists and needs to be clicked
      const checkResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const viewAllCheckbox = document.querySelector(
            'input[type="checkbox"][name="ESOLviewall"][value="Y"]',
          ) as HTMLInputElement | null;

          if (viewAllCheckbox) {
            if (!viewAllCheckbox.checked) {
              return 'needs_click';
            }
            return 'already_checked';
          }
          return 'not_found';
        },
      });

      const initialStatus = checkResults[0]?.result;

      if (initialStatus === 'already_checked') {
        showNotification('Already Checked', ERROR_MESSAGES.CHECKBOX_ALREADY_CHECKED, 'info');
        return 'already_checked';
      }

      if (initialStatus === 'not_found') {
        showNotification('Not Found', ERROR_MESSAGES.CHECKBOX_NOT_FOUND, 'error');
        return 'not_found';
      }

      // If we need to click, set up a listener for the page load
      const pageLoadPromise = new Promise<void>(resolve => {
        const onUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(onUpdated);
            resolve();
          }
        };
        chrome.tabs.onUpdated.addListener(onUpdated);
      });

      // Click the checkbox
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const viewAllCheckbox = document.querySelector(
            'input[type="checkbox"][name="ESOLviewall"][value="Y"]',
          ) as HTMLInputElement;
          viewAllCheckbox.click();
        },
      });

      // Wait for the page to finish loading
      await pageLoadPromise;

      showNotification('Success', ERROR_MESSAGES.CHECKBOX_CLICKED, 'success');
      return 'clicked';
    } catch (err) {
      console.error('Error clicking view all checkbox:', err);
      return 'error';
    }
  }, [getCurrentTab, isValidPage, showNotification]);

  return {
    injectContentScript,
    findOccurrencesWithDates,
    clickViewAllCheckbox,
  };
};
