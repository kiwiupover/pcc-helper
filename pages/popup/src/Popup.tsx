import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { useState, useCallback, useEffect } from 'react';
import { ActionButton } from './components/ActionButton';
import { ErrorMessage } from './components/ErrorMessage';
import { useChromeActions } from './hooks/useChromeActions';
import { useExtensionVersion } from './hooks/useExtensionVersion';
import { MESSAGES } from './constants/messages';
import type { SearchResult, PsychotropicResult } from './types';
import { isDateTooOld } from './constants/config';

const Popup = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [psychotropicResults, setPsychotropicResults] = useState<PsychotropicResult[]>([]);
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
  const version = useExtensionVersion();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsProcessing(true);
        await injectContentScript();
        await clickViewAllCheckbox();
        const results = await findOccurrencesWithDates();
        if (results) {
          setSearchResults(results.searchResults);
          setPsychotropicResults(results.psychotropicResults);
        } else {
          setSearchResults([]);
          setPsychotropicResults([]);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setSearchResults([]);
        setPsychotropicResults([]);
      } finally {
        setIsProcessing(false);
      }
    };

    fetchResults();
  }, [injectContentScript, clickViewAllCheckbox, findOccurrencesWithDates]);

  const isDateOld = (dateStr: string, timeRange: TimeRange, status: string | null) => {
    const [month, day, year] = dateStr.split('/').map(Number);
    return isDateTooOld(new Date(year, month - 1, day), timeRange, status);
  };

  const foundResults = searchResults.filter(result => result.date !== null);
  const validResults = foundResults.filter(result => !isDateOld(result.date!, result.timeRange, result.status));
  const expiredResults = foundResults.filter(result => isDateOld(result.date!, result.timeRange, result.status));
  const notFoundResults = searchResults.filter(result => result.date === null);

  return (
    <div className="min-w-[450px] bg-white p-4">
      <header className="mb-4 text-2xl font-semibold text-gray-900">
        PCC Helper <span className="text-xs text-gray-500">v{version}</span>
      </header>

      <main className="space-y-4">
        <ActionButton
          onClick={() => {}}
          disabled={isProcessing}
          className="w-full bg-blue-500 py-3 text-lg font-semibold text-white hover:bg-blue-600">
          {isProcessing ? 'Processing...' : 'Start PCC Helper'}
        </ActionButton>

        {errorMessage && <ErrorMessage title={errorMessage.title} message={errorMessage.message} />}

        {/* Valid Items */}
        {validResults.length > 0 && (
          <div className="mt-3">
            <h2 className="text-sm font-medium text-[#34C759] mb-1">Valid Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-gray-100">
                <thead className="bg-white">
                  <tr>
                    <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Item</th>
                    <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Status</th>
                    <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {validResults.map((result, index) => (
                    <tr key={index}>
                      <td className="border border-gray-100 px-2 py-1 text-gray-600">{result.term}</td>
                      <td className="border border-gray-100 px-2 py-1 text-gray-600">{result.status || '-'}</td>
                      <td className="border border-gray-100 px-2 py-1 text-gray-600">{result.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expired Items */}
        {expiredResults.length > 0 && (
          <div className="mt-3">
            <h2 className="text-sm font-medium text-[#FF3B30] mb-1">Over Due</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-gray-100">
                <thead className="bg-white">
                  <tr>
                    <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Item</th>
                    <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Status</th>
                    <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredResults.map((result, index) => (
                    <tr key={index}>
                      <td className="border border-gray-100 px-2 py-1 text-gray-600">{result.term}</td>
                      <td className="border border-gray-100 px-2 py-1 text-gray-600">{result.status || '-'}</td>
                      <td className="border border-gray-100 px-2 py-1 text-gray-600">{result.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Not Found Items */}
        {notFoundResults.length > 0 && (
          <div className="mt-3">
            <h2 className="text-sm font-medium text-[#FF9500] mb-1">Not Found</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-gray-100">
                <thead className="bg-white">
                  <tr>
                    <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Item</th>
                    <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Status</th>
                    <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {notFoundResults.map((result, index) => (
                    <tr key={index}>
                      <td className="border border-gray-100 px-2 py-1 text-gray-600">{result.term}</td>
                      <td className="border border-gray-100 px-2 py-1 text-gray-600">{result.status || '-'}</td>
                      <td className="border border-gray-100 px-2 py-1 text-gray-600">{result.date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Psychotropic Drug and Behavior */}
        {psychotropicResults.length > 0 && (
          <div className="mt-3">
            <h2 className="text-sm font-medium text-blue-500 mb-1">Psychotropic Drug and Behavior</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-gray-100">
                <thead className="bg-white">
                  <tr>
                    <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Date</th>
                    <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {psychotropicResults.map((result, index) => (
                    <tr key={index}>
                      <td className="border border-gray-100 px-2 py-1 text-gray-600">{result.date}</td>
                      <td className="border border-gray-100 px-2 py-1 text-gray-600">{result.status}</td>
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
