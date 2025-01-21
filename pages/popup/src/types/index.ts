export type NotificationType = 'info' | 'error' | 'success';

export type SearchResult = {
  term: string;
  date: string | null;
  isOld: boolean;
};

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
