// Content script to interact with the page
export {};

// Function to click the checkbox
function clickViewAllCheckbox() {
  const viewAllCheckbox = document.querySelector(
    'input[type="checkbox"][name="ESOLviewall"][value="Y"]',
  ) as HTMLInputElement | null;

  if (viewAllCheckbox && !viewAllCheckbox.checked) {
    viewAllCheckbox.click();
    return true;
  }
  return false;
}

// Function to find occurrences with dates
function findOccurrencesWithDates() {
  const tableRows = document.querySelectorAll('table tr');
  const results = [];

  for (const row of tableRows) {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 2) {
      const dateText = cells[1]?.textContent?.trim();
      if (dateText) {
        const date = new Date(dateText);
        if (!isNaN(date.getTime())) {
          results.push({
            term: cells[0]?.textContent?.trim() || '',
            date: dateText,
            isOld: date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Older than 30 days
          });
        }
      }
    }
  }

  return results;
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'clickViewAllCheckbox') {
    const result = clickViewAllCheckbox();
    sendResponse({ success: result });
  } else if (request.action === 'findOccurrences') {
    const results = findOccurrencesWithDates();
    sendResponse({ results });
  }
  return true; // Required for async response
});
