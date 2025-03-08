import { useState } from 'react';
import { ActionButton } from './ActionButton';
import { ErrorMessage } from './ErrorMessage';
import { useChromeActions } from '@src/hooks/useChromeActions';
import type { NotificationType } from '@src/types';

interface OrdersProps {
  currentUrl: string;
}

export const Orders = ({ currentUrl }: OrdersProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ title: string; message: string } | null>(null);

  const handleShowMessage = (title: string, message: string, type: NotificationType) => {
    if (type === 'error') {
      setErrorMessage({ title, message });
    }
  };

  const { injectContentScript } = useChromeActions(handleShowMessage);
  const isValidUrl = currentUrl.includes('clinical/ordersChart.xhtml');

  const onStartClick = async () => {
    try {
      if (!isValidUrl) {
        setErrorMessage({
          title: 'Wrong Page',
          message: 'Please navigate to the Orders Chart page (clinical/ordersChart.xhtml) to use this feature',
        });
        return;
      }
      setIsProcessing(true);
      await injectContentScript();
      // TODO: Implement orders functionality
      setErrorMessage(null);
    } catch (error) {
      console.error('Error processing orders:', error);
      setErrorMessage({
        title: 'Error',
        message:
          'An error occurred while processing orders. Please make sure you are on the Orders Chart page and try again.',
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
        {isProcessing ? 'Processing...' : 'Start Orders'}
      </ActionButton>

      {errorMessage && <ErrorMessage title={errorMessage.title} message={errorMessage.message} />}

      <div className="mt-3">
        <h2 className="mb-1 text-sm font-medium text-blue-500">Active Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-100 text-xs">
            <thead className="bg-white">
              <tr>
                <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Order</th>
                <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Status</th>
                <th className="border border-gray-100 px-2 py-1 text-left text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">Sample Order</td>
                <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">Active</td>
                <td className="border border-gray-100 px-2 py-1 text-left text-gray-600">03/08/2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
