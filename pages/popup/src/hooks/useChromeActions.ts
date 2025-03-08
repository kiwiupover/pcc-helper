import { useCallback } from 'react';
import type { NotificationType, SearchResult, SearchTermConfig, PsychotropicResult } from '../types';
import { SEARCH_TERMS, SEARCH_TERMS_ONE_YEAR, SEARCH_TERMS_ONE_TIME } from '../constants/config';
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

  const isValidPage = useCallback(async () => {
    const tab = await getCurrentTab();
    if (!tab?.url) return false;

    const validPaths = ['client/cp_assessment.jsp', 'clinical/ordersChart.xhtml'];
    const isValid = validPaths.some(path => tab.url!.includes(path));
    console.log({ isValid, url: tab.url });
    return isValid;
  }, [getCurrentTab]);

  const injectContentScript = useCallback(async () => {
    const isValid = await isValidPage();
    try {
      const tab = await getCurrentTab();
      if (!tab?.url || !tab.id) return false;

      if (tab.url.startsWith('about:') || tab.url.startsWith('chrome:')) {
        showNotification(MESSAGES.INJECT_ERROR_TITLE, MESSAGES.INJECT_ERROR, 'error');
        return false;
      }

      if (!isValid) {
        showNotification(MESSAGES.INVALID_PAGE, MESSAGES.WRONG_PAGE_INSTRUCTION, 'error');
        return false;
      }

      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Content script already injected
          return true;
        },
      });

      return true;
    } catch (err) {
      if (err instanceof Error && err.message.includes('Cannot access a chrome:// URL')) {
        showNotification(MESSAGES.INJECT_ERROR_TITLE, MESSAGES.INJECT_ERROR, 'error');
      }
      console.error('Error injecting content script:', err);
      return false;
    }
  }, [getCurrentTab, showNotification, isValidPage]);

  const findText = useCallback(
    async (query: string): Promise<Array<{ text: string; startDate: string }>> => {
      console.log(`Starting text search for: ${query}`);
      try {
        const tab = await getCurrentTab();
        if (!tab?.id) {
          console.error('No active tab found');
          return [];
        }

        // Inject content script first
        console.log('Attempting to inject content script...');
        const injected = await injectContentScript();
        if (!injected) {
          console.error('Failed to inject content script');
          showNotification('Search Error', 'Failed to prepare the page for search. Please try again.', 'error');
          return [];
        }
        console.log('Content script injected successfully');

        // Search for text
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (searchQuery: string) => {
            // Normalize search query
            const normalizedQuery = searchQuery.toLowerCase();

            // First try to find orders in the table
            const orderRows = Array.from(document.querySelectorAll('table tr'));
            const matches = [];

            // Search in table rows
            for (const row of orderRows) {
              const cells = Array.from(row.querySelectorAll('td'));
              for (const cell of cells) {
                // Get the raw text content and normalize it
                const cellText = cell.innerHTML
                  .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
                  .replace(/<[^>]*>/g, '') // Remove other HTML tags
                  .replace(/[\t\f\r ]+/g, ' ') // Normalize horizontal whitespace
                  .replace(/\n[\t\f\r ]+/g, '\n') // Remove leading whitespace after newlines
                  .replace(/[\t\f\r ]+\n/g, '\n') // Remove trailing whitespace before newlines
                  .replace(/\n+/g, '\n') // Normalize multiple newlines to single
                  .replace(/^\s+/, '') // Remove leading whitespace
                  .replace(/\s+$/, ''); // Remove trailing whitespace

                if (cellText.toLowerCase().includes(normalizedQuery)) {
                  // Get the start date from the row
                  const startDateCell = row.querySelector('.atOStart');
                  const startDate = startDateCell?.textContent?.split(' ')[0] || '';
                  matches.push({ text: cellText, startDate });
                  break; // Found a match in this row, move to next row
                }
              }
            }

            // If no matches found in table, search all text nodes
            if (matches.length === 0) {
              // Try specific order elements first
              const orderElements = Array.from(document.querySelectorAll('.order-item, .order-name, .order-details'));
              for (const element of orderElements) {
                const text = element.textContent || '';
                if (text.toLowerCase().includes(normalizedQuery)) {
                  matches.push({ text: text.trim(), startDate: '' });
                }
              }

              // If still no matches, search all text nodes
              if (matches.length === 0) {
                const textNodes = document.evaluate(
                  '//text()',
                  document,
                  null,
                  XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                  null,
                );

                for (let i = 0; i < textNodes.snapshotLength; i++) {
                  const node = textNodes.snapshotItem(i);
                  if (node && node.textContent) {
                    const text = node.textContent.trim();
                    if (text && text.toLowerCase().includes(normalizedQuery)) {
                      matches.push({ text, startDate: '' });
                    }
                  }
                }
              }
            }

            return matches;
          },
          args: [query],
        });

        const matches = results[0]?.result || [];
        console.log(`Found ${matches.length} matches for: ${query}`);
        return matches;
      } catch (err) {
        console.error('Error finding text:', err);
        showNotification('Search Error', 'An error occurred while searching. Please try again.', 'error');
        return [];
      }
    },
    [getCurrentTab, injectContentScript, showNotification],
  );

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

      showNotification('Success', MESSAGES.CHECKBOX_CLICKED, 'info');
      return 'clicked';
    } catch (err) {
      console.error('Error clicking view all checkbox:', err);
      return 'error';
    }
  }, [getCurrentTab, isValidPage, showNotification]);

  return {
    injectContentScript,
    findText,
    findOccurrencesWithDates,
    clickViewAllCheckbox,
  };
};
