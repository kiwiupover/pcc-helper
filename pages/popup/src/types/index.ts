export type NotificationType = 'info' | 'error';

export type TimeRange = 'THREE_MONTHS' | 'ONE_YEAR' | 'ONE_TIME';

export interface SearchTermConfig {
  term: string;
  timeRange: TimeRange;
}

export interface SearchResult {
  term: string;
  date: string | null;
  timeRange: TimeRange;
  status: string | null;
}

export interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface SearchFormProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}
