import { useCallback } from 'react';
import type { NotificationType, SearchResult, SearchTermConfig } from '../types';
import { NOTIFICATION_CONFIG, SEARCH_TERMS, SEARCH_TERMS_ONE_YEAR, SEARCH_TERMS_ONE_TIME } from '../constants/config';
import { MESSAGES } from '../constants/messages';

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
        showNotification(MESSAGES.INJECT_ERROR_TITLE, MESSAGES.INJECT_ERROR, 'error');
        return;
      }

      const isValid = await isValidPage();
      if (!isValid) {
        showNotification(MESSAGES.INVALID_PAGE, MESSAGES.WRONG_PAGE_INSTRUCTION, 'error');
        return;
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('Cannot access a chrome:// URL')) {
        showNotification(MESSAGES.INJECT_ERROR_TITLE, MESSAGES.INJECT_ERROR, 'error');
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

  const findOccurrencesWithDates = useCallback(async (): Promise<{
    searchResults: SearchResult[];
    psychotropicResults: PsychotropicResult[];
  } | null> => {
    try {
      if (!(await isValidPage())) {
        showNotification('Invalid Page', MESSAGES.INVALID_PAGE, 'error');
        return null;
      }

      const tab = await getCurrentTab();
      if (!tab?.id) {
        console.error('No active tab found');
        return null;
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (
          searchTerms: SearchTermConfig[],
          searchTermsOneYear: SearchTermConfig[],
          searchTermsOneTime: SearchTermConfig[],
        ) => {
          const rows = Array.from(document.querySelectorAll('#msg table tr'));
          const allTerms = [...searchTerms, ...searchTermsOneYear, ...searchTermsOneTime];

          console.log('Starting search with terms:', allTerms);
          console.log('Found rows:', rows.length);

          // Find the header row to locate the Status column index
          const headerRow = rows[0];
          if (!headerRow) return { searchResults: [], psychotropicResults: [] };

          const headers = Array.from(headerRow.querySelectorAll('th')).map(th => th.innerText.trim());
          const statusColumnIndex = headers.findIndex(header => header === 'Status');

          console.log('Table headers:', headers);
          console.log('Status column index:', statusColumnIndex);

          // Find all psychotropic references
          const psychotropicResults = [];
          for (const row of rows.slice(1)) {
            const cells = Array.from(row.querySelectorAll('td'));
            const dateCell = cells.find(cell => /\d{1,2}\/\d{1,2}\/\d{4}/.test(cell.innerText));
            const matchingCell = cells.find(cell =>
              cell.innerText.toLowerCase().includes('psychotropic drug and behavior'),
            );

            if (dateCell && matchingCell) {
              const status =
                statusColumnIndex >= 0 && cells[statusColumnIndex]
                  ? cells[statusColumnIndex].innerText.trim()
                  : 'Unknown';

              psychotropicResults.push({
                date: dateCell.innerText,
                status,
              });
            }
          }

          // Regular search results
          const searchResults = allTerms.map(({ term, timeRange }) => {
            console.log(`\nSearching for term: "${term}" (${timeRange})`);

            // Skip header row in search
            for (const row of rows.slice(1)) {
              const cells = Array.from(row.querySelectorAll('td'));
              const dateCell = cells.find(cell => /\d{1,2}\/\d{1,2}\/\d{4}/.test(cell.innerText));
              const matchingCell = cells.find(cell => cell.innerText.toLowerCase().includes(term.toLowerCase()));

              if (dateCell && matchingCell) {
                const status =
                  statusColumnIndex >= 0 && cells[statusColumnIndex] ? cells[statusColumnIndex].innerText.trim() : null;

                console.log(`Found item:
                  Term: ${term}
                  Date: ${dateCell.innerText}
                  Status: ${status || 'None'}
                  Row contents: ${cells.map(c => c.innerText).join(' | ')}
                `);

                return { term, date: dateCell.innerText, timeRange, status };
              }
            }

            console.log(`Item not found: ${term}`);
            return { term, date: null, timeRange, status: null };
          });

          return { searchResults, psychotropicResults };
        },
        args: [SEARCH_TERMS, SEARCH_TERMS_ONE_YEAR, SEARCH_TERMS_ONE_TIME],
      });

      console.log('Search results:', results[0]?.result);
      return results[0]?.result || { searchResults: [], psychotropicResults: [] };
    } catch (err) {
      console.error('Error finding occurrences with dates:', err);
      return null;
    }
  }, [getCurrentTab, isValidPage, showNotification]);

  const clickViewAllCheckbox = useCallback(async () => {
    try {
      if (!(await isValidPage())) {
        showNotification('Invalid Page', MESSAGES.INVALID_PAGE, 'error');
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
        showNotification('Already Checked', MESSAGES.CHECKBOX_ALREADY_CHECKED, 'info');
        return 'already_checked';
      }

      if (initialStatus === 'not_found') {
        showNotification('Not Found', MESSAGES.CHECKBOX_NOT_FOUND, 'error');
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

      showNotification('Success', MESSAGES.CHECKBOX_CLICKED, 'success');
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
