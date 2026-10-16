import React from 'react';

interface StudyFlowLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  isDayMode?: boolean;
  variant?: '3d-books' | 'gradient-badge';
  className?: string;
}

export const StudyFlowLogo: React.FC<StudyFlowLogoProps> = ({
  size = 'md',
  showText = false,
  showSubtitle = false,
  isDayMode = false,
  variant = '3d-books',
  className = '',
}) => {
  const sizeMap = {
    xs: { icon: 24, text: 'text-xs', sub: 'text-[9px]' },
    sm: { icon: 32, text: 'text-sm', sub: 'text-[10px]' },
    md: { icon: 42, text: 'text-lg', sub: 'text-[11px]' },
    lg: { icon: 52, text: 'text-xl', sub: 'text-xs' },
    xl: { icon: 68, text: 'text-2xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon */}
      {variant === '3d-books' ? (
        <div
          className="relative shrink-0 flex items-center justify-center transition-transform hover:scale-105 duration-200"
          style={{ width: dim.icon, height: dim.icon }}
        >
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-md"
          >
            {/* Ambient Base Shadow / Glow */}
            <ellipse cx="32" cy="56" rx="24" ry="5.5" fill="#6366F1" fillOpacity={isDayMode ? 0.15 : 0.3} />

            {/* === BOOK 3 (BOTTOM - ROYAL BLUE) === */}
            {/* Bottom Cover Base */}
            <path d="M12 43 L32 52 L52 43 L32 34 Z" fill="#2563EB" />
            {/* Thickness & Left Spine */}
            <path d="M12 43 L12 47.5 L32 56.5 L32 52 Z" fill="#1D4ED8" />
            {/* Right Edge */}
            <path d="M52 43 L52 47.5 L32 56.5 L32 52 Z" fill="#1E40AF" />
            {/* White Pages */}
            <path d="M14 42.5 L32 50.5 L50 42.5 L32 35 Z" fill="#FFFFFF" />
            <path d="M14 42.5 L14 45.5 L32 53.5 L32 50.5 Z" fill="#E2E8F0" />
            <path d="M50 42.5 L50 45.5 L32 53.5 L32 50.5 Z" fill="#CBD5E1" />
            {/* Golden Bookmark Ribbon */}
            <path d="M38 45 L38 58 L42 55 L46 58 L46 45 Z" fill="#F59E0B" />

            {/* === BOOK 2 (MIDDLE - EMERALD GREEN) === */}
            {/* Base */}
            <path d="M13.5 32 L32 40.5 L50.5 32 L32 23.5 Z" fill="#10B981" />
            {/* Left Spine */}
            <path d="M13.5 32 L13.5 36.5 L32 45 L32 40.5 Z" fill="#059669" />
            {/* Right Spine */}
            <path d="M50.5 32 L50.5 36.5 L32 45 L32 40.5 Z" fill="#047857" />
            {/* Pages */}
            <path d="M15.5 31.5 L32 39 L48.5 31.5 L32 24.5 Z" fill="#FFFFFF" />
            <path d="M15.5 31.5 L15.5 34.5 L32 42 L32 39 Z" fill="#E2E8F0" />
            <path d="M48.5 31.5 L48.5 34.5 L32 42 L32 39 Z" fill="#D1D5DB" />

            {/* === BOOK 1 (TOP - VIBRANT CORAL RED) === */}
            {/* Base */}
            <path d="M15 21 L32 29.5 L49 21 L32 12.5 Z" fill="#EF4444" />
            {/* Left Spine */}
            <path d="M15 21 L15 25.5 L32 34 L32 29.5 Z" fill="#DC2626" />
            {/* Right Spine */}
            <path d="M49 21 L49 25.5 L32 34 L32 29.5 Z" fill="#B91C1C" />
            {/* Top Cover with Highlight sheen */}
            <path d="M15 19.5 L32 28 L49 19.5 L32 11 Z" fill="#F87171" />
            <path d="M17 19 L32 26.5 L47 19 L32 12 Z" fill="#EF4444" />
            {/* Book Spine Sheen */}
            <path d="M22 16 L32 21 L42 16 L32 12 Z" fill="white" fillOpacity="0.25" />
          </svg>
        </div>
      ) : (
        <div
          className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-md transition-transform hover:scale-105 duration-200"
          style={{ width: dim.icon, height: dim.icon }}
        >
          <span className="text-white font-extrabold text-lg select-none font-sans">S</span>
        </div>
      )}

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1 leading-none" dir="ltr">
            <span
              className={`font-black tracking-tight ${dim.text} ${
                isDayMode ? 'text-slate-900' : 'text-white'
              }`}
            >
              Study
            </span>
            <span
              className={`font-black tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent ${dim.text}`}
            >
              Flow
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`font-medium ${dim.sub} mt-0.5 ${
                isDayMode ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              منصتك الأكاديمية المتكاملة
            </span>
          )}
        </div>
      )}
    </div>
  );
};
