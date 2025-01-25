import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { useState, useCallback, useEffect } from 'react';
import { ActionButton } from './components/ActionButton';
import { ErrorMessage } from './components/ErrorMessage';
import { useChromeActions } from './hooks/useChromeActions';
import { MESSAGES } from './constants/messages';
import type { SearchResult } from './types';
import { isDateTooOld } from './constants/config';

const Popup = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ title: string; message: string } | null>(null);

  // Clear error message on popup reload
  useEffect(() => {
    setErrorMessage(null);
  }, []);

  const handleShowMessage = useCallback((title: string, message: string, type: NotificationType) => {
    if (type === 'error') {
      setErrorMessage({ title, message });
    }
  }, []);

  const { injectContentScript, findOccurrencesWithDates, clickViewAllCheckbox } = useChromeActions(handleShowMessage);

  const handleStart = useCallback(async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await injectContentScript();
      await clickViewAllCheckbox();
      const results = await findOccurrencesWithDates();
      if (results) {
        setSearchResults(results);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [injectContentScript, clickViewAllCheckbox, findOccurrencesWithDates]);

  const foundResults = searchResults.filter(result => result.date !== null);
  const notFoundResults = searchResults.filter(result => result.date === null);

  const isDateOld = (dateStr: string, timeRange: TimeRange) => {
    const [month, day, year] = dateStr.split('/').map(Number);
    return isDateTooOld(new Date(year, month - 1, day), timeRange);
  };

  return (
    <div className="min-w-[450px] bg-white p-4">
      <header className="mb-4 text-2xl font-semibold text-gray-900">PCC Helper</header>

      <main className="space-y-4">
        <ActionButton
          onClick={handleStart}
          disabled={isProcessing}
          className="w-full bg-blue-500 py-3 text-lg font-semibold text-white hover:bg-blue-600">
          {isProcessing ? 'Processing...' : 'Start PCC Helper'}
        </ActionButton>

        {errorMessage && <ErrorMessage title={errorMessage.title} message={errorMessage.message} />}

        {/* Valid Items */}
        {foundResults.filter(result => result.date && !isDateOld(result.date, result.timeRange)).length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg text-[#34C759] mb-2">Valid Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left text-gray-400">Term</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {foundResults
                    .filter(result => result.date && !isDateOld(result.date, result.timeRange))
                    .map((result, index) => (
                      <tr key={index}>
                        <td className="border border-gray-200 px-4 py-2 text-gray-900">{result.term}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-900">{result.date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expired Items */}
        {foundResults.filter(result => result.date && isDateOld(result.date, result.timeRange)).length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg text-[#FF3B30] mb-2">Over Due</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left text-gray-400">Term</th>
                    <th className="border border-gray-200 px-4 py-2 text-left text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {foundResults
                    .filter(result => result.date && isDateOld(result.date, result.timeRange))
                    .map((result, index) => (
                      <tr key={index}>
                        <td className="border border-gray-200 px-4 py-2 text-gray-900">{result.term}</td>
                        <td className="border border-gray-200 px-4 py-2 text-gray-900">{result.date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Not Found Items */}
        {notFoundResults.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg text-[#FF9500] mb-2">Not Found</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left text-gray-400">Term</th>
                  </tr>
                </thead>
                <tbody>
                  {notFoundResults.map((result, index) => (
                    <tr key={index}>
                      <td className="border border-gray-200 px-4 py-2 text-gray-900">{result.term}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div className="p-4">Loading...</div>),
  <div className="p-4 text-red-500">Error Occurred</div>,
);
