import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { useState, useEffect } from 'react';

import { useExtensionVersion } from './hooks/useExtensionVersion';
import type { TimeRange } from './types';
import { isDateTooOld } from './constants/config';
import { Evaluations } from './components/Evaluations';
import { Orders } from './components/Orders';
import { Tabs } from './components/Tabs';

const TABS = [
  { id: 'evaluations', label: 'Evaluations' },
  { id: 'orders', label: 'Orders' },
] as const;

type Tab = (typeof TABS)[number]['id'];

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
    <div className="min-w-[450px] bg-white">
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50/50 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            PCC Helper <span className="text-xs font-normal text-gray-500">v{version}</span>
          </h1>
        </div>
      </header>

      <div className="sticky top-[52px] z-10 bg-white/95 backdrop-blur-sm">
        <Tabs<Tab> tabs={TABS.map(tab => ({ ...tab, current: tab.id === activeTab }))} onChange={setActiveTab} />
      </div>

      <main className="space-y-4 p-4">
        <div
          role="tabpanel"
          id="evaluations-panel"
          aria-labelledby="evaluations-tab"
          hidden={activeTab !== 'evaluations'}>
          <Evaluations isDateOld={isDateOld} />
        </div>
        <div role="tabpanel" id="orders-panel" aria-labelledby="orders-tab" hidden={activeTab !== 'orders'}>
          <Orders currentUrl={currentUrl} />
        </div>
      </main>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div className="p-4">Loading...</div>),
  <div className="p-4 text-red-500">Error Occurred</div>,
);
