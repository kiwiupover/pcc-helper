import { XCircleIcon } from '@heroicons/react/20/solid';

export interface ErrorMessageProps {
  title: string;
  message: string;
}

export function ErrorMessage({ title, message }: ErrorMessageProps) {
  return (
    <div className="rounded-md bg-rose-50 p-4">
      <div className="flex">
        <div className="shrink-0">
          <XCircleIcon aria-hidden="true" className="size-5 text-rose-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-rose-800">{title}</h3>
          <div className="mt-2 text-sm text-rose-700">
            <div>{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
