import React, { useState, useEffect } from 'react';
import type {
  User,
  Course,
  Lecture,
  CommunityPost,
  AppNotification,
  PostCategory,
} from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { StudyFlowLogo } from '../StudyFlowLogo.tsx';
import { useI18n, Language } from '../../lib/i18n.ts';
import { offlineStorage, OfflineFlashcard, AiChatMessage } from '../../lib/offlineStorage.ts';
import { PWAInstallBanner } from '../common/PWAInstallBanner.tsx';
import { OfflineBanner } from '../common/OfflineBanner.tsx';
import { LoadingSkeleton, EmptyState, ErrorState } from '../common/StateViews.tsx';
import {
  Home,
  MessageSquare,
  BookOpen,
  Bell,
  User as UserIcon,
  Search,
  Plus,
  Heart,
  Bookmark,
  Sparkles,
  CheckCircle,
  FileText,
  Send,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Clock,
  Briefcase,
  Trophy,
  Filter,
  Sun,
  Moon,
  FolderOpen,
  Share2,
  Lock,
  Layers,
  ArrowRight,
  Download,
  RotateCcw,
  Check,
  Copy,
  Trash2,
  Globe,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface StudyFlowMobileAppProps {
  currentUser: User | null;
  isDayMode?: boolean;
  onOpenAuth: () => void;
  onRefreshData?: () => void;
  onToggleTheme?: () => void;
  lang?: Language;
  onSelectLanguage?: (lang: Language) => void;
  onSwitchUserRole?: (role: 'student' | 'admin') => void;
}

export type TabType = 'home' | 'study' | 'flashcards' | 'community' | 'ai' | 'notifications' | 'profile';

export const StudyFlowMobileApp: React.FC<StudyFlowMobileAppProps> = ({
  currentUser,
  isDayMode = false,
  onOpenAuth,
  onRefreshData,
  onToggleTheme,
  lang: propLang,
  onSelectLanguage,
  onSwitchUserRole,
}) => {
  const { lang, setLanguage, t, isRTL } = useI18n();
  const currentLang = propLang || lang;

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Spaced Repetition Flashcards State
  const [flashcards, setFlashcards] = useState<OfflineFlashcard[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [newCardSubject, setNewCardSubject] = useState('');
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');
  const [cardSaveMsg, setCardSaveMsg] = useState<string | null>(null);

  // Lecture Study & Notes State
  const [lectureNoteText, setLectureNoteText] = useState('');
  const [noteSavedToast, setNoteSavedToast] = useState(false);
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  // AI Assistant Chat State
  const [aiHistory, setAiHistory] = useState<AiChatMessage[]>([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Post Modal State
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<PostCategory>('discussion');
  const [postAttachmentUrl, setPostAttachmentUrl] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postError, setPostError] = useState<string | null>(null);

  // Comments State
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Initialize Local Storage data
  useEffect(() => {
    setFlashcards(offlineStorage.getFlashcards());
    setCompletedLectures(offlineStorage.getCompletedLectures());
    setAiHistory(offlineStorage.getAiHistory());
  }, []);

  // Fetch initial backend data
  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [postsRes, coursesRes] = await Promise.all([
        api.getPosts(selectedCategory, searchQuery),
        api.getCourses(currentUser?.specialtyId, currentUser?.levelId),
      ]);
      setPosts(postsRes.posts);
      setCourses(coursesRes.courses);

      if (currentUser) {
        const notifsRes = await api.getNotifications().catch(() => ({ notifications: [] }));
        setNotifications(notifsRes.notifications);
      }
    } catch (err: any) {
      console.warn('Network fetch error, operating in offline mode:', err);
      setFetchError(err.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, currentUser?.id]);

  // Load lectures when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      api
        .getLectures(selectedCourse.id)
        .then((res) => {
          setLectures(res.lectures);
          setSelectedLecture(res.lectures[0] || null);
        })
        .catch(() => {
          setLectures([]);
          setSelectedLecture(null);
        });
    } else {
      setLectures([]);
      setSelectedLecture(null);
    }
  }, [selectedCourse?.id]);

  // Load lecture notes when selected lecture changes
  useEffect(() => {
    if (selectedLecture) {
      setLectureNoteText(offlineStorage.getLectureNotes(selectedLecture.id));
    }
  }, [selectedLecture?.id]);

  // Handle Likes
  const handleLike = async (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      const res = await api.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: res.likes } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Bookmark
  const handleBookmark = async (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    try {
      const res = await api.bookmarkPost(postId);
      if (currentUser) {
        currentUser.savedPostIds = res.savedPostIds;
      }
      setPosts([...posts]);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Add Comment
  const handleAddComment = async (postId: string) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      const res = await api.addComment(postId, text);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: res.comments } : p))
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) {
      setPostError(currentLang === 'ar' ? 'يرجى إدخال العنوان والمحتوى.' : 'Please provide title and content.');
      return;
    }
    setPostError(null);

    const attachments = postAttachmentUrl.trim()
      ? [
          {
            type: (postAttachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? 'image' : 'file') as
              | 'image'
              | 'file',
            name: currentLang === 'ar' ? 'مرفق دراسي' : 'Study Attachment',
            url: postAttachmentUrl,
            size: '1.4 MB',
          },
        ]
      : [];

    const tags = postTags
      .split(/[\s,]+/)
      .map((t) => t.replace(/^#/, '').trim())
      .filter(Boolean);

    try {
      const res = await api.createPost({
        title: postTitle,
        content: postContent,
        category: postCategory,
        attachments,
        tags,
      });

      setPosts([res.post, ...posts]);
      setIsCreatePostOpen(false);
      setPostTitle('');
      setPostContent('');
      setPostAttachmentUrl('');
      setPostTags('');
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setPostError(err.message || t.common.error);
    }
  };

  // Handle Flashcard Spaced Repetition Rating
  const handleRateFlashcard = (rating: 'easy' | 'medium' | 'hard') => {
    const currentCard = filteredFlashcards[cardIndex];
    if (!currentCard) return;

    const updated = offlineStorage.rateFlashcard(currentCard.id, rating);
    setFlashcards(updated);
    setIsFlipped(false);
    if (cardIndex < filteredFlashcards.length - 1) {
      setCardIndex((prev) => prev + 1);
    } else {
      setCardIndex(0);
    }
  };

  // Handle Adding New Flashcard
  const handleAddNewFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardSubject.trim() || !newCardQuestion.trim() || !newCardAnswer.trim()) {
      setCardSaveMsg(currentLang === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required');
      return;
    }

    const created = offlineStorage.saveFlashcard({
      subject: newCardSubject.trim(),
      question: newCardQuestion.trim(),
      answer: newCardAnswer.trim(),
    });

    setFlashcards(offlineStorage.getFlashcards());
    setIsAddCardOpen(false);
    setNewCardSubject('');
    setNewCardQuestion('');
    setNewCardAnswer('');
    setCardSaveMsg(null);
    setCardIndex(0);
  };

  // Handle Lecture Notes Save
  const handleSaveLectureNotes = () => {
    if (!selectedLecture) return;
    offlineStorage.saveLectureNotes(selectedLecture.id, lectureNoteText);
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 2500);
  };

  // Handle Toggle Lecture Completion
  const handleToggleLectureCompleted = (lectureId: string) => {
    const { completedLectures: updated } = offlineStorage.toggleLectureCompleted(lectureId);
    setCompletedLectures(updated);
  };

  // Handle Ask AI Tutor
  const handleAskAi = async (questionText?: string) => {
    const query = questionText || aiQuestion;
    if (!query.trim() || aiLoading) return;

    setAiLoading(true);
    // Add user message to history
    const userMsg = offlineStorage.addAiMessage('user', query);
    setAiHistory((prev) => [...prev, userMsg]);
    setAiQuestion('');

    try {
      const res = await api.askAssistant(
        query,
        selectedCourse?.name || (currentLang === 'ar' ? 'العلوم الأكاديمية' : 'Academic Sciences'),
        selectedLecture?.title
      );

      const aiMsg = offlineStorage.addAiMessage('ai', res.answer, res.source);
      setAiHistory((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const fallbackMsg = offlineStorage.addAiMessage(
        'ai',
        currentLang === 'ar'
          ? 'المساعد الذكي يعمل حالياً في وضع المراجعة الأكاديمية دون اتصال. تم حفظ استفسارك لمراجعته.'
          : 'AI Tutor is currently operating with locally cached academic insights.'
      );
      setAiHistory((prev) => [...prev, fallbackMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  // Copy AI response
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Language switch handler
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (onSelectLanguage) onSelectLanguage(newLang);
  };

  // Filter flashcards by subject
  const availableSubjects = Array.from(new Set(flashcards.map((c) => c.subject)));
  const filteredFlashcards = selectedSubjectFilter === 'all'
    ? flashcards
    : flashcards.filter((c) => c.subject === selectedSubjectFilter);

  const currentFlashcard = filteredFlashcards[cardIndex] || filteredFlashcards[0];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Search filtered courses
  const filteredCourses = courses.filter((c) =>
    searchQuery
      ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div
      className={`w-full h-full flex flex-col font-sans select-none overflow-hidden transition-colors duration-200 ${
        isDayMode ? 'bg-[#f8fafc] text-slate-800' : 'bg-[#060a14] text-slate-100'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Offline Alert Banner */}
      <OfflineBanner />

      {/* PWA Install Banner at Top */}
      <PWAInstallBanner isDayMode={isDayMode} />

      {/* =========================================================================
          TOP MOBILE APP BAR (Branding + Language Toggle + Notifications + Profile)
      ========================================================================= */}
      <header
        className={`h-14 px-3.5 border-b flex items-center justify-between shrink-0 z-30 transition-colors duration-200 ${
          isDayMode
            ? 'bg-white border-slate-200 shadow-xs'
            : 'bg-[#0c1220] border-[#6366f11f]'
        }`}
      >
        {/* Brand Logo & Name */}
        <div
          onClick={() => {
            setActiveTab('home');
            setSelectedCourse(null);
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <StudyFlowLogo size="xs" isDayMode={isDayMode} />
          <div className="flex items-center gap-1" dir="ltr">
            <span
              className={`font-black text-sm tracking-tight ${
                isDayMode ? 'text-slate-900' : 'text-white'
              }`}
            >
              Study
            </span>
            <span className="font-black text-sm tracking-tight bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
              Flow
            </span>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            PWA
          </span>
        </div>

        {/* Action icons (Language, Theme, Notifications, Avatar) */}
        <div className="flex items-center gap-1.5">
          {/* Quick Language Selector Pill */}
          <div
            className={`flex items-center p-0.5 rounded-xl border text-[11px] font-bold ${
              isDayMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <button
              onClick={() => handleLanguageChange('ar')}
              className={`px-2 py-1 rounded-lg transition min-h-[36px] flex items-center ${
                currentLang === 'ar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => handleLanguageChange('fr')}
              className={`px-2 py-1 rounded-lg transition min-h-[36px] flex items-center ${
                currentLang === 'fr'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-1 rounded-lg transition min-h-[36px] flex items-center ${
                currentLang === 'en'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Switcher Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl transition min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isDayMode
                  ? 'text-amber-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-[#141c2e]'
              }`}
              title={isDayMode ? t.profile.nightMode : t.profile.dayMode}
            >
              {isDayMode ? (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              )}
            </button>
          )}

          {/* Notifications Button */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`p-2 rounded-xl relative transition min-h-[44px] min-w-[44px] flex items-center justify-center ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white'
                : isDayMode
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-400 hover:bg-[#141c2e]'
            }`}
            title={t.tabs.notifications}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0c1220]" />
            )}
          </button>

          {/* User Profile Avatar */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 text-white font-bold flex items-center justify-center text-xs shadow-xs min-h-[36px] min-w-[36px]"
              title={currentUser.name}
            >
              {currentUser.name.charAt(0)}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs min-h-[44px] flex items-center"
            >
              {t.profile.login}
            </button>
          )}
        </div>
      </header>

      {/* =========================================================================
          MAIN MOBILE SCROLLABLE CONTENT AREA
      ========================================================================= */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-3.5 space-y-4 pb-24">
        {/* Loading Skeleton */}
        {loading && posts.length === 0 && courses.length === 0 && (
          <LoadingSkeleton rows={3} isDayMode={isDayMode} />
        )}

        {/* Error State with Retry */}
        {fetchError && (
          <ErrorState
            message={fetchError}
            onRetry={fetchData}
            retryText={t.common.retry}
            isDayMode={isDayMode}
          />
        )}

        {/* -----------------------------------------------------------------------
            TAB 1: HOME (الرئيسية)
        ----------------------------------------------------------------------- */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Student Profile Overview Card */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDayMode
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-[#0c1220] border-[#6366f11f]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 text-white text-base font-black flex items-center justify-center shadow-md">
                    {currentUser?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2
                        className={`font-black text-sm ${
                          isDayMode ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {currentUser?.name || 'طالب StudyFlow'}
                      </h2>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {currentUser?.role === 'admin' ? t.profile.admin : t.profile.student}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        isDayMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      🎓 {currentUser?.levelName || 'السنة الجامعية الثالثة'}
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs text-indigo-500 font-extrabold block">
                    {new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'fr' ? 'fr-FR' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'fr' ? 'fr-FR' : 'en-US', {
                      weekday: 'long',
                    })}
                  </span>
                </div>
              </div>

              {/* Study Stats Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/20">
                <div
                  className={`p-2.5 rounded-xl border text-center ${
                    isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <span className="text-base font-black text-indigo-500 block leading-tight">
                    {completedLectures.length}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {t.home.completedLecturesCount}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border text-center ${
                    isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <span className="text-base font-black text-emerald-500 block leading-tight">
                    {flashcards.length}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {t.tabs.flashcards}
                  </span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border text-center ${
                    isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <span className="text-base font-black text-amber-500 block leading-tight">
                    7
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {t.home.studyStreak}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Feature 1: Spaced Repetition Callout Card */}
            <div
              onClick={() => setActiveTab('flashcards')}
              className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg cursor-pointer transform active:scale-98 transition flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold text-amber-200">
                    {t.home.todayFocus}
                  </span>
                </div>
                <h3 className="text-sm font-black">{t.home.startFlashcards}</h3>
                <p className="text-[11px] text-indigo-100">
                  {flashcards.length} {t.home.flashcardsReady}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </div>

            {/* Quick Feature 2: AI Academic Tutor Quick Access */}
            <div
              onClick={() => setActiveTab('ai')}
              className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-98 transition ${
                isDayMode
                  ? 'bg-gradient-to-r from-sky-50 to-indigo-50 border-indigo-200 text-indigo-950'
                  : 'bg-gradient-to-r from-slate-900 to-[#101b36] border-indigo-500/30 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black">{t.home.askAiPrompt}</h4>
                  <p className="text-[10px] text-slate-400">{t.home.askAiSub}</p>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </div>

            {/* Recent Courses Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>{t.home.recentCourses}</span>
                </h3>
                <button
                  onClick={() => setActiveTab('study')}
                  className="text-[11px] text-indigo-500 font-bold hover:underline"
                >
                  {t.home.viewAll}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {courses.slice(0, 3).map((course) => (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setActiveTab('study');
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer active:scale-98 transition flex items-center justify-between ${
                      isDayMode
                        ? 'bg-white border-slate-200 hover:border-indigo-300'
                        : 'bg-[#0c1220] border-[#6366f11f] hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs"
                        style={{ backgroundColor: course.color || '#4f46e5' }}
                      >
                        {course.code}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-tight">{course.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {course.lectureCount} {t.study.lectures} • {course.credits} Cr
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-500">
                        {course.progress || 65}%
                      </span>
                      {isRTL ? (
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Community Discussions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-cyan-500" />
                  <span>{t.home.latestDiscussions}</span>
                </h3>
                <button
                  onClick={() => setActiveTab('community')}
                  className="text-[11px] text-indigo-500 font-bold hover:underline"
                >
                  {t.home.viewAll}
                </button>
              </div>

              <div className="space-y-2">
                {posts.slice(0, 2).map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setActiveTab('community');
                      setExpandedCommentsPostId(post.id);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      isDayMode ? 'bg-white border-slate-200' : 'bg-[#0c1220] border-[#6366f11f]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-indigo-400">
                        {post.authorName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold line-clamp-1">{post.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {post.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 2: STUDY / COURSES (المقررات والمحاضرات)
        ----------------------------------------------------------------------- */}
        {activeTab === 'study' && (
          <div className="space-y-4">
            {/* Header + Search Bar */}
            <div className="flex items-center gap-2">
              <div
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
                  isDayMode
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-[#0c1220] border-[#6366f11f] text-white'
                }`}
              >
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.common.search}
                  className="bg-transparent border-none outline-hidden w-full text-xs min-h-[36px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Course Details View (If selectedCourse is active) */}
            {selectedCourse ? (
              <div className="space-y-3">
                {/* Back to courses list */}
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:underline min-h-[44px]"
                >
                  {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  <span>{t.common.back} {t.study.courses}</span>
                </button>

                {/* Selected Course Hero Banner */}
                <div
                  className="p-4 rounded-2xl text-white shadow-md space-y-2"
                  style={{
                    background: `linear-gradient(135deg, ${selectedCourse.color || '#4f46e5'}, #1e1b4b)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/20">
                      {selectedCourse.code}
                    </span>
                    <span className="text-xs font-semibold">
                      {selectedCourse.credits} Credits • Coeff {selectedCourse.coefficient}
                    </span>
                  </div>
                  <h2 className="text-base font-black">{selectedCourse.name}</h2>
                  <p className="text-xs text-white/80">{selectedCourse.description}</p>
                </div>

                {/* Lecture Selector Tabs */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-black text-slate-400 px-1">
                    {t.study.lectures} ({lectures.length})
                  </h3>

                  <div className="space-y-2">
                    {lectures.map((lec) => {
                      const isCompleted = completedLectures.includes(lec.id);
                      const isSelected = selectedLecture?.id === lec.id;

                      return (
                        <div
                          key={lec.id}
                          onClick={() => setSelectedLecture(lec)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                            isSelected
                              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                              : isDayMode
                              ? 'bg-white border-slate-200'
                              : 'bg-[#0c1220] border-[#6366f11f]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleLectureCompleted(lec.id);
                                }}
                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition min-h-[44px] min-w-[44px] ${
                                  isCompleted
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-500 text-transparent hover:border-indigo-500'
                                }`}
                                title={t.study.markAsCompleted}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>

                              <div>
                                <h4
                                  className={`text-xs font-bold ${
                                    isSelected
                                      ? 'text-indigo-500'
                                      : isDayMode
                                      ? 'text-slate-900'
                                      : 'text-white'
                                  }`}
                                >
                                  {lec.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {lec.durationMinutes || 45} min • {lec.chapters?.length || lec.resources?.length || 3} Chapters
                                </span>
                              </div>
                            </div>

                            {isCompleted && (
                              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                {t.study.completedBadge}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Lecture Full Study Pane */}
                {selectedLecture && (
                  <div
                    className={`p-4 rounded-2xl border space-y-4 mt-4 ${
                      isDayMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0c1220] border-[#6366f11f]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold text-indigo-500">
                          {selectedCourse.name}
                        </span>
                        <button
                          onClick={() => handleToggleLectureCompleted(selectedLecture.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:underline min-h-[44px]"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {completedLectures.includes(selectedLecture.id)
                              ? t.study.completedBadge
                              : t.study.markAsCompleted}
                          </span>
                        </button>
                      </div>
                      <h3 className="text-sm font-black">{selectedLecture.title}</h3>
                    </div>

                    {/* Summary */}
                    <div
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <h4 className="font-bold text-indigo-400 mb-1">{t.study.summary}</h4>
                      <p className="text-slate-300">{selectedLecture.summary}</p>
                    </div>

                    {/* Key Takeaways */}
                    {selectedLecture.keyTakeaways && selectedLecture.keyTakeaways.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{t.study.keyTakeaways}</span>
                        </h4>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {selectedLecture.keyTakeaways.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-indigo-500 font-bold">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Personal Notes Box (Persisted in localStorage) */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/40">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{t.study.personalNotes}</span>
                        </label>
                        {noteSavedToast && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>{t.study.notesSaved}</span>
                          </span>
                        )}
                      </div>

                      <textarea
                        value={lectureNoteText}
                        onChange={(e) => setLectureNoteText(e.target.value)}
                        placeholder={t.study.notesPlaceholder}
                        rows={3}
                        className={`w-full p-3 rounded-xl text-xs border outline-hidden resize-none ${
                          isDayMode
                            ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                            : 'bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500'
                        }`}
                      />

                      <div className="flex items-center justify-between">
                        <button
                          onClick={handleSaveLectureNotes}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm min-h-[44px] transition active:scale-95 cursor-pointer"
                        >
                          {t.study.saveNotes}
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('ai');
                            handleAskAi(
                              currentLang === 'ar'
                                ? `اشرح لي النقاط الصعبة في محاضرة: ${selectedLecture.title} من مقياس ${selectedCourse.name}`
                                : `Explain the key concepts of lecture: ${selectedLecture.title}`
                            );
                          }}
                          className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold hover:underline min-h-[44px]"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{t.home.askAiPrompt}</span>
                        </button>
                      </div>
                    </div>

                    {/* View Full Material Button */}
                    <button
                      onClick={() => setShowMaterialModal(true)}
                      className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold min-h-[44px] transition ${
                        isDayMode
                          ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Download className="w-4 h-4 text-indigo-400" />
                      <span>{t.study.downloadPdf}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* All Courses Grid */
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`p-4 rounded-2xl border cursor-pointer active:scale-98 transition ${
                        isDayMode
                          ? 'bg-white border-slate-200 hover:border-indigo-400 shadow-xs'
                          : 'bg-[#0c1220] border-[#6366f11f] hover:border-indigo-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs text-white shadow-md shrink-0"
                            style={{ backgroundColor: course.color || '#4f46e5' }}
                          >
                            {course.code}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold leading-tight">{course.name}</h3>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                              <span>📚 {course.lectureCount} {t.study.lectures}</span>
                              <span>•</span>
                              <span>👨‍🏫 {course.instructor}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-indigo-500 block">
                            {course.progress || 60}%
                          </span>
                        </div>
                      </div>

                      {/* Course Progress Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${course.progress || 60}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {filteredCourses.length === 0 && (
                  <EmptyState
                    title={t.common.empty}
                    description={t.study.noLecturesFound}
                    isDayMode={isDayMode}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 3: FLASHCARDS (البطاقات والتكرار المتباعد)
        ----------------------------------------------------------------------- */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{t.flashcards.title}</span>
                </h2>
                <p className="text-[10px] text-slate-400">{t.flashcards.subtitle}</p>
              </div>

              {/* Add New Card Button */}
              <button
                onClick={() => setIsAddCardOpen(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold min-h-[44px] shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.flashcards.addNew}</span>
              </button>
            </div>

            {/* Subject Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => {
                  setSelectedSubjectFilter('all');
                  setCardIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition min-h-[36px] ${
                  selectedSubjectFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDayMode
                    ? 'bg-white border border-slate-200 text-slate-600'
                    : 'bg-slate-900 border border-slate-800 text-slate-400'
                }`}
              >
                {t.community.categories.all} ({flashcards.length})
              </button>
              {availableSubjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSubjectFilter(sub);
                    setCardIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition min-h-[36px] ${
                    selectedSubjectFilter === sub
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDayMode
                      ? 'bg-white border border-slate-200 text-slate-600'
                      : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Interactive Flashcard 3D Card */}
            {currentFlashcard ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    {t.flashcards.cardOf} {cardIndex + 1} / {filteredFlashcards.length}
                  </span>
                  <span className="bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {currentFlashcard.subject}
                  </span>
                </div>

                {/* Flip Card Container */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`min-h-[220px] rounded-3xl p-6 border shadow-lg cursor-pointer flex flex-col justify-between transition-all duration-300 relative select-none active:scale-98 ${
                    isFlipped
                      ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/50'
                      : isDayMode
                      ? 'bg-white border-slate-200 shadow-md'
                      : 'bg-gradient-to-br from-slate-900 to-[#0c1220] border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                        {isFlipped ? t.flashcards.answer : t.flashcards.question}
                      </span>
                      <RotateCcw className="w-4 h-4 text-slate-500 animate-spin-hover" />
                    </div>

                    <h3 className="text-sm md:text-base font-bold leading-relaxed">
                      {isFlipped ? currentFlashcard.answer : currentFlashcard.question}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-slate-700/20 text-center">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {isFlipped
                        ? t.flashcards.rateHeading
                        : t.flashcards.clickToReveal}
                    </span>
                  </div>
                </div>

                {/* Leitner Spaced Repetition Rating Buttons */}
                {isFlipped && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleRateFlashcard('hard')}
                        className="py-3 px-2 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs min-h-[44px] transition active:scale-95 cursor-pointer"
                      >
                        {t.flashcards.hard}
                      </button>

                      <button
                        onClick={() => handleRateFlashcard('medium')}
                        className="py-3 px-2 rounded-2xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold text-xs min-h-[44px] transition active:scale-95 cursor-pointer"
                      >
                        {t.flashcards.medium}
                      </button>

                      <button
                        onClick={() => handleRateFlashcard('easy')}
                        className="py-3 px-2 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs min-h-[44px] transition active:scale-95 cursor-pointer"
                      >
                        {t.flashcards.easy}
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    disabled={cardIndex === 0}
                    onClick={() => {
                      setCardIndex((prev) => Math.max(0, prev - 1));
                      setIsFlipped(false);
                    }}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold min-h-[44px] ${
                      cardIndex === 0
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-indigo-400 hover:bg-indigo-500/10'
                    }`}
                  >
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    <span>{t.common.back}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (cardIndex < filteredFlashcards.length - 1) {
                        setCardIndex((prev) => prev + 1);
                      } else {
                        setCardIndex(0);
                      }
                      setIsFlipped(false);
                    }}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 min-h-[44px]"
                  >
                    <span>{cardIndex < filteredFlashcards.length - 1 ? t.common.submit : t.flashcards.restartReview}</span>
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState
                title={t.flashcards.noCards}
                description={t.flashcards.createFirstCard}
                actionText={t.flashcards.addNew}
                onAction={() => setIsAddCardOpen(true)}
                isDayMode={isDayMode}
              />
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 4: COMMUNITY (المجتمع والمناقشات)
        ----------------------------------------------------------------------- */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>{t.community.title}</span>
                </h2>
                <p className="text-[10px] text-slate-400">{t.community.subtitle}</p>
              </div>

              {/* New Post Button */}
              <button
                onClick={() => {
                  if (!currentUser) onOpenAuth();
                  else setIsCreatePostOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold min-h-[44px] shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.community.newPost}</span>
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {(['all', 'discussion', 'summary', 'question', 'exam_prep'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition min-h-[36px] ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isDayMode
                        ? 'bg-white border border-slate-200 text-slate-600'
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    {t.community.categories[cat]}
                  </button>
                )
              )}
            </div>

            {/* Posts Stream */}
            <div className="space-y-3">
              {posts.map((post) => {
                const isSaved = currentUser?.savedPostIds?.includes(post.id);
                const isExpanded = expandedCommentsPostId === post.id;

                return (
                  <div
                    key={post.id}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDayMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1220] border-[#6366f11f]'
                    }`}
                  >
                    {/* Author Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                          {post.authorName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold leading-none">
                              {post.authorName}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {post.authorRole === 'admin' ? t.profile.admin : t.profile.student}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded-md">
                        {t.community.categories[post.category as keyof typeof t.community.categories] || post.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-xs font-black leading-snug">{post.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1 whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* Attachments if any */}
                    {post.attachments && post.attachments.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {post.attachments.map((att, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                              isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                              <span className="truncate">{att.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {att.size}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Post Actions Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/40 text-xs">
                      <div className="flex items-center gap-4">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 transition min-h-[44px]"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              post.likes.length > 0 ? 'text-rose-500 fill-rose-500' : ''
                            }`}
                          />
                          <span>{post.likes.length}</span>
                        </button>

                        {/* Comment Toggle Button */}
                        <button
                          onClick={() =>
                            setExpandedCommentsPostId(isExpanded ? null : post.id)
                          }
                          className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition min-h-[44px]"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments?.length || 0}</span>
                        </button>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => handleBookmark(post.id)}
                        className={`p-2 rounded-lg transition min-h-[44px] ${
                          isSaved ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                        }`}
                        title={t.community.savePost}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Expanded Comments Section */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-800/40 space-y-2.5 animate-in fade-in duration-200">
                        <div className="space-y-2">
                          {post.comments?.map((comment) => (
                            <div
                              key={comment.id}
                              className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                                isDayMode
                                  ? 'bg-slate-50 border-slate-200'
                                  : 'bg-slate-950 border-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-indigo-400">
                                  {comment.authorName}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(comment.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-300">{comment.content}</p>
                            </div>
                          ))}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs({
                                ...commentInputs,
                                [post.id]: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            placeholder={t.community.writeComment}
                            className={`flex-1 px-3 py-2 rounded-xl text-xs border outline-hidden min-h-[44px] ${
                              isDayMode
                                ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
                                : 'bg-slate-900 border-slate-800 text-white focus:border-indigo-500'
                            }`}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold min-h-[44px] shadow-sm transition active:scale-95 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {posts.length === 0 && (
                <EmptyState
                  title={t.community.noPosts}
                  description={t.community.createFirstPost}
                  actionText={t.community.newPost}
                  onAction={() => {
                    if (!currentUser) onOpenAuth();
                    else setIsCreatePostOpen(true);
                  }}
                  isDayMode={isDayMode}
                />
              )}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 5: AI TUTOR (المساعد الأكاديمي الذكي)
        ----------------------------------------------------------------------- */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>{t.ai.title}</span>
                </h2>
                <p className="text-[10px] text-slate-400">{t.ai.subtitle}</p>
              </div>

              {aiHistory.length > 0 && (
                <button
                  onClick={() => {
                    offlineStorage.clearAiHistory();
                    setAiHistory([]);
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 min-h-[44px] px-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.ai.clearChat}</span>
                </button>
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold block px-1">
                {t.ai.suggestionsTitle}
              </span>
              <div className="flex flex-col gap-1.5">
                {[t.ai.suggestion1, t.ai.suggestion2, t.ai.suggestion3].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskAi(sug)}
                    className={`text-start px-3 py-2 rounded-xl text-xs font-medium border min-h-[44px] transition active:scale-98 ${
                      isDayMode
                        ? 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-indigo-500'
                    }`}
                  >
                    💬 {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Stream */}
            <div className="space-y-3 pt-2">
              {aiHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : isDayMode
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                        : 'bg-[#0c1220] border border-indigo-500/20 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="flex items-center justify-between border-b border-slate-700/20 pb-1.5 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-extrabold text-[10px] text-indigo-400">
                            StudyFlow AI ({msg.source || 'gemini-2.5-flash'})
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">{t.ai.copied}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{t.ai.copyAnswer}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className="text-[9px] opacity-60 block text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="flex items-start gap-2 text-xs text-indigo-400 animate-pulse p-3 rounded-2xl bg-slate-900/40 border border-slate-800">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{t.ai.thinking}</span>
                </div>
              )}

              {aiHistory.length === 0 && !aiLoading && (
                <EmptyState
                  title={t.ai.title}
                  description={t.ai.emptyHistory}
                  icon={<Sparkles className="w-7 h-7 text-cyan-400" />}
                  isDayMode={isDayMode}
                />
              )}
            </div>

            {/* Input Form at bottom */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskAi();
                  }}
                  placeholder={t.ai.inputPlaceholder}
                  className={`flex-1 px-3.5 py-3 rounded-2xl text-xs border outline-hidden min-h-[48px] ${
                    isDayMode
                      ? 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500 shadow-xs'
                      : 'bg-slate-900 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
                <button
                  disabled={!aiQuestion.trim() || aiLoading}
                  onClick={() => handleAskAi()}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold min-h-[48px] shadow-sm transition active:scale-95 flex items-center justify-center ${
                    !aiQuestion.trim() || aiLoading
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-2 px-2">
                {t.ai.disclaimer}
              </p>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 6: NOTIFICATIONS (الإشعارات)
        ----------------------------------------------------------------------- */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <span>{t.tabs.notifications}</span>
                </h2>
                <p className="text-[10px] text-slate-400">
                  {unreadCount} {t.tabs.notifications}
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    await api.markAllNotificationsRead();
                    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                  }}
                  className="text-xs text-indigo-400 font-bold hover:underline min-h-[44px]"
                >
                  {currentLang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all read'}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={async () => {
                    if (!notif.isRead) {
                      await api.markNotificationRead(notif.id);
                      setNotifications((prev) =>
                        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
                      );
                    }
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                    notif.isRead
                      ? isDayMode
                        ? 'bg-slate-50 border-slate-200 text-slate-600'
                        : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                      : isDayMode
                      ? 'bg-white border-indigo-200 text-slate-900 shadow-xs'
                      : 'bg-[#0c1220] border-indigo-500/30 text-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                          notif.isRead ? 'bg-slate-600' : 'bg-indigo-500 animate-pulse'
                        }`}
                      />
                      <div>
                        <h4 className="text-xs font-bold leading-snug">{notif.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">{notif.message}</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <EmptyState
                  title={t.common.empty}
                  description={currentLang === 'ar' ? 'لا توجد إشعارات حالياً' : 'No notifications'}
                  icon={<Bell className="w-7 h-7 text-indigo-400" />}
                  isDayMode={isDayMode}
                />
              )}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 7: PROFILE & SETTINGS (الملف الشخصي والإعدادات)
        ----------------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-sm font-black flex items-center gap-1.5">
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <span>{t.profile.title}</span>
            </h2>

            {/* Account Card */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDayMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1220] border-[#6366f11f]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 text-white text-lg font-black flex items-center justify-center shadow-md">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-black">{currentUser?.name || 'زائر'}</h3>
                  <p className="text-xs text-slate-400">{currentUser?.email || 'studyflow@app.dz'}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {currentUser?.role === 'admin' ? t.profile.admin : t.profile.student}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/40 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.profile.specialty}</span>
                  <span className="font-bold">{currentUser?.specialtyName || 'إدارة الأعمال'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t.profile.level}</span>
                  <span className="font-bold">{currentUser?.levelName || 'السنة الثالثة'}</span>
                </div>
              </div>
            </div>

            {/* App Preferences */}
            <div
              className={`p-4 rounded-2xl border space-y-4 ${
                isDayMode ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0c1220] border-[#6366f11f]'
              }`}
            >
              <h3 className="text-xs font-black text-slate-300">{t.profile.settings}</h3>

              {/* Language Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.profile.language}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleLanguageChange('ar')}
                    className={`py-2.5 rounded-xl text-xs font-bold border min-h-[44px] transition ${
                      currentLang === 'ar'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : isDayMode
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    العربية (RTL)
                  </button>
                  <button
                    onClick={() => handleLanguageChange('fr')}
                    className={`py-2.5 rounded-xl text-xs font-bold border min-h-[44px] transition ${
                      currentLang === 'fr'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : isDayMode
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    Français (LTR)
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`py-2.5 rounded-xl text-xs font-bold border min-h-[44px] transition ${
                      currentLang === 'en'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : isDayMode
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    English (LTR)
                  </button>
                </div>
              </div>

              {/* Theme Toggle */}
              {onToggleTheme && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    {isDayMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                    <span>{t.profile.theme}</span>
                  </span>
                  <button
                    onClick={onToggleTheme}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-xs font-bold border border-indigo-500/30 min-h-[44px]"
                  >
                    {isDayMode ? t.profile.nightMode : t.profile.dayMode}
                  </button>
                </div>
              )}

              {/* PWA & Offline Cache Status */}
              <div
                className={`p-3 rounded-xl border space-y-1 text-xs ${
                  isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.profile.pwaStatus}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {t.common.installed}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{t.profile.offlineCached}</p>
              </div>

              {/* Quick Role Switcher for Test */}
              {onSwitchUserRole && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {t.profile.switchRole}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSwitchUserRole('student')}
                      className={`py-2 rounded-xl text-xs font-bold border min-h-[44px] ${
                        currentUser?.role === 'student'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {t.profile.student}
                    </button>
                    <button
                      onClick={() => onSwitchUserRole('admin')}
                      className={`py-2 rounded-xl text-xs font-bold border min-h-[44px] ${
                        currentUser?.role === 'admin'
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {t.profile.admin}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout / Login Button */}
            {currentUser ? (
              <button
                onClick={() => {
                  api.logout();
                  window.location.reload();
                }}
                className="w-full py-3 rounded-2xl bg-rose-600/15 hover:bg-rose-600/25 text-rose-400 border border-rose-500/30 text-xs font-bold min-h-[44px] transition cursor-pointer"
              >
                {t.profile.logout}
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold min-h-[44px] shadow-sm transition cursor-pointer"
              >
                {t.profile.login}
              </button>
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          BOTTOM NATIVE-FEEL NAVIGATION BAR (Min 48px tap targets, Safe Area Padding)
      ========================================================================= */}
      <nav
        className={`h-16 px-2 border-t flex items-center justify-around shrink-0 z-30 transition-colors duration-200 pb-[env(safe-area-inset-bottom)] ${
          isDayMode
            ? 'bg-white border-slate-200 shadow-lg'
            : 'bg-[#0c1220] border-[#6366f11f]'
        }`}
      >
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition min-h-[48px] cursor-pointer ${
            activeTab === 'home'
              ? 'text-indigo-500 font-bold'
              : isDayMode
              ? 'text-slate-400 hover:text-slate-800'
              : 'text-slate-500 hover:text-slate-200'
          }`}
          aria-label={t.tabs.home}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] leading-none">{t.tabs.home}</span>
        </button>

        <button
          onClick={() => setActiveTab('study')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition min-h-[48px] cursor-pointer ${
            activeTab === 'study'
              ? 'text-indigo-500 font-bold'
              : isDayMode
              ? 'text-slate-400 hover:text-slate-800'
              : 'text-slate-500 hover:text-slate-200'
          }`}
          aria-label={t.tabs.study}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] leading-none">{t.tabs.study}</span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition min-h-[48px] cursor-pointer ${
            activeTab === 'flashcards'
              ? 'text-indigo-500 font-bold'
              : isDayMode
              ? 'text-slate-400 hover:text-slate-800'
              : 'text-slate-500 hover:text-slate-200'
          }`}
          aria-label={t.tabs.flashcards}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] leading-none">{t.tabs.flashcards}</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition min-h-[48px] cursor-pointer ${
            activeTab === 'community'
              ? 'text-indigo-500 font-bold'
              : isDayMode
              ? 'text-slate-400 hover:text-slate-800'
              : 'text-slate-500 hover:text-slate-200'
          }`}
          aria-label={t.tabs.community}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] leading-none">{t.tabs.community}</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition min-h-[48px] cursor-pointer ${
            activeTab === 'ai'
              ? 'text-indigo-500 font-bold'
              : isDayMode
              ? 'text-slate-400 hover:text-slate-800'
              : 'text-slate-500 hover:text-slate-200'
          }`}
          aria-label={t.tabs.ai}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <span className="text-[10px] leading-none">{t.tabs.ai}</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition min-h-[48px] cursor-pointer ${
            activeTab === 'profile'
              ? 'text-indigo-500 font-bold'
              : isDayMode
              ? 'text-slate-400 hover:text-slate-800'
              : 'text-slate-500 hover:text-slate-200'
          }`}
          aria-label={t.tabs.profile}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] leading-none">{t.tabs.profile}</span>
        </button>
      </nav>

      {/* =========================================================================
          MODAL 1: ADD FLASHCARD MODAL
      ========================================================================= */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border space-y-4 ${
              isDayMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t.flashcards.newCardTitle}</span>
              </h3>
              <button
                onClick={() => setIsAddCardOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewFlashcard} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  {t.flashcards.subjectLabel}
                </label>
                <input
                  type="text"
                  required
                  value={newCardSubject}
                  onChange={(e) => setNewCardSubject(e.target.value)}
                  placeholder="مثال: إدارة مالية"
                  className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-hidden min-h-[44px] ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  {t.flashcards.questionLabel}
                </label>
                <textarea
                  required
                  rows={2}
                  value={newCardQuestion}
                  onChange={(e) => setNewCardQuestion(e.target.value)}
                  placeholder="نص السؤال أو المفهوم..."
                  className={`w-full p-2.5 rounded-xl text-xs border outline-hidden resize-none ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  {t.flashcards.answerLabel}
                </label>
                <textarea
                  required
                  rows={3}
                  value={newCardAnswer}
                  onChange={(e) => setNewCardAnswer(e.target.value)}
                  placeholder="الإجابة النموذجية والشرح..."
                  className={`w-full p-2.5 rounded-xl text-xs border outline-hidden resize-none ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>

              {cardSaveMsg && (
                <p className="text-xs text-rose-400 font-semibold">{cardSaveMsg}</p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs min-h-[44px]"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs min-h-[44px] shadow-sm cursor-pointer"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: CREATE POST MODAL
      ========================================================================= */}
      {isCreatePostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto ${
              isDayMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>{t.community.newPost}</span>
              </h3>
              <button
                onClick={() => setIsCreatePostOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  {t.community.postTitle}
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="مثال: ملخص شامل لمقياس الإدارة المالية S5"
                  className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-hidden min-h-[44px] ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  {t.community.postCategory}
                </label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as PostCategory)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-hidden min-h-[44px] ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                >
                  <option value="discussion">{t.community.categories.discussion}</option>
                  <option value="summary">{t.community.categories.summary}</option>
                  <option value="question">{t.community.categories.question}</option>
                  <option value="exam_prep">{t.community.categories.exam_prep}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  {t.community.postContent}
                </label>
                <textarea
                  required
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="اكتب تفاصيل المحتوى أو الاستفسار بالتفصيل..."
                  className={`w-full p-2.5 rounded-xl text-xs border outline-hidden resize-none ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                      : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  {t.community.postAttachment}
                </label>
                <input
                  type="url"
                  value={postAttachmentUrl}
                  onChange={(e) => setPostAttachmentUrl(e.target.value)}
                  placeholder="https://example.com/file.pdf"
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-hidden min-h-[44px] ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  {t.community.postTags}
                </label>
                <input
                  type="text"
                  value={postTags}
                  onChange={(e) => setPostTags(e.target.value)}
                  placeholder={t.community.tagsPlaceholder}
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-hidden min-h-[44px] ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              {postError && (
                <p className="text-xs text-rose-400 font-semibold">{postError}</p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePostOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs min-h-[44px]"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs min-h-[44px] shadow-sm cursor-pointer"
                >
                  {t.community.publish}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: FULL LECTURE MATERIAL VIEWER
      ========================================================================= */}
      {showMaterialModal && selectedLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-3xl p-5 shadow-2xl border space-y-4 max-h-[85vh] overflow-y-auto ${
              isDayMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase">
                  {selectedCourse?.name}
                </span>
                <h3 className="text-sm font-black">{selectedLecture.title}</h3>
              </div>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="p-1.5 text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div
                className={`p-3 rounded-2xl border ${
                  isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <h4 className="font-bold text-indigo-400 mb-1">{t.study.summary}</h4>
                <p className="text-slate-300">{selectedLecture.summary}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200">{t.study.lectures} & Chapters:</h4>
                {selectedLecture.chapters && selectedLecture.chapters.length > 0 ? (
                  selectedLecture.chapters.map((chap) => (
                    <div
                      key={chap.id}
                      className={`p-3 rounded-xl border ${
                        isDayMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span>{chap.title}</span>
                        <span className="text-[10px] text-slate-500">{chap.duration}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{chap.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="space-y-1.5 text-slate-300">
                    {selectedLecture.resources?.map((r) => (
                      <div
                        key={r.id}
                        className="p-2.5 rounded-xl border border-slate-800 flex items-center justify-between"
                      >
                        <span className="text-xs">📄 {r.name}</span>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase">{r.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowMaterialModal(false)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold min-h-[44px] shadow-sm cursor-pointer"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
