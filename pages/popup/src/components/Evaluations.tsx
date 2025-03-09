import { useState, useEffect } from 'react';
import { ActionButton } from './ActionButton';
import { Alert } from './Alert';
import type { SearchResult, PsychotropicResult, NotificationType, TimeRange } from '../types';
import { useChromeActions } from '../hooks/useChromeActions';

interface EvaluationsProps {
  isDateOld: (dateStr: string, timeRange: TimeRange, status: string | null) => boolean;
}

export const Evaluations = ({ isDateOld }: EvaluationsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ title: string; message: string } | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [psychotropicResults, setPsychotropicResults] = useState<PsychotropicResult[]>([]);
  const [isValidUrl, setIsValidUrl] = useState(false);

  const handleShowMessage = (title: string, message: string, type: NotificationType) => {
    if (type === 'error') {
      setErrorMessage({ title, message });
    }
  };

  const { injectContentScript, findOccurrencesWithDates, clickViewAllCheckbox, isEvaluationsPage } =
    useChromeActions(handleShowMessage);

  // Check URL when component mounts
  useEffect(() => {
    const checkUrl = async () => {
      const isValid = await isEvaluationsPage();
      setIsValidUrl(isValid);
    };

    checkUrl();
  }, [isEvaluationsPage]);

  const foundResults = searchResults.filter(result => result.date !== null);
  const validResults = foundResults.filter(result => !isDateOld(result.date!, result.timeRange, result.status));
  const expiredResults = foundResults.filter(result => isDateOld(result.date!, result.timeRange, result.status));
  const notFoundResults = searchResults.filter(result => result.date === null);

  const onStartClick = async () => {
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
      setErrorMessage(null);
    } catch (error) {
      console.error('Error fetching results:', error);
      setSearchResults([]);
      setPsychotropicResults([]);
      setErrorMessage({
        title: 'Error',
        message: 'An error occurred while fetching evaluation results. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <>
      {isValidUrl ? (
        <ActionButton
          onClick={onStartClick}
          disabled={isProcessing}
          size="sm"
          className="w-full bg-blue-500 py-3 text-lg font-semibold text-white hover:bg-blue-600">
          {isProcessing ? 'Processing...' : 'Start Evaluation'}
        </ActionButton>
      ) : (
        <Alert
          message="Please navigate to the evaluations page to start processing evaluations. Make sure you're on the correct page before proceeding."
          variant="info"
        />
      )}

      {errorMessage && <Alert title={errorMessage.title} message={errorMessage.message} variant="error" />}

      {/* Valid Items */}
      {validResults.length > 0 && (
        <div className="mt-3">
          <h2 className="mb-1 text-sm font-medium text-[#34C759]">Valid Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-100 text-xs">
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
                    <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">{result.term}</td>
                    <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">{result.status || '-'}</td>
                    <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">{result.date}</td>
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
          <h2 className="mb-1 text-sm font-medium text-[#FF3B30]">Over Due</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-100 text-xs">
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
                    <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">{result.term}</td>
                    <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">{result.status || '-'}</td>
                    <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">{result.date}</td>
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
          <h2 className="mb-1 text-sm font-medium text-[#FF9500]">Not Found</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-100 text-xs">
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
                    <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">{result.term}</td>
                    <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">{result.status || '-'}</td>
                    <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">{result.date || '-'}</td>
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
          <h2 className="mb-1 text-sm font-medium text-blue-500">Psychotropic Drug and Behavior</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-100 text-xs">
              <thead className="bg-white">
                <tr>
                  <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Date</th>
                  <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {psychotropicResults.map((result, index) => (
                  <tr key={index}>
                    <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">{result.date}</td>
                    <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">{result.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
