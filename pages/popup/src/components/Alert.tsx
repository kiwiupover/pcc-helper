import { InformationCircleIcon } from '@heroicons/react/20/solid';

interface AlertProps {
  title?: string;
  message: string;
  variant?: 'info' | 'warning' | 'error' | 'success';
  action?: {
    text: string;
    href: string;
  };
}

export const Alert = ({ title, message, variant = 'info', action }: AlertProps) => {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: 'text-blue-400',
      hover: 'hover:text-blue-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      icon: 'text-yellow-400',
      hover: 'hover:text-yellow-600',
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: 'text-red-400',
      hover: 'hover:text-red-600',
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      icon: 'text-green-400',
      hover: 'hover:text-green-600',
    },
  };

  const style = styles[variant];

  return (
    <div className={`rounded-md ${style.bg} py-2`}>
      <div className="flex">
        <div className="shrink-0 pl-2">
          <InformationCircleIcon aria-hidden="true" className={`size-4 ${style.icon}`} />
        </div>
        <div className="ml-4 flex-1 pr-2">
          <div>
            {title ? (
              <>
                <p className={`text-lg font-medium ${style.text}`}>{title}</p>
                <p className={`mt-1 text-base ${style.text}`}>{message}</p>
              </>
            ) : (
              <p className={`text-sm leading-relaxed ${style.text}`}>
                {message.split('\n').map((line, i) => (
                  <span key={i} className={i === 0 ? 'font-medium' : ''}>
                    {line}
                    {i < message.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            )}
          </div>
          {action && (
            <p className="mt-3 text-sm md:ml-6 md:mt-0">
              <a href={action.href} className={`whitespace-nowrap font-medium ${style.text} ${style.hover}`}>
                {action.text}
                <span aria-hidden="true"> &rarr;</span>
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
