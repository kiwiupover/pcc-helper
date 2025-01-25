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

  const isValidPage = useCallback(async () => {
    const tab = await getCurrentTab();
    if (!tab?.url) return false;
    const isValid = tab.url.includes('client/cp_assessment.jsp');
    console.log({ isValid });
    return isValid;
  }, [getCurrentTab]);

  const injectContentScript = useCallback(async () => {
    try {
      const tab = await getCurrentTab();
      if (!tab?.id) {
        showNotification('Error', 'No active tab found', 'error');
        return false;
      }

      if (!(await isValidPage())) {
        showNotification(ERROR_MESSAGES.INVALID_PAGE, ERROR_MESSAGES.WRONG_PAGE_INSTRUCTION, 'error');
        return false;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['contentScript.js'], // Updated path
      });
      return true;
    } catch (err) {
      console.error('Error injecting content script:', err);
      showNotification(
        'Error',
        `Failed to inject content script: ${err instanceof Error ? err.message : 'Unknown error'}`,
        'error',
      );
      return false;
    }
  }, [getCurrentTab, showNotification, isValidPage]);

  const clickViewAllCheckbox = useCallback(async () => {
    try {
      const tab = await getCurrentTab();
      if (!tab?.id) {
        showNotification('Error', 'No active tab found', 'error');
        return 'error';
      }

      // Send message to content script to click checkbox
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'clickViewAllCheckbox' });

      if (!response) {
        showNotification('Error', 'No response from content script', 'error');
        return 'error';
      }

      if (response.success) {
        return 'clicked';
      } else {
        showNotification('Already Checked', ERROR_MESSAGES.CHECKBOX_ALREADY_CHECKED, 'info');
        return 'already_checked';
      }
    } catch (err) {
      console.error('Error clicking checkbox:', err);
      showNotification('Error', 'Failed to click checkbox. Please try again.', 'error');
      return 'error';
    }
  }, [getCurrentTab, showNotification]);

  const findOccurrencesWithDates = useCallback(async () => {
    try {
      const tab = await getCurrentTab();
      if (!tab?.id) {
        showNotification('Error', 'No active tab found', 'error');
        return null;
      }

      // Send message to content script to find occurrences
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'findOccurrences' });

      if (!response || !response.results) {
        showNotification('Error', 'No response from content script', 'error');
        return null;
      }

      return response.results;
    } catch (err) {
      console.error('Error finding occurrences:', err);
      showNotification('Error', 'Failed to find occurrences. Please try again.', 'error');
      return null;
    }
  }, [getCurrentTab, showNotification]);

  return {
    injectContentScript,
    findOccurrencesWithDates,
    clickViewAllCheckbox,
  };
};
