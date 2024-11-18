import type { ButtonProps } from '../types';

const variants = {
  primary: `bg-gradient-to-r from-sky-500 to-blue-600 
            text-white hover:from-sky-600 hover:to-blue-700 
            focus:ring-sky-500/30 shadow-lg shadow-sky-500/20
            hover:shadow-sky-500/30 border border-sky-600/50`,
  secondary: `bg-slate-800/80 text-slate-200 
              hover:bg-slate-700/80 focus:ring-slate-500/20
              border border-slate-700/50 hover:border-slate-600/50
              backdrop-blur-sm`,
  outline: `border border-slate-700 bg-transparent 
            text-slate-300 hover:bg-slate-800/50 
            focus:ring-slate-500/20 backdrop-blur-sm`,
  danger: `bg-gradient-to-r from-red-500 to-rose-600 
          text-white hover:from-red-600 hover:to-rose-700 
          focus:ring-red-500/30 shadow-lg shadow-red-500/20
          hover:shadow-red-500/30 border border-red-600/50`,
  ghost: `bg-transparent text-slate-400 hover:bg-slate-800/50 
         hover:text-slate-200 focus:ring-slate-500/20`,
};

export const ActionButton = ({
  onClick,
  className = '',
  children,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
}: ButtonProps & {
  variant?: keyof typeof variants;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-300 hover:scale-[1.02] focus:outline-none
        focus:ring-4 active:scale-[0.98]
        ${sizeClasses[size]}
        ${variants[variant]}
        ${disabled ? 'pointer-events-none cursor-not-allowed opacity-50 saturate-50' : ''}
        ${className}
      `}>
      {icon && <span className="text-[1.1em]">{icon}</span>}
      {children}
    </button>
  );
};
