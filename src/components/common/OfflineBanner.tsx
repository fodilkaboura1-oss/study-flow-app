import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.ts';
import { useI18n } from '../../lib/i18n.ts';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useI18n();

  if (isOnline) {
    return null;
  }

  return (
    <div className="w-full bg-amber-500 text-amber-950 px-3 py-2 text-xs font-semibold flex items-center justify-between shadow-md z-40 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2 truncate">
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-950" />
        <span className="truncate">{t.common.offlineMsg}</span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-1 bg-amber-950/15 hover:bg-amber-950/25 px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 min-h-[36px] transition cursor-pointer"
      >
        <RefreshCw className="w-3 h-3" />
        <span>{t.common.retry}</span>
      </button>
    </div>
  );
};
