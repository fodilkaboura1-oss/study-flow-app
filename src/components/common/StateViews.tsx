import React from 'react';
import { AlertCircle, RefreshCw, FolderSearch, Sparkles, Inbox } from 'lucide-react';

interface LoadingSkeletonProps {
  rows?: number;
  isDayMode?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 3, isDayMode = false }) => {
  return (
    <div className="space-y-3 w-full p-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`p-4 rounded-2xl border animate-pulse space-y-3 ${
            isDayMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full ${
                isDayMode ? 'bg-slate-200' : 'bg-slate-800'
              }`}
            />
            <div className="space-y-1.5 flex-1">
              <div
                className={`h-3 w-1/3 rounded ${
                  isDayMode ? 'bg-slate-200' : 'bg-slate-800'
                }`}
              />
              <div
                className={`h-2.5 w-1/4 rounded ${
                  isDayMode ? 'bg-slate-100' : 'bg-slate-800/60'
                }`}
              />
            </div>
          </div>
          <div
            className={`h-4 w-5/6 rounded ${
              isDayMode ? 'bg-slate-200' : 'bg-slate-800'
            }`}
          />
          <div
            className={`h-3 w-1/2 rounded ${
              isDayMode ? 'bg-slate-100' : 'bg-slate-800/60'
            }`}
          />
        </div>
      ))}
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  isDayMode?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  isDayMode = false,
}) => {
  return (
    <div
      className={`p-8 rounded-2xl border text-center flex flex-col items-center justify-center my-4 ${
        isDayMode ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900/50 border-slate-800 text-slate-300'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-xs ${
          isDayMode ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'
        }`}
      >
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h3 className="text-sm font-bold mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-400 max-w-xs mb-4">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs min-h-[44px] shadow-sm transition active:scale-95 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  isDayMode?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  retryText = 'إعادة المحاولة',
  isDayMode = false,
}) => {
  return (
    <div
      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 my-2 ${
        isDayMode ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
      }`}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
        <span className="text-xs font-semibold leading-relaxed truncate">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold min-h-[44px] shrink-0 transition active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{retryText}</span>
        </button>
      )}
    </div>
  );
};
