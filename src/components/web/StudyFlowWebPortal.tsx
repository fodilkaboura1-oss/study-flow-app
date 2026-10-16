import React, { useState, useEffect } from 'react';
import type {
  User,
  Specialty,
  AcademicLevel,
  Course,
  Lecture,
  CommunityPost,
  AppNotification,
} from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { StudyFlowLogo } from '../StudyFlowLogo.tsx';
import {
  Home,
  BookOpen,
  FolderOpen,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  MessageSquare,
  Heart,
  FileText,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Settings,
  Flame,
  Award,
  Download,
  Share2,
  Bookmark,
  Bell,
  Check,
} from 'lucide-react';

interface StudyFlowWebPortalProps {
  currentUser: User | null;
  isDayMode?: boolean;
  onOpenAuth: () => void;
  onOpenMobileView?: () => void;
  onToggleTheme?: () => void;
}

type WebSection = 'home' | 'subjects' | 'lectures' | 'assistant' | 'announcements' | 'community';

export const StudyFlowWebPortal: React.FC<StudyFlowWebPortalProps> = ({
  currentUser,
  isDayMode = false,
  onOpenAuth,
  onOpenMobileView,
  onToggleTheme,
}) => {
  const [activeSection, setActiveSection] = useState<WebSection>('home');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [searchSubject, setSearchSubject] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Spaced Repetition State
  const [reviewStats, setReviewStats] = useState({
    overdue: 0,
    dueToday: 0,
    newCards: 0,
    reviewedToday: 0,
    estimatedMinutes: 1,
  });
  const [isReviewSessionActive, setIsReviewSessionActive] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showCardAnswer, setShowCardAnswer] = useState(false);

  // AI Assistant Chat State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<
    { role: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      role: 'assistant',
      text: 'مرحباً بك فوديل في StudyFlow AI! أنا رفيقك الأكاديمي الذكي المخصص لطلبة إدارة الأعمال والعلوم الاقتصادية. كيف يمكنني مساعدتك في استيعاب محاضراتك اليوم؟',
      time: '12:00',
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // New Community Post modal
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');

  // Sample review flashcards for Spaced Repetition
  const flashcards = [
    {
      q: 'ما هي المعادلة الجوهرية للتوازن المالي الوظيفي؟',
      a: 'الخزينة الصافية (TN) = رأس المال العامل الصافي الإجمالي (FRNG) - احتياج رأس المال العامل (BFR).',
      subject: 'إدارة مالية',
    },
    {
      q: 'ما هو المسار الحرج (Critical Path) في طريقة CPM؟',
      a: 'أطول سلسلة من الأنشطة المتتابعة التي تحدد أقصر مدة زمنية ممكنة لإتمام المشروع بالكامل دون أي فائض زمني (Float = 0).',
      subject: 'إدارة المشاريع',
    },
    {
      q: 'ما هي الأجزاء الخمسة للهيكل التنظيمي حسب مينتزبرغ؟',
      a: 'القمة الإستراتيجية، الخط الأوسط، المركز العملياتي، الهيكل الفني (Technostructure)، وموظفو الدعم اللوجستي.',
      subject: 'هياكل وتنظيم المؤسسة',
    },
  ];

  // Fetch courses and posts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [coursesRes, postsRes] = await Promise.all([
          api.getCourses(currentUser?.specialtyId, currentUser?.levelId),
          api.getPosts(),
        ]);
        setCourses(coursesRes.courses);
        setPosts(postsRes.posts);

        if (coursesRes.courses.length > 0) {
          const firstCourse = coursesRes.courses[0];
          setSelectedCourse(firstCourse);
          const lecsRes = await api.getLectures(firstCourse.id);
          setLectures(lecsRes.lectures);
          setSelectedLecture(lecsRes.lectures[0] || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser?.id]);

  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course);
    try {
      const res = await api.getLectures(course.id);
      setLectures(res.lectures);
      setSelectedLecture(res.lectures[0] || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || aiPrompt;
    if (!prompt.trim() || aiLoading) return;

    const userMsg = {
      role: 'user' as const,
      text: prompt,
      time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
    };
    setAiChatHistory((prev) => [...prev, userMsg]);
    setAiPrompt('');
    setAiLoading(true);

    try {
      const res = await api.askAssistant(
        prompt,
        selectedCourse?.name || 'إدارة الأعمال',
        selectedLecture?.title
      );
      const assistantMsg = {
        role: 'assistant' as const,
        text: res.answer,
        time: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      };
      setAiChatHistory((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setAiChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'عذراً، حدث خطأ أثناء الاتصال بمساعد الدراسة الذكي. يُرجى إعادة المحاولة.',
          time: 'الآن',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (searchSubject && !c.name.includes(searchSubject) && !c.code.includes(searchSubject)) {
      return false;
    }
    return true;
  });

  return (
    <div
      className={`flex h-full w-full overflow-hidden text-right transition-colors duration-200 ${
        isDayMode ? 'bg-[#f5f7fb] text-slate-800' : 'bg-[#060a14] text-slate-100'
      }`}
    >
      {/* =========================================================================
          RIGHT SIDEBAR (Exact StudyFlow Sidebar Layout from Vercel)
      ========================================================================= */}
      <aside
        className={`w-64 shrink-0 flex flex-col justify-between border-l z-20 transition-colors duration-200 ${
          isDayMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c1220] border-[#6366f11f]'
        }`}
      >
        {/* Top: Logo & Nav Links */}
        <div className="p-4 flex flex-col gap-5">
          {/* StudyFlow Exact Logo */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl select-none">📚</span>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                StudyFlow
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDayMode ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-950 text-indigo-300'
              }`}
            >
              الويب
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 mt-2">
            <button
              onClick={() => setActiveSection('home')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                activeSection === 'home'
                  ? 'bg-indigo-600/15 text-indigo-500 font-bold border border-indigo-500/20'
                  : isDayMode
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-400 hover:bg-[#141c2e] hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 text-amber-500 shrink-0" />
              <span>الصفحة الرئيسية</span>
            </button>

            <button
              onClick={() => setActiveSection('subjects')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                activeSection === 'subjects'
                  ? 'bg-indigo-600/15 text-indigo-500 font-bold border border-indigo-500/20'
                  : isDayMode
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-400 hover:bg-[#141c2e] hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>موادي الدراسية</span>
            </button>

            <button
              onClick={() => setActiveSection('lectures')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                activeSection === 'lectures'
                  ? 'bg-indigo-600/15 text-indigo-500 font-bold border border-indigo-500/20'
                  : isDayMode
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-400 hover:bg-[#141c2e] hover:text-white'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-sky-400 shrink-0" />
              <span>المحاضرات والملفات</span>
            </button>

            <button
              onClick={() => setActiveSection('assistant')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                activeSection === 'assistant'
                  ? 'bg-indigo-600/15 text-indigo-500 font-bold border border-indigo-500/20'
                  : isDayMode
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-400 hover:bg-[#141c2e] hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>المساعد الذكي</span>
            </button>

            <button
              onClick={() => setActiveSection('announcements')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                activeSection === 'announcements'
                  ? 'bg-indigo-600/15 text-indigo-500 font-bold border border-indigo-500/20'
                  : isDayMode
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-400 hover:bg-[#141c2e] hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4 text-rose-400 shrink-0" />
              <span>إعلانات الكلية</span>
            </button>

            <button
              onClick={() => setActiveSection('community')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                activeSection === 'community'
                  ? 'bg-indigo-600/15 text-indigo-500 font-bold border border-indigo-500/20'
                  : isDayMode
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-slate-400 hover:bg-[#141c2e] hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>المجتمع الجامعي</span>
            </button>
          </nav>
        </div>

        {/* Bottom User Area */}
        <div
          className={`p-3.5 border-t flex flex-col gap-2.5 ${
            isDayMode ? 'border-slate-200 bg-slate-50/50' : 'border-[#6366f11f] bg-[#090e1a]'
          }`}
        >
          {currentUser && (
            <div className="flex items-center gap-2.5 px-1.5 py-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                ف
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span
                    className={`font-bold text-xs truncate ${
                      isDayMode ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {currentUser.name}
                  </span>
                  {currentUser.verified && <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                </div>
                <span
                  className={`text-[10px] block truncate ${
                    isDayMode ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {currentUser.badge || 'مشرف'}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-400">
            <button
              onClick={() => setActiveSection('subjects')}
              className={`flex items-center gap-1 transition ${
                isDayMode ? 'hover:text-slate-900' : 'hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>تخصصي</span>
            </button>

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-1.5 rounded-lg border transition ${
                  isDayMode
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : 'bg-[#141c2e] text-slate-300 border-[#6366f11f] hover:text-white'
                }`}
                title={isDayMode ? 'التبديل إلى الوضع الليلي' : 'التبديل إلى الوضع النهاري'}
              >
                {isDayMode ? <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            )}

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 text-rose-500 hover:text-rose-400 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTENT AREA
      ========================================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header
          className={`h-14 px-6 border-b flex items-center justify-between shrink-0 transition-colors duration-200 ${
            isDayMode ? 'bg-white border-slate-200' : 'bg-[#0c1220] border-[#6366f11f]'
          }`}
        >
          <div className="flex items-center gap-3">
            <h1
              className={`text-base font-bold ${
                isDayMode ? 'text-slate-900' : 'text-white'
              }`}
            >
              {activeSection === 'home' && 'الصفحة الرئيسية'}
              {activeSection === 'subjects' && 'موادي الدراسية'}
              {activeSection === 'lectures' && 'المحاضرات والملفات الأكاديمية'}
              {activeSection === 'assistant' && 'المساعد الذكي (StudyFlow AI)'}
              {activeSection === 'announcements' && 'إعلانات الكلية الرسمية'}
              {activeSection === 'community' && 'المجتمع والمنشورات الطلابية'}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                isDayMode
                  ? 'bg-slate-100 border-slate-200 text-slate-600'
                  : 'bg-[#141c2e] border-[#6366f11f] text-slate-300'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>15 أكتوبر 2026</span>
            </div>

            {onOpenMobileView && (
              <button
                onClick={onOpenMobileView}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-xs transition"
              >
                <span>فتح واجهة الموبايل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* =========================================================================
              SECTION 1: HOME (Exact Vercel Website Dashboard)
          ========================================================================= */}
          {activeSection === 'home' && (
            <div className="space-y-6">
              {/* Student Header Welcome Banner Card */}
              <div
                className={`p-6 rounded-2xl border relative overflow-hidden transition-all duration-200 ${
                  isDayMode
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-[#0c1220] border-[#6366f11f] shadow-lg'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Right side: Greeting & Quick Action Pills */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h2
                        className={`text-xl font-extrabold ${
                          isDayMode ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        مساء الخير، {currentUser?.name || 'فوديل كابورة'} 👋
                      </h2>
                    </div>
                    <p
                      className={`text-xs ${
                        isDayMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      15 أكتوبر 2026 — خميس
                    </p>

                    {/* Quick navigation pill buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        onClick={() => setActiveSection('subjects')}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:opacity-95 transition"
                      >
                        📅 المخطط والجدول الدراسي
                      </button>
                      <button
                        onClick={() => setIsReviewSessionActive(true)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                          isDayMode
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                            : 'bg-[#141c2e] hover:bg-[#1c2640] border-[#6366f11f] text-slate-200'
                        }`}
                      >
                        🧠 مركز المراجعة اليومية
                      </button>
                      <button
                        onClick={() => setActiveSection('lectures')}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                          isDayMode
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                            : 'bg-[#141c2e] hover:bg-[#1c2640] border-[#6366f11f] text-slate-200'
                        }`}
                      >
                        📚 المكتبة الرقمية
                      </button>
                      <button
                        onClick={() => setActiveSection('assistant')}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                          isDayMode
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                            : 'bg-[#141c2e] hover:bg-[#1c2640] border-[#6366f11f] text-slate-200'
                        }`}
                      >
                        🤖 المساعد الذكي
                      </button>
                    </div>
                  </div>

                  {/* Left side: Student University Details Card */}
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-4 ${
                      isDayMode
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-[#141c2e]/60 border-[#6366f11f]'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 text-white text-xl font-black flex items-center justify-center shadow-lg shrink-0">
                      ف
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-black text-sm ${
                            isDayMode ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {currentUser?.name || 'فوديل كابورة'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          {currentUser?.badge || 'مشرف'}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] leading-tight ${
                          isDayMode ? 'text-slate-600' : 'text-slate-300'
                        }`}
                      >
                        🏛️ جامعة عبد الحميد بن باديس مستغانم
                      </div>
                      <div
                        className={`text-[10px] ${
                          isDayMode ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        🎓 {currentUser?.levelName || 'ليسانس / السنة الثالثة'}
                      </div>
                      <div className="text-[10px] font-bold text-indigo-400">
                        📚 {currentUser?.specialtyName || 'إدارة الأعمال (علوم التسيير)'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spaced Repetition (المراجعة اليومية والتكرار المتباعد) Card */}
              <div
                className={`p-5 rounded-2xl border space-y-4 ${
                  isDayMode
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-[#0c1220] border-[#6366f11f]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3
                      className={`text-sm font-extrabold flex items-center gap-2 ${
                        isDayMode ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      <span>🧠</span>
                      <span>المراجعة اليومية والتكرار المتباعد (Spaced Repetition)</span>
                    </h3>
                    <p
                      className={`text-xs mt-1 ${
                        isDayMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      خوارزمية ذكية تحسب أوقات المراجعة وتمنع نسيان المفاهيم والقوانين قبل الامتحانات.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsReviewSessionActive(true);
                      setCurrentReviewIndex(0);
                      setShowCardAnswer(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition"
                  >
                    <span>⚡ بدء جلسة المراجعة الآن</span>
                  </button>
                </div>

                {/* Spaced Repetition Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div
                    className={`p-3 rounded-xl border text-center ${
                      isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-[#141c2e] border-[#6366f11f]'
                    }`}
                  >
                    <div className="text-xl font-black text-rose-500">{reviewStats.overdue}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isDayMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      ⚠️ بطاقات متأخرة
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center ${
                      isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-[#141c2e] border-[#6366f11f]'
                    }`}
                  >
                    <div className="text-xl font-black text-amber-400">{reviewStats.dueToday}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isDayMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      📅 مستحقة اليوم
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center ${
                      isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-[#141c2e] border-[#6366f11f]'
                    }`}
                  >
                    <div className="text-xl font-black text-sky-400">{reviewStats.newCards}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isDayMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      ✨ بطاقات جديدة
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center ${
                      isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-[#141c2e] border-[#6366f11f]'
                    }`}
                  >
                    <div className="text-xl font-black text-emerald-400">
                      {reviewStats.reviewedToday}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isDayMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      🔄 روجعت اليوم
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center ${
                      isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-[#141c2e] border-[#6366f11f]'
                    }`}
                  >
                    <div className="text-xl font-black text-indigo-400">
                      {reviewStats.estimatedMinutes} د
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        isDayMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      ⏱️ الوقت المقدر
                    </div>
                  </div>
                </div>

                {/* Flashcard Active Session View */}
                {isReviewSessionActive && (
                  <div
                    className={`p-4 rounded-xl border space-y-3 ${
                      isDayMode
                        ? 'bg-indigo-50/70 border-indigo-200'
                        : 'bg-indigo-950/40 border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-400">
                        بطاقة {currentReviewIndex + 1} من {flashcards.length} —{' '}
                        {flashcards[currentReviewIndex].subject}
                      </span>
                      <button
                        onClick={() => setIsReviewSessionActive(false)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        إغلاق
                      </button>
                    </div>

                    <div className="py-2">
                      <p
                        className={`text-sm font-bold ${
                          isDayMode ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {flashcards[currentReviewIndex].q}
                      </p>
                      {showCardAnswer ? (
                        <div
                          className={`mt-3 p-3 rounded-lg border text-xs leading-relaxed ${
                            isDayMode
                              ? 'bg-white border-indigo-200 text-indigo-900'
                              : 'bg-[#141c2e] border-indigo-500/40 text-emerald-300'
                          }`}
                        >
                          {flashcards[currentReviewIndex].a}
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowCardAnswer(true)}
                          className="mt-3 text-xs text-indigo-400 hover:underline font-bold"
                        >
                          🔍 انقر لإظهار الإجابة
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (currentReviewIndex < flashcards.length - 1) {
                            setCurrentReviewIndex((prev) => prev + 1);
                            setShowCardAnswer(false);
                            setReviewStats((s) => ({ ...s, reviewedToday: s.reviewedToday + 1 }));
                          } else {
                            setIsReviewSessionActive(false);
                            setReviewStats((s) => ({ ...s, reviewedToday: s.reviewedToday + 1 }));
                          }
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition"
                      >
                        {currentReviewIndex < flashcards.length - 1 ? 'البطاقة التالية ←' : 'إنهاء الجلسة ✓'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Encouraging Footer text */}
                <div
                  className={`p-3 rounded-xl border text-center text-xs ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-[#141c2e]/60 border-[#6366f11f] text-slate-400'
                  }`}
                >
                  🎉 رائع! يمكنك تصفح موادك ومراجعة المفاهيم اليومية لضمان التفوق الأكاديمي.
                </div>
              </div>

              {/* Main 2-Column Grid: Today's Schedule & 8 Subjects */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. جدول اليوم (خميس) */}
                <div
                  className={`p-5 rounded-2xl border space-y-4 ${
                    isDayMode
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-[#0c1220] border-[#6366f11f]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm font-extrabold flex items-center gap-2 ${
                        isDayMode ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>جدول اليوم (خميس)</span>
                    </h3>
                    <button
                      onClick={() => setActiveSection('subjects')}
                      className="text-xs text-indigo-400 hover:underline font-semibold"
                    >
                      الجدول الكامل ←
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Lecture 1 */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                        isDayMode
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          : 'bg-[#141c2e] hover:bg-[#1a243b] border-[#6366f11f]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div
                          className={`font-bold text-sm ${
                            isDayMode ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          إدارة المشاريع
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isDayMode ? 'bg-slate-200 text-slate-700' : 'bg-[#0c1220] text-slate-300'
                            }`}
                          >
                            محاضرة
                          </span>
                          <span>📍 مدرج 04</span>
                          <span>👨‍🏫 أ/ قبايلي</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-indigo-400">08:00</div>
                        <div className="text-[10px] font-mono text-slate-500">09:30</div>
                      </div>
                    </div>

                    {/* Lecture 2 */}
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                        isDayMode
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          : 'bg-[#141c2e] hover:bg-[#1a243b] border-[#6366f11f]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div
                          className={`font-bold text-sm ${
                            isDayMode ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          هياكل وتنظيم المؤسسة
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isDayMode ? 'bg-slate-200 text-slate-700' : 'bg-[#0c1220] text-slate-300'
                            }`}
                          >
                            محاضرة
                          </span>
                          <span>📍 مدرج 04</span>
                          <span>👨‍🏫 أ/ دحمان</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-indigo-400">09:30</div>
                        <div className="text-[10px] font-mono text-slate-500">11:00</div>
                      </div>
                    </div>
                  </div>

                  {/* Tasks and Daily Goals Summary */}
                  <div
                    className={`mt-4 p-3.5 rounded-xl border space-y-2 ${
                      isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-[#141c2e]/60 border-[#6366f11f]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={isDayMode ? 'text-slate-900' : 'text-white'}>
                        📝 المهام والأهداف
                      </span>
                      <span className="text-indigo-400">0/0 مهام اليوم</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div>
                        <div className="font-extrabold text-sm text-indigo-400">0</div>
                        <div className="text-[10px] text-slate-500">دقيقة دراسة</div>
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-emerald-400">0%</div>
                        <div className="text-[10px] text-slate-500">هدف الأسبوع</div>
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-sky-400">8</div>
                        <div className="text-[10px] text-slate-500">مواد معتمدة</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. المواد الدراسية (8 مواد من المنصة) */}
                <div
                  className={`p-5 rounded-2xl border space-y-4 ${
                    isDayMode
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-[#0c1220] border-[#6366f11f]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm font-extrabold flex items-center gap-2 ${
                        isDayMode ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      <span>📚</span>
                      <span>المواد الدراسية ({courses.length || 8})</span>
                    </h3>
                    <button
                      onClick={() => setActiveSection('subjects')}
                      className="text-xs text-indigo-400 hover:underline font-semibold"
                    >
                      جميع المواد ←
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {courses.slice(0, 8).map((course) => (
                      <div
                        key={course.id}
                        onClick={() => {
                          handleSelectCourse(course);
                          setActiveSection('lectures');
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition transform hover:-translate-y-0.5 ${
                          isDayMode
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            : 'bg-[#141c2e] hover:bg-[#1a243b] border-[#6366f11f]'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                            isDayMode ? 'bg-white shadow-xs' : 'bg-[#0c1220]'
                          }`}
                        >
                          {course.icon || '📖'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-bold text-xs truncate ${
                              isDayMode ? 'text-slate-900' : 'text-white'
                            }`}
                          >
                            {course.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            📂 {course.lectureCount} محاضرات • {course.instructor}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 2: SUBJECTS (موادي الدراسية)
          ========================================================================= */}
          {activeSection === 'subjects' && (
            <div className="space-y-6">
              {/* Filter & Search Bar */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isDayMode ? 'bg-white border-slate-200' : 'bg-[#0c1220] border-[#6366f11f]'
                }`}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ابحث عن مادة باسمها العربي أو كودها..."
                      value={searchSubject}
                      onChange={(e) => setSearchSubject(e.target.value)}
                      className={`w-full pr-9 pl-4 py-2 rounded-xl text-xs border outline-none ${
                        isDayMode
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                          : 'bg-[#141c2e] border-[#6366f11f] text-white focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="text-xs font-bold text-indigo-400">
                  {filteredCourses.length} مواد معتمدة في السداسي
                </div>
              </div>

              {/* Grid of Subject Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      handleSelectCourse(c);
                      setActiveSection('lectures');
                    }}
                    className={`p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                      isDayMode
                        ? 'bg-white border-slate-200 hover:border-indigo-300'
                        : 'bg-[#0c1220] border-[#6366f11f] hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                            isDayMode ? 'bg-indigo-50 text-indigo-600' : 'bg-[#141c2e]'
                          }`}
                        >
                          {c.icon || '📖'}
                        </div>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                          {c.code}
                        </span>
                      </div>

                      <div>
                        <h4
                          className={`font-black text-sm ${
                            isDayMode ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {c.name}
                        </h4>
                        <p
                          className={`text-xs mt-1 line-clamp-2 ${
                            isDayMode ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {c.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        معامل {c.coefficient} • رصيد {c.credits}
                      </span>
                      <span className="text-indigo-400 font-bold flex items-center gap-1">
                        استعراض المحاضرات ←
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 3: LECTURES (المحاضرات والملفات)
          ========================================================================= */}
          {activeSection === 'lectures' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lecture Selector List */}
              <div
                className={`p-5 rounded-2xl border space-y-4 lg:col-span-1 ${
                  isDayMode ? 'bg-white border-slate-200' : 'bg-[#0c1220] border-[#6366f11f]'
                }`}
              >
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                  <h3
                    className={`font-extrabold text-sm ${
                      isDayMode ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    قائمة مقاييسك ومحاضراتها
                  </h3>
                  <span className="text-xs text-indigo-400 font-bold">
                    {selectedCourse?.name || 'اختر مادة'}
                  </span>
                </div>

                <div className="space-y-2">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className={`w-full text-right p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                        selectedCourse?.id === course.id
                          ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-md'
                          : isDayMode
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                          : 'bg-[#141c2e] hover:bg-[#1a243b] border-[#6366f11f] text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{course.icon || '📖'}</span>
                        <span className="truncate">{course.name}</span>
                      </div>
                      <span className="text-[10px] opacity-75">{course.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lecture Details & Study Hub */}
              <div
                className={`p-6 rounded-2xl border space-y-5 lg:col-span-2 ${
                  isDayMode ? 'bg-white border-slate-200' : 'bg-[#0c1220] border-[#6366f11f]'
                }`}
              >
                {selectedLecture ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-mono font-bold text-indigo-400">
                          {selectedCourse?.code} • أسبوع {selectedLecture.week}
                        </span>
                        <h2
                          className={`text-base font-extrabold mt-1 ${
                            isDayMode ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {selectedLecture.title}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveSection('assistant');
                            handleAiSendMessage(
                              `قم بتلخيص المحاضرة: "${selectedLecture.title}" واشرح أهم النقاط الأساسية فيها.`
                            );
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>شرح بالمساعد الذكي</span>
                        </button>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                      <h4
                        className={`text-xs font-bold ${
                          isDayMode ? 'text-slate-700' : 'text-slate-300'
                        }`}
                      >
                        ملخص المحاضرة:
                      </h4>
                      <p
                        className={`text-xs leading-relaxed ${
                          isDayMode ? 'text-slate-600' : 'text-slate-300'
                        }`}
                      >
                        {selectedLecture.summary}
                      </p>
                    </div>

                    {/* Key Takeaways */}
                    {selectedLecture.keyTakeaways && selectedLecture.keyTakeaways.length > 0 && (
                      <div className="space-y-2">
                        <h4
                          className={`text-xs font-bold ${
                            isDayMode ? 'text-slate-700' : 'text-slate-300'
                          }`}
                        >
                          أهم المخرجات والمفاهيم الأساسية:
                        </h4>
                        <ul className="space-y-1.5">
                          {selectedLecture.keyTakeaways.map((item, i) => (
                            <li
                              key={i}
                              className={`text-xs flex items-start gap-2 ${
                                isDayMode ? 'text-slate-600' : 'text-slate-300'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Downloadable Resources */}
                    <div className="space-y-2">
                      <h4
                        className={`text-xs font-bold ${
                          isDayMode ? 'text-slate-700' : 'text-slate-300'
                        }`}
                      >
                        المرفقات وملفات المحاضرة:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedLecture.resources.map((res) => (
                          <div
                            key={res.id}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                              isDayMode
                                ? 'bg-slate-50 border-slate-200'
                                : 'bg-[#141c2e] border-[#6366f11f]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                              <span className="truncate">{res.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 mr-2 font-mono">
                              {res.size}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    يرجى اختيار مادة لعرض محاضراتها
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 4: ASSISTANT (المساعد الذكي)
          ========================================================================= */}
          {activeSection === 'assistant' && (
            <div
              className={`h-[calc(100vh-140px)] flex flex-col rounded-2xl border overflow-hidden ${
                isDayMode ? 'bg-white border-slate-200' : 'bg-[#0c1220] border-[#6366f11f]'
              }`}
            >
              {/* Chat Header */}
              <div
                className={`p-4 border-b flex items-center justify-between ${
                  isDayMode ? 'border-slate-200 bg-slate-50' : 'border-[#6366f11f] bg-[#090e1a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`text-sm font-black ${
                        isDayMode ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      رفيق الدراسة الذكي — StudyFlow AI
                    </h3>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      جاهز للإجابة وتلخيص المحاضرات
                    </p>
                  </div>
                </div>

                {/* Quick Prompts */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleAiSendMessage('اشرح لي طريقة حساب المسار الحرج CPM في إدارة المشاريع.')
                    }
                    className="text-[10px] px-2.5 py-1 rounded-full border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 transition"
                  >
                    شرح المسار الحرج CPM
                  </button>
                  <button
                    onClick={() =>
                      handleAiSendMessage('ما الفرق بين رأس المال العامل الصافي FRNG واحتياج رأس المال BFR؟')
                    }
                    className="text-[10px] px-2.5 py-1 rounded-full border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 transition"
                  >
                    التوازن المالي FRNG
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiChatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white shrink-0 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500'
                          : 'bg-[#141c2e] border border-indigo-500/30 text-indigo-400'
                      }`}
                    >
                      {msg.role === 'user' ? 'ف' : '🤖'}
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                          : isDayMode
                          ? 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                          : 'bg-[#141c2e] text-slate-100 rounded-bl-none border border-[#6366f11f]'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <span className="block text-[9px] opacity-60 text-left mt-1.5 font-mono">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex gap-2 items-center text-xs text-slate-400 py-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span>المساعد الذكي يحلل السؤال ويكتب الإجابة...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div
                className={`p-3 border-t flex items-center gap-2 ${
                  isDayMode ? 'border-slate-200 bg-slate-50' : 'border-[#6366f11f] bg-[#090e1a]'
                }`}
              >
                <input
                  type="text"
                  placeholder="اكتب سؤالك الأكاديمي أو اطلب شرح مفهوم..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSendMessage()}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-xs border outline-none ${
                    isDayMode
                      ? 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                      : 'bg-[#141c2e] border-[#6366f11f] text-white focus:border-indigo-500'
                  }`}
                />
                <button
                  onClick={() => handleAiSendMessage()}
                  disabled={!aiPrompt.trim() || aiLoading}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                >
                  <span>إرسال</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              SECTION 5: ANNOUNCEMENTS & COMMUNITY
          ========================================================================= */}
          {(activeSection === 'announcements' || activeSection === 'community') && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`p-5 rounded-2xl border space-y-3 transition ${
                    isDayMode ? 'bg-white border-slate-200' : 'bg-[#0c1220] border-[#6366f11f]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-indigo-500/20"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black text-xs ${
                              isDayMode ? 'text-slate-900' : 'text-white'
                            }`}
                          >
                            {post.authorName}
                          </span>
                          {post.isOfficial && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-sky-400" />
                              موثق
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">{post.authorBadge}</span>
                      </div>
                    </div>
                  </div>

                  <h3
                    className={`font-bold text-sm ${
                      isDayMode ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {post.title}
                  </h3>

                  <p
                    className={`text-xs leading-relaxed ${
                      isDayMode ? 'text-slate-600' : 'text-slate-300'
                    }`}
                  >
                    {post.content}
                  </p>

                  {post.attachments && post.attachments.length > 0 && (
                    <div className="pt-2">
                      {post.attachments.map((att, i) =>
                        att.type === 'image' ? (
                          <img
                            key={i}
                            src={att.url}
                            alt={att.name}
                            className="rounded-xl max-h-60 w-full object-cover border border-slate-800"
                          />
                        ) : (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                              isDayMode
                                ? 'bg-slate-50 border-slate-200'
                                : 'bg-[#141c2e] border-[#6366f11f]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-indigo-400" />
                              <span>{att.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{att.size}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-400">
                    <button className="flex items-center gap-1.5 hover:text-rose-400 transition">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes.length} إعجاب</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-indigo-400 transition">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments.length} تعليق</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
