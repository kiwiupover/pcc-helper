import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { useState, useCallback, useEffect } from 'react';
import { ActionButton } from './components/ActionButton';
import { ErrorMessage } from './components/ErrorMessage';
import { useChromeActions } from './hooks/useChromeActions';

const Popup = () => {
  const [searchResults, setSearchResults] = useState<(string | { term: string; date: string; isOld: boolean })[]>([]);
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
        const formattedResults = results.map(result => {
          if (!result.date) return `${result.term}: Not found`;
          return {
            term: result.term,
            date: result.date,
            isOld: result.isOld,
          };
        });
        setSearchResults(formattedResults);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [injectContentScript, clickViewAllCheckbox, findOccurrencesWithDates]);

  const foundResults = searchResults.filter(result => typeof result === 'object' && 'term' in result);
  const notFoundResults = searchResults.filter(result => typeof result === 'string');

  return (
    <div className="min-w-[450px] bg-slate-50 p-4">
      <header className="mb-4 text-xl font-semibold text-gray-900">PCC Helper</header>

      <main className="space-y-4">
        <ActionButton
          onClick={handleStart}
          disabled={isProcessing}
          className="w-full bg-green-500 py-3 text-lg font-semibold text-white hover:bg-green-600">
          {isProcessing ? 'Processing...' : 'Start PCC Helper'}
        </ActionButton>

        {searchResults.length > 0 && (
          <div className="space-y-4">
            {foundResults.length > 0 && (
              <div className="rounded-md bg-green-50 p-3 text-sm">
                <div className="mb-2 text-xl font-semibold text-green-800">Found Items:</div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-green-100">
                      <th className="pb-2 text-left font-semibold text-green-800">Item</th>
                      <th className="pb-2 text-left font-semibold text-green-800">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foundResults.map((result, index) => {
                      const { term, date, isOld } = result as { term: string; date: string; isOld: boolean };
                      return (
                        <tr key={index} className={`${index > 0 ? 'border-t border-green-100' : ''}`}>
                          <td className="py-2 text-green-700">{term}</td>
                          <td className="py-2">
                            <span className={isOld ? 'text-red-600' : 'text-green-700'}>{date}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {notFoundResults.length > 0 && (
              <div className="rounded-md bg-red-50 p-3 text-sm">
                <div className="mb-2 text-xl font-semibold text-red-800">Not Found Items:</div>
                <table className="w-full">
                  <tbody>
                    {notFoundResults.map((result, index) => (
                      <tr key={index} className={`${index > 0 ? 'border-t border-red-100' : ''}`}>
                        <td className="py-2 text-red-600">{result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {errorMessage && <ErrorMessage title={errorMessage.title} message={errorMessage.message} />}
      </main>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div className="p-4">Loading...</div>),
  <div className="p-4 text-red-500">Error Occurred</div>,
);
