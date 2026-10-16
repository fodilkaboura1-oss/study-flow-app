import React, { useState, useEffect } from 'react';
import { api } from './services/api.ts';
import type { User, Specialty, AcademicLevel } from './types/index.ts';
import { StudyFlowMobileApp } from './components/mobile/StudyFlowMobileApp.tsx';
import { StudyFlowWebPortal } from './components/web/StudyFlowWebPortal.tsx';
import { AndroidProjectView } from './components/android-export/AndroidProjectView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
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
} from 'lucide-react';

import { StudyFlowLogo } from './components/StudyFlowLogo.tsx';

type AppViewMode = 'mobile' | 'web' | 'sync' | 'android-project';

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>('sync');
  const [theme, setTheme] = useState<'day' | 'night'>(() => {
    return (localStorage.getItem('studyflow_theme') as 'day' | 'night') || 'day';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isDayMode = theme === 'day';

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

    api.getSpecialties().then((res) => setSpecialties(res.specialties));
    api.getLevels().then((res) => setLevels(res.levels));
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

  return (
    <div
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans select-none transition-colors duration-200 ${
        isDayMode ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-100'
      }`}
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
                AI
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border hidden sm:inline-block ${
                  isDayMode
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}
              >
                منظومة متكاملة (Web & Mobile)
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
            onClick={() => setViewMode('sync')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'sync'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
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
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                : isDayMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>تطبيق الهاتف</span>
          </button>

          <button
            onClick={() => setViewMode('web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'web'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              viewMode === 'android-project'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                : isDayMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مشروع Android و APK</span>
            <span className="sm:hidden">APK</span>
          </button>
        </div>

        {/* Quick Actions & Day/Night Toggle */}
        <div className="flex items-center gap-2">
          {/* Day / Night Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-xs font-semibold transition ${
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
                  طالب: فوديل
                </button>
                <button
                  onClick={() => handleSwitchUserRole('admin')}
                  className={`px-2 py-1 rounded-lg transition ${
                    currentUser.role === 'admin'
                      ? 'bg-sky-600 text-white font-bold'
                      : isDayMode
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  إدارة الكلية
                </button>
              </div>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-1.5 py-1 px-2.5 border rounded-xl text-xs transition ${
                  isDayMode
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                }`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-md object-cover"
                />
                <span className="font-semibold max-w-[80px] truncate">{currentUser.name}</span>
                {currentUser.verified && <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
            >
              تسجيل الدخول
            </button>
          )}

          <button
            onClick={handleRefreshAll}
            title="تحديث البيانات المتزامنة"
            className={`p-2 rounded-xl transition ${
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
        {/* VIEW 1: SIDE-BY-SIDE SYNC VIEW */}
        {viewMode === 'sync' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left/Middle: Full Web Platform */}
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

            {/* Right: Realistic Phone Frame running StudyFlow Mobile App */}
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
                  تطبيق StudyFlow أندرويد (تزامن حقيقي)
                </span>
                <p
                  className={`text-[10px] mt-0.5 ${
                    isDayMode ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  متصل بالخادم الخلفي وقاعدة البيانات المشتركة
                </p>
              </div>

              {/* Realistic Mobile Device Frame */}
              <div
                className={`relative w-[345px] h-[670px] max-h-[88vh] rounded-[38px] p-2 shadow-2xl border-[3px] flex flex-col overflow-hidden shrink-0 transition-all ${
                  isDayMode
                    ? 'bg-slate-300 border-slate-400 shadow-slate-400/40 ring-1 ring-slate-400/50'
                    : 'bg-slate-900 border-slate-800 shadow-black ring-1 ring-slate-700/80'
                }`}
              >
                {/* Speaker & Camera notch */}
                <div
                  className={`absolute top-3.5 left-1/2 -translate-x-1/2 w-20 h-3.5 rounded-full z-40 flex items-center justify-center ${
                    isDayMode ? 'bg-slate-400' : 'bg-slate-950'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      isDayMode ? 'bg-slate-600' : 'bg-slate-800'
                    }`}
                  />
                  <div
                    className={`w-6 h-1 rounded-full ${
                      isDayMode ? 'bg-slate-600' : 'bg-slate-800'
                    }`}
                  />
                </div>

                {/* Inner Screen */}
                <div className="flex-1 w-full h-full rounded-[30px] overflow-hidden flex flex-col relative">
                  <StudyFlowMobileApp
                    key={`mobile-${refreshTrigger}-${currentUser?.id}-${theme}`}
                    currentUser={currentUser}
                    isDayMode={isDayMode}
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                    onRefreshData={handleRefreshAll}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: DEDICATED MOBILE FULL VIEW */}
        {viewMode === 'mobile' && (
          <div
            className={`flex-1 h-full flex items-center justify-center p-2 sm:p-4 overflow-y-auto ${
              isDayMode ? 'bg-slate-200/60' : 'bg-slate-950'
            }`}
          >
            <div
              className={`relative w-full max-w-[400px] h-[780px] max-h-[95vh] rounded-[40px] p-2.5 shadow-2xl border-[3px] flex flex-col overflow-hidden ${
                isDayMode
                  ? 'bg-slate-300 border-slate-400 shadow-slate-400/50 ring-1 ring-slate-400/50'
                  : 'bg-slate-900 border-slate-800 shadow-black ring-1 ring-slate-700/80'
              }`}
            >
              <div
                className={`absolute top-3.5 left-1/2 -translate-x-1/2 w-20 h-3.5 rounded-full z-40 flex items-center justify-center ${
                  isDayMode ? 'bg-slate-400' : 'bg-slate-950'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isDayMode ? 'bg-slate-600' : 'bg-slate-800'
                  }`}
                />
                <div
                  className={`w-6 h-1 rounded-full ${
                    isDayMode ? 'bg-slate-600' : 'bg-slate-800'
                  }`}
                />
              </div>
              <div className="flex-1 w-full h-full rounded-[32px] overflow-hidden flex flex-col relative">
                <StudyFlowMobileApp
                  key={`mobile-full-${refreshTrigger}-${currentUser?.id}-${theme}`}
                  currentUser={currentUser}
                  isDayMode={isDayMode}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                  onRefreshData={handleRefreshAll}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: DEDICATED WEB PLATFORM FULL VIEW */}
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
