import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';
import { useI18n } from '../../lib/i18n.ts';
import { Download, Share2, PlusSquare, X, CheckCircle, Smartphone } from 'lucide-react';

export const PWAInstallBanner: React.FC<{ isDayMode?: boolean }> = ({ isDayMode = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useI18n();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed in standalone mode or dismissed for this session, hide
  if (isInstalled || dismissed) {
    return null;
  }

  // Handle click on Install Button
  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions modal
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <div
        className={`w-full px-3 py-2.5 border-b flex items-center justify-between transition-all ${
          isDayMode
            ? 'bg-gradient-to-r from-indigo-50 to-sky-50 border-indigo-100 text-indigo-950'
            : 'bg-gradient-to-r from-indigo-950/70 to-slate-900 border-indigo-800/40 text-slate-100'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold leading-tight truncate">
              {t.common.installBannerTitle}
            </h4>
            <p
              className={`text-[10px] leading-tight truncate ${
                isDayMode ? 'text-indigo-700/80' : 'text-indigo-300/80'
              }`}
            >
              {t.common.installBannerDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold shadow-sm min-h-[44px] transition cursor-pointer"
            aria-label={t.common.installApp}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isIOS ? t.common.installIos : t.common.installApp}</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className={`p-2 rounded-lg transition min-h-[44px] min-w-[36px] flex items-center justify-center ${
              isDayMode
                ? 'text-slate-500 hover:bg-slate-200/60'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title={t.common.close}
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl border space-y-4 ${
              isDayMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  SF
                </div>
                <div>
                  <h3 className="text-sm font-bold">{t.common.installIos}</h3>
                  <p className="text-[11px] text-slate-400">Safari & Chrome Mobile</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800/20 text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className={`p-3.5 rounded-xl border text-xs space-y-2.5 ${
                isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                  <Share2 className="w-4 h-4" />
                </div>
                <p className="leading-relaxed">{t.common.installIosStep1}</p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <p className="leading-relaxed">{t.common.installIosStep2}</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs min-h-[44px] shadow-sm transition"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
