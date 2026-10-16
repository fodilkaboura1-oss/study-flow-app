import React, { useState, useEffect } from 'react';
import { api } from './services/api.ts';
import type { User, Specialty, AcademicLevel } from './types/index.ts';
import { StudyFlowMobileApp } from './components/mobile/StudyFlowMobileApp.tsx';
import { StudyFlowWebPortal } from './components/web/StudyFlowWebPortal.tsx';
import { AndroidProjectView } from './components/android-export/AndroidProjectView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { useI18n, Language } from './lib/i18n.ts';
import {
  Smartphone,
  Monitor,
  Columns,
  Layers,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  RefreshCw,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';

import { StudyFlowLogo } from './components/StudyFlowLogo.tsx';

type AppViewMode = 'mobile' | 'web' | 'sync' | 'android-project';

export default function App() {
  const { lang, setLanguage, t, isRTL } = useI18n();

  // Detect mobile or standalone PWA
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.innerWidth < 768 ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }
    return 'mobile'; // Mobile-first default as required by prompt
  });

  const [theme, setTheme] = useState<'day' | 'night'>(() => {
    return (localStorage.getItem('studyflow_theme') as 'day' | 'night') || 'day';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isDayMode = theme === 'day';

  // Listen to window resize to adapt mobile layout
  useEffect(() => {
    const handleResize = () => {
      const isMobile =
        window.innerWidth < 768 ||
        window.matchMedia('(display-mode: standalone)').matches;
      setIsMobileScreen(isMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'day' ? 'night' : 'day';
    setTheme(nextTheme);
    localStorage.setItem('studyflow_theme', nextTheme);
  };

  useEffect(() => {
    if (isDayMode) {
      document.body.classList.add('day-mode');
    } else {
      document.body.classList.remove('day-mode');
    }
  }, [isDayMode]);

  // Initialize and load active user
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api
        .getMe()
        .then((res) => setCurrentUser(res.user))
        .catch(() => {
          api.login('fodilkaboura1@gmail.com', 'student123').then((res) => {
            setCurrentUser(res.user);
          });
        });
    } else {
      api
        .login('fodilkaboura1@gmail.com', 'student123')
        .then((res) => {
          setCurrentUser(res.user);
        })
        .catch(console.error);
    }

    api.getSpecialties().then((res) => setSpecialties(res.specialties)).catch(console.warn);
    api.getLevels().then((res) => setLevels(res.levels)).catch(console.warn);
  }, []);

  const handleSwitchUserRole = async (role: 'student' | 'admin') => {
    try {
      if (role === 'student') {
        const res = await api.login('fodilkaboura1@gmail.com', 'student123');
        setCurrentUser(res.user);
      } else {
        const res = await api.login('admin@univ-alger.dz', 'admin123');
        setCurrentUser(res.user);
      }
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefreshAll = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // If on actual mobile device or in standalone PWA mode, render full-bleed mobile app directly
  if (isMobileScreen) {
    return (
      <div
        className={`w-screen h-screen overflow-hidden font-sans select-none ${
          isDayMode ? 'bg-[#f8fafc] text-slate-800' : 'bg-[#060a14] text-slate-100'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <StudyFlowMobileApp
          key={`mobile-direct-${refreshTrigger}-${currentUser?.id}-${theme}-${lang}`}
          currentUser={currentUser}
          isDayMode={isDayMode}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onRefreshData={handleRefreshAll}
          onToggleTheme={toggleTheme}
          lang={lang}
          onSelectLanguage={setLanguage}
          onSwitchUserRole={handleSwitchUserRole}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          isDayMode={isDayMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setRefreshTrigger((prev) => prev + 1);
          }}
          specialties={specialties}
          levels={levels}
        />
      </div>
    );
  }

  // Desktop Responsive View with Toolbar & Multi-View Switcher
  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans select-none transition-colors duration-200 ${
        isDayMode ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Top Application Control Toolbar */}
      <header
        className={`h-14 border-b px-4 flex items-center justify-between shrink-0 z-30 transition-colors duration-200 ${
          isDayMode
            ? 'bg-white border-slate-200 shadow-xs'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        {/* Branding & Subtitle */}
        <div className="flex items-center gap-3">
          <StudyFlowLogo size="sm" isDayMode={isDayMode} />
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-black text-sm tracking-tight ${
                  isDayMode ? 'text-slate-900' : 'text-white'
                }`}
              >
                StudyFlow
              </span>
              <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                PWA
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border hidden sm:inline-block ${
                  isDayMode
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}
              >
                {t.appSubtitle}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div
          className={`flex items-center p-1 rounded-xl border text-xs ${
            isDayMode
              ? 'bg-slate-100 border-slate-200'
              : 'bg-slate-950/80 border-slate-800'
          }`}
        >
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : isDayMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>تطبيق الهاتف (PWA)</span>
          </button>

          <button
            onClick={() => setViewMode('sync')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              viewMode === 'sync'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : isDayMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">عرض متزامن (Live Sync)</span>
            <span className="md:hidden">تزامن</span>
          </button>

          <button
            onClick={() => setViewMode('web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              viewMode === 'web'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : isDayMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>منصة الويب</span>
          </button>

          <button
            onClick={() => setViewMode('android-project')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              viewMode === 'android-project'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : isDayMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مشروع Android & APK</span>
            <span className="sm:hidden">APK</span>
          </button>
        </div>

        {/* Quick Actions & Day/Night Toggle & Language */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div
            className={`flex items-center p-0.5 rounded-xl border text-[11px] font-bold ${
              isDayMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <button
              onClick={() => setLanguage('ar')}
              className={`px-2 py-1 rounded-lg transition ${
                lang === 'ar' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2 py-1 rounded-lg transition ${
                lang === 'fr' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition ${
                lang === 'en' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Day / Night Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              isDayMode
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-xs'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title={isDayMode ? 'التحويل إلى الوضع الليلي' : 'التحويل إلى الوضع النهاري'}
          >
            {isDayMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span className="hidden sm:inline">الوضع النهاري</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                <span className="hidden sm:inline">الوضع الليلي</span>
              </>
            )}
          </button>

          {/* Quick Account Switcher */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div
                className={`hidden lg:flex items-center gap-1 p-1 rounded-xl border text-[11px] ${
                  isDayMode
                    ? 'bg-slate-100 border-slate-200'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <button
                  onClick={() => handleSwitchUserRole('student')}
                  className={`px-2 py-1 rounded-lg transition ${
                    currentUser.role === 'student'
                      ? 'bg-indigo-600 text-white font-bold'
                      : isDayMode
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  طالب
                </button>
                <button
                  onClick={() => handleSwitchUserRole('admin')}
                  className={`px-2 py-1 rounded-lg transition ${
                    currentUser.role === 'admin'
                      ? 'bg-indigo-600 text-white font-bold'
                      : isDayMode
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  مشرف
                </button>
              </div>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-xl border text-xs transition ${
                  isDayMode
                    ? 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold max-w-[80px] truncate">{currentUser.name}</span>
                {currentUser.verified && <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              تسجيل الدخول
            </button>
          )}

          <button
            onClick={handleRefreshAll}
            title="تحديث البيانات المتزامنة"
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDayMode
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Viewport Container */}
      <div className="flex-1 overflow-hidden relative flex">
        {/* VIEW 1: DEDICATED MOBILE FULL PWA VIEW */}
        {viewMode === 'mobile' && (
          <div
            className={`flex-1 h-full flex items-center justify-center p-2 sm:p-4 overflow-y-auto ${
              isDayMode ? 'bg-slate-200/60' : 'bg-slate-950'
            }`}
          >
            <div
              className={`relative w-full max-w-[420px] h-[820px] max-h-[96vh] rounded-[42px] p-2.5 shadow-2xl border-[3px] flex flex-col overflow-hidden ${
                isDayMode
                  ? 'bg-slate-300 border-slate-400 shadow-slate-400/50 ring-1 ring-slate-400/50'
                  : 'bg-slate-900 border-slate-800 shadow-black ring-1 ring-slate-700/80'
              }`}
            >
              {/* Speaker & Notch */}
              <div
                className={`absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full z-40 flex items-center justify-center ${
                  isDayMode ? 'bg-slate-400' : 'bg-slate-950'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isDayMode ? 'bg-slate-600' : 'bg-slate-800'
                  }`}
                />
                <div
                  className={`w-8 h-1 rounded-full ${
                    isDayMode ? 'bg-slate-600' : 'bg-slate-800'
                  }`}
                />
              </div>

              {/* Inner Screen */}
              <div className="flex-1 w-full h-full rounded-[34px] overflow-hidden flex flex-col relative">
                <StudyFlowMobileApp
                  key={`mobile-full-${refreshTrigger}-${currentUser?.id}-${theme}-${lang}`}
                  currentUser={currentUser}
                  isDayMode={isDayMode}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                  onRefreshData={handleRefreshAll}
                  onToggleTheme={toggleTheme}
                  lang={lang}
                  onSelectLanguage={setLanguage}
                  onSwitchUserRole={handleSwitchUserRole}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SIDE-BY-SIDE SYNC VIEW */}
        {viewMode === 'sync' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left: Web Platform */}
            <div
              className={`flex-1 h-full overflow-hidden border-l ${
                isDayMode ? 'border-slate-200' : 'border-slate-800'
              }`}
            >
              <StudyFlowWebPortal
                key={`web-${refreshTrigger}-${currentUser?.id}-${theme}`}
                currentUser={currentUser}
                isDayMode={isDayMode}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onOpenMobileView={() => setViewMode('mobile')}
                onToggleTheme={toggleTheme}
              />
            </div>

            {/* Right: Phone Frame */}
            <div
              className={`w-full md:w-[400px] p-2 md:p-3 flex flex-col items-center justify-center shrink-0 border-r overflow-y-auto ${
                isDayMode
                  ? 'bg-slate-200/60 border-slate-300'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="text-center mb-2 shrink-0">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                    isDayMode
                      ? 'text-indigo-800 bg-indigo-100 border-indigo-300 shadow-xs'
                      : 'text-indigo-400 bg-indigo-950/80 border-indigo-800/60'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  StudyFlow PWA Mobile (تزامن حقيقي)
                </span>
              </div>

              <div
                className={`relative w-[345px] h-[670px] max-h-[88vh] rounded-[38px] p-2 shadow-2xl border-[3px] flex flex-col overflow-hidden shrink-0 ${
                  isDayMode
                    ? 'bg-slate-300 border-slate-400 shadow-slate-400/40 ring-1 ring-slate-400/50'
                    : 'bg-slate-900 border-slate-800 shadow-black ring-1 ring-slate-700/80'
                }`}
              >
                <div className="flex-1 w-full h-full rounded-[30px] overflow-hidden flex flex-col relative">
                  <StudyFlowMobileApp
                    key={`mobile-sync-${refreshTrigger}-${currentUser?.id}-${theme}-${lang}`}
                    currentUser={currentUser}
                    isDayMode={isDayMode}
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                    onRefreshData={handleRefreshAll}
                    onToggleTheme={toggleTheme}
                    lang={lang}
                    onSelectLanguage={setLanguage}
                    onSwitchUserRole={handleSwitchUserRole}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: WEB PLATFORM FULL VIEW */}
        {viewMode === 'web' && (
          <div className="flex-1 h-full overflow-hidden">
            <StudyFlowWebPortal
              key={`web-full-${refreshTrigger}-${currentUser?.id}-${theme}`}
              currentUser={currentUser}
              isDayMode={isDayMode}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenMobileView={() => setViewMode('mobile')}
              onToggleTheme={toggleTheme}
            />
          </div>
        )}

        {/* VIEW 4: ANDROID STANDALONE PROJECT & APK VIEW */}
        {viewMode === 'android-project' && <AndroidProjectView isDayMode={isDayMode} />}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        isDayMode={isDayMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setRefreshTrigger((prev) => prev + 1);
        }}
        specialties={specialties}
        levels={levels}
      />
    </div>
  );
}
