import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { useState, useCallback } from 'react';
import { ActionButton } from './components/ActionButton';
import { useChromeActions } from './hooks/useChromeActions';
import { MESSAGES } from './constants/messages';

const Popup = () => {
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { injectContentScript, findOccurrencesWithDates, clickViewAllCheckbox } = useChromeActions();

  const handleStart = useCallback(async () => {
    setIsProcessing(true);
    try {
      await injectContentScript();
      await clickViewAllCheckbox();
      const results = await findOccurrencesWithDates();
      if (results) {
        setSearchResults(MESSAGES.SEARCH_RESULTS(results).split('\n'));
      }
    } finally {
      setIsProcessing(false);
    }
  }, [injectContentScript, clickViewAllCheckbox, findOccurrencesWithDates]);

  const foundResults = searchResults.filter(result => !result.includes('Not found'));
  const notFoundResults = searchResults.filter(result => result.includes('Not found'));

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
                <div className="mb-2 font-semibold text-green-800 text-xl">Found Items:</div>
                {foundResults.map((result, index) => (
                  <div
                    key={index}
                    className={`${index > 0 ? 'mt-2 border-t border-green-100 pt-2' : ''} 
                      text-green-700`}>
                    {result}
                  </div>
                ))}
              </div>
            )}

            {notFoundResults.length > 0 && (
              <div className="rounded-md bg-red-50 p-3 text-sm">
                <div className="mb-2 font-semibold text-xl text-red-800">Not Found Items:</div>
                {notFoundResults.map((result, index) => (
                  <div
                    key={index}
                    className={`${index > 0 ? 'mt-2 border-t border-red-100 pt-2' : ''} 
                      text-red-600`}>
                    ⚠️ {result}
                  </div>
                ))}
              </div>
            )}
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
