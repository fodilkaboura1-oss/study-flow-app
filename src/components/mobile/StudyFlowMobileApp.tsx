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
  ShieldCheck,
  CheckCircle,
  FileText,
  Send,
  ChevronLeft,
  X,
  GraduationCap,
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
} from 'lucide-react';

interface StudyFlowMobileAppProps {
  currentUser: User | null;
  isDayMode?: boolean;
  onOpenAuth: () => void;
  onRefreshData?: () => void;
}

type TabType = 'home' | 'study' | 'community' | 'notifications' | 'profile';

export const StudyFlowMobileApp: React.FC<StudyFlowMobileAppProps> = ({
  currentUser,
  isDayMode = false,
  onOpenAuth,
  onRefreshData,
}) => {
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

  // Spaced Repetition in mobile
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const flashcards = [
    {
      q: 'ما هي المعادلة الجوهرية للتوازن المالي الوظيفي؟',
      a: 'الخزينة الصافية (TN) = رأس المال العامل الصافي الإجمالي (FRNG) - احتياج رأس المال العامل (BFR).',
      subject: 'إدارة مالية',
    },
    {
      q: 'ما هو المسار الحرج (Critical Path) في طريقة CPM؟',
      a: 'أطول مسار للأنشطة المتتالية يحدد الحد الأدنى من الوقت لإنجاز المشروع، وفائضه الزمني صفر.',
      subject: 'إدارة المشاريع',
    },
  ];

  // AI Assistant Chat State in Mobile
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

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

  // Fetch initial mobile data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, coursesRes] = await Promise.all([
        api.getPosts(selectedCategory, searchQuery),
        api.getCourses(currentUser?.specialtyId, currentUser?.levelId),
      ]);
      setPosts(postsRes.posts);
      setCourses(coursesRes.courses);

      if (currentUser) {
        const notifsRes = await api.getNotifications();
        setNotifications(notifsRes.notifications);
      }
    } catch (err) {
      console.error('Error fetching mobile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, currentUser?.id]);

  useEffect(() => {
    if (selectedCourse) {
      api.getLectures(selectedCourse.id).then((res) => {
        setLectures(res.lectures);
        setSelectedLecture(res.lectures[0] || null);
      });
    } else {
      setLectures([]);
      setSelectedLecture(null);
    }
  }, [selectedCourse?.id]);

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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!postTitle.trim() || !postContent.trim()) {
      setPostError('يرجى ملء العنوان والمحتوى.');
      return;
    }
    setPostError(null);

    const attachments = postAttachmentUrl.trim()
      ? [
          {
            type: (postAttachmentUrl.match(/\.(jpeg|jpg|gif|png)$/) ? 'image' : 'file') as
              | 'image'
              | 'file',
            name: 'مرفق المنشور',
            url: postAttachmentUrl,
            size: '1.2 MB',
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
      setPostError(err.message || 'فشل نشر المنشور.');
    }
  };

  const handleAskAiInMobile = async () => {
    if (!aiQuestion.trim() || aiLoading) return;
    setAiLoading(true);
    setAiAnswer(null);
    try {
      const res = await api.askAssistant(
        aiQuestion,
        selectedCourse?.name || 'إدارة الأعمال',
        selectedLecture?.title
      );
      setAiAnswer(res.answer);
    } catch (err) {
      setAiAnswer('عذراً، تعذر الحصول على الإجابة من المساعد الذكي.');
    } finally {
      setAiLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      className={`w-full h-full flex flex-col font-sans select-none overflow-hidden transition-colors duration-200 ${
        isDayMode ? 'bg-[#f5f7fb] text-slate-800' : 'bg-[#060a14] text-slate-100'
      }`}
      dir="rtl"
    >
      {/* =========================================================================
          TOP MOBILE APP BAR (Branding + Logo + Notifications + Avatar)
      ========================================================================= */}
      <header
        className={`h-13 px-3.5 border-b flex items-center justify-between shrink-0 z-20 transition-colors duration-200 ${
          isDayMode
            ? 'bg-white border-slate-200 shadow-xs'
            : 'bg-[#0c1220] border-[#6366f11f]'
        }`}
      >
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <StudyFlowLogo size="xs" isDayMode={isDayMode} />
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', direction: 'ltr' }} className="gap-1">
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
        </div>

        {/* Action icons (Notifications & User Avatar) */}
        <div className="flex items-center gap-2">
          {/* Notifications Button with unread badge */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`p-2 rounded-xl relative transition ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white'
                : isDayMode
                ? 'text-slate-600 hover:bg-slate-100'
                : 'text-slate-400 hover:bg-[#141c2e]'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0c1220]" />
            )}
          </button>

          {/* User Profile Avatar */}
          {currentUser ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 text-white font-bold flex items-center justify-center text-xs shadow-xs"
            >
              ف
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg shadow-xs"
            >
              دخول
            </button>
          )}
        </div>
      </header>

      {/* =========================================================================
          MAIN MOBILE SCROLLABLE CONTENT AREA
      ========================================================================= */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {/* -----------------------------------------------------------------------
            TAB 1: HOME (الرئيسية)
        ----------------------------------------------------------------------- */}
        {activeTab === 'home' && (
          <div className="p-3.5 space-y-4">
            {/* Student Profile Overview Card */}
            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isDayMode
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-[#0c1220] border-[#6366f11f]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 text-white text-sm font-black flex items-center justify-center shadow-md">
                    ف
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2
                        className={`font-black text-xs ${
                          isDayMode ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {currentUser?.name || 'فوديل كابورة'}
                      </h2>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {currentUser?.badge || 'مشرف'}
                      </span>
                    </div>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        isDayMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      🎓 {currentUser?.levelName || 'ليسانس / السنة الثالثة'}
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-[10px] text-indigo-500 font-extrabold block">
                    15 أكتوبر
                  </span>
                  <span className="text-[9px] text-slate-500 block">خميس</span>
                </div>
              </div>

              <div
                className={`p-2 rounded-xl text-[10px] font-semibold border truncate ${
                  isDayMode
                    ? 'bg-slate-50 text-indigo-900 border-slate-200'
                    : 'bg-[#141c2e] text-indigo-300 border-[#6366f11f]'
                }`}
              >
                🏛️ جامعة عبد الحميد بن باديس مستغانم — إدارة الأعمال
              </div>
            </div>

            {/* Quick Action Cards Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <button
                onClick={() => setActiveTab('study')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                  isDayMode
                    ? 'bg-white hover:bg-slate-50 border-slate-200'
                    : 'bg-[#0c1220] hover:bg-[#141c2e] border-[#6366f11f]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold">موادي (8)</span>
              </button>

              <button
                onClick={() => setShowFlashcards(!showFlashcards)}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                  isDayMode
                    ? 'bg-white hover:bg-slate-50 border-slate-200'
                    : 'bg-[#0c1220] hover:bg-[#141c2e] border-[#6366f11f]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold">تكرار ذكي</span>
              </button>

              <button
                onClick={() => setActiveTab('study')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                  isDayMode
                    ? 'bg-white hover:bg-slate-50 border-slate-200'
                    : 'bg-[#0c1220] hover:bg-[#141c2e] border-[#6366f11f]'
                }`}
              >
                <Clock className="w-4 h-4 text-sky-400" />
                <span className="text-[10px] font-bold">الجدول</span>
              </button>

              <button
                onClick={() => setActiveTab('community')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                  isDayMode
                    ? 'bg-white hover:bg-slate-50 border-slate-200'
                    : 'bg-[#0c1220] hover:bg-[#141c2e] border-[#6366f11f]'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-bold">المجتمع</span>
              </button>
            </div>

            {/* Spaced Repetition Mobile Flashcard */}
            {showFlashcards && (
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 ${
                  isDayMode
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                    : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold flex items-center gap-1">
                    <span>🧠</span>
                    <span>تكرار متباعد: {flashcards[cardIndex].subject}</span>
                  </span>
                  <button
                    onClick={() => setShowFlashcards(false)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs font-bold">{flashcards[cardIndex].q}</p>

                {showAnswer ? (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                      isDayMode ? 'bg-white text-slate-800' : 'bg-[#141c2e] text-emerald-300'
                    }`}
                  >
                    {flashcards[cardIndex].a}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="text-[10px] text-indigo-400 font-bold hover:underline"
                  >
                    🔍 كشف الإجابة
                  </button>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setCardIndex((prev) => (prev + 1) % flashcards.length);
                      setShowAnswer(false);
                    }}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold"
                  >
                    التالي ←
                  </button>
                </div>
              </div>
            )}

            {/* جدول اليوم (خميس) - Daily Schedule Section */}
            <div
              className={`p-3.5 rounded-2xl border space-y-3 ${
                isDayMode
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-[#0c1220] border-[#6366f11f]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xs font-black flex items-center gap-1.5 ${
                    isDayMode ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>جدول اليوم (خميس)</span>
                </h3>
                <span className="text-[10px] text-slate-400">مدرج 04</span>
              </div>

              <div className="space-y-2">
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-[#141c2e] border-[#6366f11f]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div
                      className={`font-bold text-xs ${
                        isDayMode ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      إدارة المشاريع
                    </div>
                    <div className="text-[10px] text-slate-400">
                      محاضرة • 👨‍🏫 أ/ قبايلي • 📍 مدرج 04
                    </div>
                  </div>
                  <div className="text-left font-mono font-bold text-xs text-indigo-400">
                    08:00 - 09:30
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-[#141c2e] border-[#6366f11f]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div
                      className={`font-bold text-xs ${
                        isDayMode ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      هياكل وتنظيم المؤسسة
                    </div>
                    <div className="text-[10px] text-slate-400">
                      محاضرة • 👨‍🏫 أ/ دحمان • 📍 مدرج 04
                    </div>
                  </div>
                  <div className="text-left font-mono font-bold text-xs text-indigo-400">
                    09:30 - 11:00
                  </div>
                </div>
              </div>
            </div>

            {/* المواد الدراسية - 8 StudyFlow Course Subjects */}
            <div
              className={`p-3.5 rounded-2xl border space-y-3 ${
                isDayMode
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-[#0c1220] border-[#6366f11f]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`text-xs font-black flex items-center gap-1.5 ${
                    isDayMode ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  <span>📚</span>
                  <span>المواد الدراسية ({courses.length || 8})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('study')}
                  className="text-[10px] text-indigo-400 font-bold hover:underline"
                >
                  عرض الكل ←
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {courses.slice(0, 8).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCourse(c);
                      setActiveTab('study');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                      isDayMode
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-[#141c2e] hover:bg-[#1a243b] border-[#6366f11f]'
                    }`}
                  >
                    <span className="text-base">{c.icon || '📖'}</span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-bold text-[11px] truncate ${
                          isDayMode ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {c.name}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {c.lectureCount} محاضرات
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Announcement Preview in Home */}
            {posts.find((p) => p.isOfficial) && (
              <div
                className={`p-3.5 rounded-2xl border space-y-2 ${
                  isDayMode
                    ? 'bg-sky-50/70 border-sky-200 text-slate-800'
                    : 'bg-sky-950/30 border-sky-500/30 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold flex items-center gap-1 text-sky-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    إعلان رسمي من إدارة الكلية
                  </span>
                  <button
                    onClick={() => setActiveTab('community')}
                    className="text-[10px] text-sky-400 hover:underline"
                  >
                    التفاصيل ←
                  </button>
                </div>
                <h4 className="text-xs font-black">{posts.find((p) => p.isOfficial)?.title}</h4>
                <p className="text-[10px] line-clamp-2 text-slate-400">
                  {posts.find((p) => p.isOfficial)?.content}
                </p>
              </div>
            )}
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 2: STUDY (الدراسة والمحاضرات والمساعد الذكي)
        ----------------------------------------------------------------------- */}
        {activeTab === 'study' && (
          <div className="p-3.5 space-y-4">
            {/* Subject Selector Carousel */}
            <div className="space-y-1.5">
              <span
                className={`text-[10px] font-bold block ${
                  isDayMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                اختر المادة لتصفح المحاضرات:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold shrink-0 flex items-center gap-1.5 transition ${
                      selectedCourse?.id === course.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : isDayMode
                        ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-[#141c2e] hover:bg-[#1a243b] border-[#6366f11f] text-slate-300'
                    }`}
                  >
                    <span>{course.icon || '📖'}</span>
                    <span>{course.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Course Header Banner */}
            {selectedCourse && (
              <div
                className={`p-3.5 rounded-2xl border space-y-2 ${
                  isDayMode
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-[#0c1220] border-[#6366f11f]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedCourse.icon || '📖'}</span>
                    <div>
                      <h3
                        className={`text-xs font-black ${
                          isDayMode ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {selectedCourse.name}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        كود: {selectedCourse.code} • معامل {selectedCourse.coefficient} • رصيد{' '}
                        {selectedCourse.credits}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
                    {selectedCourse.instructor}
                  </span>
                </div>
              </div>
            )}

            {/* Lectures List for this Course */}
            <div className="space-y-2">
              <h4
                className={`text-[11px] font-extrabold ${
                  isDayMode ? 'text-slate-800' : 'text-slate-200'
                }`}
              >
                المحاضرات وملخصات الدراسة:
              </h4>

              {lectures.length > 0 ? (
                lectures.map((lec) => (
                  <div
                    key={lec.id}
                    onClick={() => setSelectedLecture(lec)}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      selectedLecture?.id === lec.id
                        ? 'border-indigo-500 ring-1 ring-indigo-500'
                        : isDayMode
                        ? 'border-slate-200'
                        : 'border-[#6366f11f]'
                    } ${
                      isDayMode ? 'bg-white' : 'bg-[#0c1220]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">
                        أسبوع {lec.week}
                      </span>
                      <span className="text-[9px] text-slate-500">10 أكتوبر 2026</span>
                    </div>

                    <h5
                      className={`text-xs font-black mt-1 ${
                        isDayMode ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {lec.title}
                    </h5>

                    <p
                      className={`text-[10px] mt-1 line-clamp-2 leading-relaxed ${
                        isDayMode ? 'text-slate-600' : 'text-slate-300'
                      }`}
                    >
                      {lec.summary}
                    </p>

                    {/* Resources */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      {lec.resources.map((res) => (
                        <span
                          key={res.id}
                          className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#141c2e] text-slate-400 flex items-center gap-1"
                        >
                          <FileText className="w-2.5 h-2.5 text-indigo-400" />
                          {res.size}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  لا توجد محاضرات مدرجة حالياً لهذه المادة.
                </div>
              )}
            </div>

            {/* Smart AI Study Tutor Box */}
            <div
              className={`p-3.5 rounded-2xl border space-y-3 ${
                isDayMode
                  ? 'bg-gradient-to-br from-indigo-50 to-cyan-50/50 border-indigo-200'
                  : 'bg-[#090e1a] border-indigo-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4
                  className={`text-xs font-black ${
                    isDayMode ? 'text-indigo-950' : 'text-white'
                  }`}
                >
                  المساعد الذكي للمحاضرة
                </h4>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="اسأل المساعد الذكي عن هذا الدرس..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAiInMobile()}
                  className={`flex-1 px-3 py-1.5 rounded-xl text-xs border outline-none ${
                    isDayMode
                      ? 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                      : 'bg-[#141c2e] border-[#6366f11f] text-white focus:border-indigo-500'
                  }`}
                />
                <button
                  onClick={handleAskAiInMobile}
                  disabled={!aiQuestion.trim() || aiLoading}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
                >
                  اسأل
                </button>
              </div>

              {aiLoading && (
                <div className="text-[10px] text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>المساعد الذكي يستخرج الشرح...</span>
                </div>
              )}

              {aiAnswer && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed border ${
                    isDayMode
                      ? 'bg-white border-indigo-100 text-slate-800'
                      : 'bg-[#141c2e] border-indigo-500/20 text-slate-100'
                  }`}
                >
                  {aiAnswer}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 3: COMMUNITY (المجتمع والمنشورات الجامعية)
        ----------------------------------------------------------------------- */}
        {activeTab === 'community' && (
          <div className="p-3.5 space-y-3 pb-16">
            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'announcement', label: 'إعلانات رسمية' },
                { id: 'discussion', label: 'استفسارات' },
                { id: 'event', label: 'ملتقيات وفعاليات' },
                { id: 'internship', label: 'تربصات ومسابقات' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold shrink-0 transition ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : isDayMode
                      ? 'bg-white text-slate-600 border border-slate-200'
                      : 'bg-[#141c2e] text-slate-400 border border-[#6366f11f]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Posts Stream */}
            <div className="space-y-3">
              {posts.map((post) => {
                const isLiked = currentUser && post.likes.includes(currentUser.id);
                const isSaved = currentUser && currentUser.savedPostIds?.includes(post.id);
                const isCommentsOpen = expandedCommentsPostId === post.id;

                return (
                  <div
                    key={post.id}
                    className={`p-3.5 rounded-2xl border space-y-2.5 transition ${
                      isDayMode ? 'bg-white border-slate-200' : 'bg-[#0c1220] border-[#6366f11f]'
                    }`}
                  >
                    {/* Post Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-8 h-8 rounded-full object-cover border border-indigo-500/20"
                        />
                        <div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-black text-xs ${
                                isDayMode ? 'text-slate-900' : 'text-white'
                              }`}
                            >
                              {post.authorName}
                            </span>
                            {post.isOfficial && (
                              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 block">{post.authorBadge}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBookmark(post.id)}
                        className={`p-1.5 rounded-lg ${
                          isSaved ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <h4
                      className={`text-xs font-black ${
                        isDayMode ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {post.title}
                    </h4>

                    <p
                      className={`text-xs leading-relaxed ${
                        isDayMode ? 'text-slate-600' : 'text-slate-300'
                      }`}
                    >
                      {post.content}
                    </p>

                    {/* Attachments */}
                    {post.attachments && post.attachments.length > 0 && (
                      <div className="pt-1">
                        {post.attachments.map((att, i) =>
                          att.type === 'image' ? (
                            <img
                              key={i}
                              src={att.url}
                              alt={att.name}
                              className="rounded-xl max-h-48 w-full object-cover border border-slate-800"
                            />
                          ) : (
                            <div
                              key={i}
                              className={`p-2 rounded-xl border flex items-center justify-between text-[11px] ${
                                isDayMode
                                  ? 'bg-slate-50 border-slate-200'
                                  : 'bg-[#141c2e] border-[#6366f11f]'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="truncate">{att.name}</span>
                              </div>
                              <span className="text-[9px] text-slate-400">{att.size}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Post Actions (Like, Comment, Share) */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1 font-bold ${
                            isLiked ? 'text-rose-500' : 'hover:text-rose-400'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                          <span>{post.likes.length}</span>
                        </button>

                        <button
                          onClick={() =>
                            setExpandedCommentsPostId(isCommentsOpen ? null : post.id)
                          }
                          className="flex items-center gap-1 font-bold hover:text-indigo-400"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{post.comments.length}</span>
                        </button>
                      </div>

                      <span className="text-[9px] text-slate-500">15 أكتوبر</span>
                    </div>

                    {/* Expanded Comments Section */}
                    {isCommentsOpen && (
                      <div
                        className={`mt-2 p-2.5 rounded-xl border space-y-2 ${
                          isDayMode
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-[#141c2e]/70 border-[#6366f11f]'
                        }`}
                      >
                        {post.comments.map((c) => (
                          <div key={c.id} className="text-xs border-b pb-1.5 last:border-b-0">
                            <span className="font-bold text-[10px] text-indigo-400 block">
                              {c.authorName}
                            </span>
                            <span
                              className={isDayMode ? 'text-slate-700' : 'text-slate-300'}
                            >
                              {c.text || c.content}
                            </span>
                          </div>
                        ))}

                        <div className="flex gap-1.5 pt-1">
                          <input
                            type="text"
                            placeholder="اكتب تعليقك..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                            }
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            className={`flex-1 px-2.5 py-1 text-xs rounded-lg border outline-none ${
                              isDayMode
                                ? 'bg-white border-slate-200'
                                : 'bg-[#0c1220] border-[#6366f11f]'
                            }`}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                          >
                            إرسال
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Floating Action Button (New Post) */}
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="fixed bottom-20 left-6 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition z-30"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 4: NOTIFICATIONS (الإشعارات)
        ----------------------------------------------------------------------- */}
        {activeTab === 'notifications' && (
          <div className="p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <h3
                className={`text-xs font-black ${
                  isDayMode ? 'text-slate-900' : 'text-white'
                }`}
              >
                مركز الإشعارات ({notifications.length})
              </h3>
              <button
                onClick={async () => {
                  await api.markAllNotificationsAsRead();
                  setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
                }}
                className="text-[10px] text-indigo-400 font-bold hover:underline"
              >
                تحديد الكل كمقروء ✓
              </button>
            </div>

            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl border flex items-start gap-3 transition ${
                    !n.isRead
                      ? 'border-indigo-500/50 bg-indigo-950/20'
                      : isDayMode
                      ? 'bg-white border-slate-200'
                      : 'bg-[#0c1220] border-[#6366f11f]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-xs font-bold ${
                        isDayMode ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {n.title}
                    </h4>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        isDayMode ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      {n.message}
                    </p>
                    <span className="text-[9px] text-slate-500 block mt-1">15 أكتوبر</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 5: PROFILE (الملف الشخصي وإعدادات الحساب)
        ----------------------------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div className="p-3.5 space-y-4">
            {/* Student ID Card */}
            <div
              className={`p-4 rounded-2xl border text-center space-y-3 ${
                isDayMode
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-[#0c1220] border-[#6366f11f]'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-400 text-white text-2xl font-black flex items-center justify-center mx-auto shadow-lg">
                ف
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h3
                    className={`text-sm font-black ${
                      isDayMode ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {currentUser?.name || 'فوديل كابورة'}
                  </h3>
                  {currentUser?.verified && (
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <p
                  className={`text-[11px] mt-0.5 ${
                    isDayMode ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {currentUser?.email || 'fodilkaboura1@gmail.com'}
                </p>
                <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 mt-1">
                  {currentUser?.badge || 'مشرف'}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border text-[11px] leading-relaxed text-right ${
                  isDayMode
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-[#141c2e] border-[#6366f11f] text-slate-300'
                }`}
              >
                <div>🏛️ {currentUser?.specialtyName || 'إدارة الأعمال (علوم التسيير)'}</div>
                <div>🎓 {currentUser?.levelName || 'السنة الثالثة ليسانس'}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  جامعة عبد الحميد بن باديس مستغانم - كلية العلوم الاقتصادية وعلوم التسيير
                </div>
              </div>
            </div>

            {/* Academic Track & Settings */}
            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 text-xs ${
                isDayMode ? 'bg-white border-slate-200' : 'bg-[#0c1220] border-[#6366f11f]'
              }`}
            >
              <h4
                className={`font-black ${
                  isDayMode ? 'text-slate-900' : 'text-white'
                }`}
              >
                خيارات الحساب والتزامن
              </h4>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>المواد المعتمدة</span>
                <span className="font-bold text-indigo-400">{courses.length} مواد</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>حالة التزامن الفوري</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  متصل بالخادم
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span>المنشورات المحفوظة</span>
                <span className="font-bold text-slate-400">
                  {currentUser?.savedPostIds?.length || 0}
                </span>
              </div>
            </div>

            {/* Account Switch & Logout */}
            <button
              onClick={onOpenAuth}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
            >
              تبديل الحساب أو تسجيل الخروج
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          NEW POST MODAL
      ========================================================================= */}
      {isCreatePostOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-sm rounded-3xl border p-4 space-y-3 shadow-2xl ${
              isDayMode ? 'bg-white border-slate-200' : 'bg-[#0c1220] border-[#6366f11f]'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`font-black text-xs ${
                  isDayMode ? 'text-slate-900' : 'text-white'
                }`}
              >
                نشر مشاركة جديدة في المجتمع
              </h3>
              <button
                onClick={() => setIsCreatePostOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {postError && (
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px]">
                {postError}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">عنوان المشاركة:</label>
                <input
                  type="text"
                  placeholder="مثال: استفسار حول بحث إدارة المشاريع..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#141c2e] border-[#6366f11f] text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">المحتوى الأكاديمي:</label>
                <textarea
                  rows={3}
                  placeholder="اكتب رسالتك لزملائك الطلبة..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none resize-none ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#141c2e] border-[#6366f11f] text-white'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">التصنيف:</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as PostCategory)}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs border outline-none ${
                    isDayMode
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#141c2e] border-[#6366f11f] text-white'
                  }`}
                >
                  <option value="discussion">استفسارات ونقاش طلابي</option>
                  <option value="event">ملتقى أو فعالية طلابية</option>
                  <option value="internship">فرصة تربص وتكوين</option>
                  {currentUser?.role === 'admin' && (
                    <option value="announcement">إعلان رسمي موثق (إدارة الكلية فقط)</option>
                  )}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                نشر الآن
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOTTOM NAVIGATION BAR (5 Material 3 Mobile Tabs)
      ========================================================================= */}
      <nav
        className={`h-15 border-t px-2 flex items-center justify-around shrink-0 z-20 transition-colors duration-200 ${
          isDayMode
            ? 'bg-white border-slate-200 shadow-lg'
            : 'bg-[#0c1220] border-[#6366f11f]'
        }`}
      >
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            activeTab === 'home'
              ? 'text-indigo-500 font-bold'
              : isDayMode
              ? 'text-slate-400 hover:text-slate-700'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px]">الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveTab('study')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            activeTab === 'study'
              ? 'text-indigo-500 font-bold'
              : isDayMode
              ? 'text-slate-400 hover:text-slate-700'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[9px]">الدراسة</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            activeTab === 'community'
              ? 'text-indigo-500 font-bold'
              : isDayMode
              ? 'text-slate-400 hover:text-slate-700'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[9px]">المجتمع</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl relative transition ${
            activeTab === 'notifications'
              ? 'text-indigo-500 font-bold'
              : isDayMode
              ? 'text-slate-400 hover:text-slate-700'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
          )}
          <span className="text-[9px]">الإشعارات</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
            activeTab === 'profile'
              ? 'text-indigo-500 font-bold'
              : isDayMode
              ? 'text-slate-400 hover:text-slate-700'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span className="text-[9px]">حسابي</span>
        </button>
      </nav>
    </div>
  );
};
