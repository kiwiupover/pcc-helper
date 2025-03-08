import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { useState, useEffect } from 'react';

import { useExtensionVersion } from './hooks/useExtensionVersion';
import type { TimeRange } from './types';
import { isDateTooOld } from './constants/config';
import { Evaluations } from './components/Evaluations';
import { Orders } from './components/Orders';

type Tab = 'evaluations' | 'orders';

const Popup = () => {
  const [activeTab, setActiveTab] = useState<Tab>('evaluations');
  const [currentUrl, setCurrentUrl] = useState('');

  // Get current URL on popup reload
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.url) {
        setCurrentUrl(tabs[0].url);
      }
    });
  }, []);

  const version = useExtensionVersion();

  const isDateOld = (dateStr: string, timeRange: TimeRange, status: string | null) => {
    const [month, day, year] = dateStr.split('/').map(Number);
    return isDateTooOld(new Date(year, month - 1, day), timeRange, status);
  };

  return (
    <div className="min-w-[450px] bg-white p-4">
      <header className="mb-4 text-lg font-semibold text-gray-900">
        PCC Helper <span className="text-xs text-gray-500">v{version}</span>
      </header>

      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'evaluations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}>
            Evaluations
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}>
            Orders
          </button>
        </nav>
      </div>

      <main className="space-y-4">
        {activeTab === 'evaluations' ? <Evaluations isDateOld={isDateOld} /> : <Orders currentUrl={currentUrl} />}
      </main>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div className="p-4">Loading...</div>),
  <div className="p-4 text-red-500">Error Occurred</div>,
);
