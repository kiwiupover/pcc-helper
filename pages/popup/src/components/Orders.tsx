import { useState } from 'react';
import { ActionButton } from './ActionButton';
import { ErrorMessage } from './ErrorMessage';
import { useChromeActions } from '@src/hooks/useChromeActions';
import type { NotificationType } from '@src/types';

interface OrderResult {
  orderName: string;
  status: string;
  date: string;
}

const SEDATIVE_MONITORING = `SEDATIVE/HYPNOTIC MEDICATION SIDE EFFECT MONITORING - Sedation, Morning hangover, ataxia, nausea, change in dreams, drowsiness, palpitations, light-headedness, constipation, abdominal pain, arthralgia, myalgia, rash, flu-like syndrome
Of Special Concerns: Monitor with use of other sedatives, tranquilizers, and alcohol`;
const SLEEP_MONITOR = `Sleep Monitor:
Upon waking, ask the resident ?How did you sleep??
N = Unable to Respond, W = Well, P = Poor, R = Resident Appears Rested`;

interface OrdersProps {
  currentUrl: string;
}

export const Orders = ({ currentUrl }: OrdersProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ title: string; message: string } | null>(null);
  const [orderResults, setOrderResults] = useState<OrderResult[]>([]);

  const handleShowMessage = (title: string, message: string, type: NotificationType) => {
    if (type === 'error') {
      setErrorMessage({ title, message });
    }
  };

  const { findText } = useChromeActions(handleShowMessage);
  const isValidUrl = currentUrl.includes('clinical/ordersChart.xhtml');

  const onStartClick = async () => {
    if (!isValidUrl) {
      setErrorMessage({
        title: 'Wrong Page',
        message: 'Please navigate to the Orders Chart page (clinical/ordersChart.xhtml) to use this feature',
      });
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Add a small delay to ensure the page is fully loaded
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find Melatonin orders and required monitoring
      console.log('Searching for Melatonin...');
      const melatoninResults = await findText('Melatonin');
      console.log('Melatonin search results:', melatoninResults);

      if (!melatoninResults || melatoninResults.length === 0) {
        setErrorMessage({
          title: 'No Melatonin Orders',
          message: 'No Melatonin orders were found. Please wait for the page to fully load and try again.',
        });
        return;
      }

      // Check for required monitoring orders
      console.log('Searching for monitoring orders...');
      const sedativeResults = await findText(SEDATIVE_MONITORING);
      const sleepResults = await findText(SLEEP_MONITOR);
      console.log('Sedative monitoring results:', sedativeResults);
      console.log('Sleep monitor results:', sleepResults);

      // Process search results
      const results: OrderResult[] = [
        {
          orderName: 'Melatonin',
          status: melatoninResults.length > 0 ? 'Found' : 'Not Found',
          date: melatoninResults[0]?.startDate || '',
        },
        {
          orderName: 'Sedative/Hypnotic Side Effect Monitoring',
          status: sedativeResults.length > 0 ? 'Found' : 'Not Found',
          date: sedativeResults[0]?.startDate || '',
        },
        {
          orderName: 'Sleep Quality Monitoring',
          status: sleepResults.length > 0 ? 'Found' : 'Not Found',
          date: sleepResults[0]?.startDate || '',
        },
      ];

      setOrderResults(results);
      setErrorMessage(null);
    } catch (error) {
      console.error('Error processing orders:', error);
      setErrorMessage({
        title: 'Search Error',
        message: 'Failed to search for orders. Please wait for the page to fully load and try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isValidUrl) {
    return (
      <div className="py-8 text-center text-gray-500">Please navigate to the Orders Chart page to use this feature</div>
    );
  }

  return (
    <>
      <ActionButton
        onClick={onStartClick}
        disabled={isProcessing}
        size="sm"
        className="w-full bg-blue-500 py-3 text-lg font-semibold text-white hover:bg-blue-600">
        {isProcessing ? 'Searching for orders...' : 'Evaluate Orders'}
      </ActionButton>

      {errorMessage && <ErrorMessage title={errorMessage.title} message={errorMessage.message} />}

      <div className="mt-3">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-100 text-xs">
            <tbody>
              {orderResults.map((order, index) => (
                <tr key={index}>
                  <td className="border border-gray-100 px-3 py-2 text-left font-medium text-gray-700">
                    {order.orderName}
                  </td>
                  <td
                    className={`border border-gray-100 px-3 py-2 text-left font-medium ${order.status === 'Found' ? 'text-green-600' : 'text-red-600'}`}>
                    {order.status}
                  </td>
                  <td className="border border-gray-100 px-3 py-2 text-left text-gray-600">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
