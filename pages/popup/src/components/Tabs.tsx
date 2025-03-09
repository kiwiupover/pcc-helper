interface TabItem<T extends string = string> {
  id: T;
  label: string;
  current: boolean;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  onChange: (id: T) => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Tabs<T extends string>({ tabs, onChange }: TabsProps<T>) {
  return (
    <div>
      <div className="block">
        <div className="border-b border-slate-200 px-2">
          <nav aria-label="Tabs" className="-mb-px flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                role="tab"
                aria-selected={tab.current}
                aria-controls={`${tab.id}-panel`}
                className={`group relative flex-1 select-none overflow-hidden px-4 py-3 text-sm font-medium focus:shadow-none focus:outline-0 focus:ring-0 focus:ring-offset-0 
                  ${
                    tab.current
                      ? 'bg-blue-50/50 text-blue-600 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.15)]'
                      : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}>
                <div className="relative z-0">{tab.label}</div>
                <div
                  className={classNames(
                    'absolute bottom-0 left-0 h-0.5 w-full transition-all duration-200',
                    tab.current ? 'scale-100 bg-blue-500' : 'scale-0 bg-slate-200 group-hover:scale-100',
                  )}
                  aria-hidden="true"
                />
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
