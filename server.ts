import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { db } from './src/server/db.ts';
import type { User, CommunityPost, PostCategory, AppNotification } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to sanitize user object (remove hash & salt)
function sanitizeUser(user: any): User {
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser as User;
}

// Authentication Middleware
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'لم يتم توفير رمز المصادقة (Missing token)' });
  }

  const userId = db.tokens.get(token);
  if (!userId) {
    return res.status(403).json({ error: 'رمز المصادقة غير صالح أو منتهي الصلاحية' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  }

  (req as any).user = user;
  next();
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'يرجى تقديم البريد الإلكتروني وكلمة المرور' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'بيانات تسجيل الدخول غير صحيحة' });
  }

  const computedHash = crypto.createHmac('sha256', user.salt).update(password).digest('hex');
  if (computedHash !== user.passwordHash) {
    return res.status(401).json({ error: 'بيانات تسجيل الدخول غير صحيحة' });
  }

  const token = `sf_tok_${crypto.randomBytes(16).toString('hex')}`;
  db.tokens.set(token, user.id);

  return res.json({
    token,
    user: sanitizeUser(user),
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, specialtyId, levelId } = req.body;
  if (!name || !email || !password || !specialtyId || !levelId) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة للتسجيل' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'البريد الإلكتروني مسجل مسبقاً' });
  }

  const specialty = db.specialties.find(s => s.id === specialtyId);
  const level = db.levels.find(l => l.id === levelId);

  const salt = crypto.randomBytes(8).toString('hex');
  const passwordHash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  const newUserId = `user-${Date.now()}`;

  const newUser = {
    id: newUserId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    role: 'student' as const,
    specialtyId,
    specialtyName: specialty ? specialty.name : 'تخصص عام',
    levelId,
    levelName: level ? level.name : 'مستوى عام',
    bio: 'طالب في منصة StudyFlow AI',
    verified: false,
    badge: 'طالب جديد',
    privacySettings: {
      showEmail: true,
      showSpecialty: true,
      allowDirectMessages: true,
    },
    followingIds: ['user-admin'],
    savedPostIds: [],
    salt,
    passwordHash,
  };

  db.users.push(newUser);
  const token = `sf_tok_${crypto.randomBytes(16).toString('hex')}`;
  db.tokens.set(token, newUserId);

  // Send a welcome notification
  db.notifications.push({
    id: `notif-${Date.now()}`,
    userId: newUserId,
    title: 'مرحباً بك في StudyFlow AI!',
    message: 'تم تفعيل حسابك بنجاح. يمكنك الآن تصفح موادك الدراسية والتفاعل مع المجتمع الجامعي.',
    type: 'official_announcement',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({
    token,
    user: sanitizeUser(newUser),
  });
});

app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ user: sanitizeUser(user) });
});

app.put('/api/auth/update-profile', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { name, bio, avatar, privacySettings } = req.body;

  if (name) user.name = name.trim();
  if (bio !== undefined) user.bio = bio.trim();
  if (avatar) user.avatar = avatar;
  if (privacySettings) user.privacySettings = { ...user.privacySettings, ...privacySettings };

  res.json({ user: sanitizeUser(user) });
});

// ==========================================
// ACADEMIC SYSTEM ROUTES (SHARED WEB & MOBILE)
// ==========================================

app.get('/api/academic/specialties', (_req: Request, res: Response) => {
  res.json({ specialties: db.specialties });
});

app.get('/api/academic/levels', (_req: Request, res: Response) => {
  res.json({ levels: db.levels });
});

app.get('/api/academic/courses', (req: Request, res: Response) => {
  const { specialtyId, levelId } = req.query;
  let courses = db.courses;

  if (specialtyId && typeof specialtyId === 'string') {
    courses = courses.filter(c => c.specialtyId === specialtyId);
  }
  if (levelId && typeof levelId === 'string') {
    courses = courses.filter(c => c.levelId === levelId);
  }

  res.json({ courses });
});

app.get('/api/academic/lectures', (req: Request, res: Response) => {
  const { courseId } = req.query;
  let lectures = db.lectures;

  if (courseId && typeof courseId === 'string') {
    // Strictly filter to ensure no lecture mixing between courses
    lectures = lectures.filter(l => l.courseId === courseId);
  }

  res.json({ lectures });
});

app.get('/api/academic/lectures/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const lecture = db.lectures.find(l => l.id === id);
  if (!lecture) {
    return res.status(404).json({ error: 'المحاضرة غير موجودة' });
  }
  res.json({ lecture });
});

// ==========================================
// CAMPUS COMMUNITY & OFFICIAL NEWS ROUTES
// ==========================================

app.get('/api/community/posts', (req: Request, res: Response) => {
  const { category, search, tag } = req.query;
  let results = [...db.posts];

  if (category && category !== 'all' && typeof category === 'string') {
    results = results.filter(p => p.category === category);
  }

  if (tag && typeof tag === 'string') {
    results = results.filter(p => p.tags.includes(tag));
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    results = results.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ posts: results });
});

app.post('/api/community/posts', authenticateToken, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { title, content, category, attachments, tags } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ error: 'عنوان المنشور ومحتواه وتصنيفه مطلوبة' });
  }

  // Security check: Only verified admin can publish official announcements
  const isAnnouncement = category === 'announcement';
  if (isAnnouncement && (user.role !== 'admin' || !user.verified)) {
    return res.status(403).json({
      error: 'فقط الحسابات الإدارية الرسمية والموثقة مخولة بنشر الإعلانات الجامعية الرسمية.',
    });
  }

  const isOfficial = user.role === 'admin' && user.verified;

  const newPost: CommunityPost = {
    id: `post-${Date.now()}`,
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    authorRole: user.role,
    isOfficial,
    authorBadge: isOfficial ? (user.badge || 'إدارة الكلية الرسمية (موثق)') : user.badge,
    category: category as PostCategory,
    title: title.trim(),
    content: content.trim(),
    attachments: Array.isArray(attachments) ? attachments : [],
    likes: [],
    comments: [],
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
  };

  db.posts.unshift(newPost);

  // If official announcement, notify all active students!
  if (isOfficial) {
    db.users
      .filter(u => u.role === 'student')
      .forEach(student => {
        db.notifications.unshift({
          id: `notif-ann-${Date.now()}-${student.id}`,
          userId: student.id,
          title: '📢 إعلان رسمي جديد من إدارة الكلية',
          message: title.trim(),
          type: 'official_announcement',
          targetId: newPost.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      });
  }

  res.status(201).json({ post: newPost });
});

app.post('/api/community/posts/:id/like', authenticateToken, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { id } = req.params;
  const post = db.posts.find(p => p.id === id);

  if (!post) {
    return res.status(404).json({ error: 'المنشور غير موجود' });
  }

  const index = post.likes.indexOf(user.id);
  if (index >= 0) {
    post.likes.splice(index, 1);
  } else {
    post.likes.push(user.id);
    // Notify author if not self
    if (post.authorId !== user.id) {
      db.notifications.unshift({
        id: `notif-like-${Date.now()}`,
        userId: post.authorId,
        title: 'إعجاب جديد بمنشورك',
        message: `أعجب ${user.name} بمنشورك "${post.title.substring(0, 30)}..."`,
        type: 'like',
        targetId: post.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  res.json({ likes: post.likes, hasLiked: post.likes.includes(user.id) });
});

app.post('/api/community/posts/:id/comment', authenticateToken, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { id } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'نص التعليق لا يمكن أن يكون فارغاً' });
  }

  const post = db.posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'المنشور غير موجود' });
  }

  const newComment = {
    id: `comm-${Date.now()}`,
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    authorRole: user.role,
    authorBadge: user.badge,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  post.comments.push(newComment);

  // Notify author if not commenting on own post
  if (post.authorId !== user.id) {
    db.notifications.unshift({
      id: `notif-comm-${Date.now()}`,
      userId: post.authorId,
      title: 'تعليق جديد على منشورك',
      message: `علّق ${user.name}: "${text.trim().substring(0, 35)}..."`,
      type: 'comment',
      targetId: post.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  res.status(201).json({ comment: newComment, comments: post.comments });
});

app.post('/api/community/posts/:id/bookmark', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  if (!user.savedPostIds) user.savedPostIds = [];
  const index = user.savedPostIds.indexOf(id);

  if (index >= 0) {
    user.savedPostIds.splice(index, 1);
  } else {
    user.savedPostIds.push(id);
  }

  res.json({ savedPostIds: user.savedPostIds, isSaved: user.savedPostIds.includes(id) });
});

app.delete('/api/community/posts/:id', authenticateToken, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { id } = req.params;

  const index = db.posts.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'المنشور غير موجود' });
  }

  const post = db.posts[index];
  // Only author or admin can delete
  if (post.authorId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'غير مصرح لك بحذف هذا المنشور' });
  }

  db.posts.splice(index, 1);
  res.json({ success: true, message: 'تم حذف المنشور بنجاح' });
});

// ==========================================
// NOTIFICATIONS
// ==========================================

app.get('/api/notifications', authenticateToken, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const userNotifs = db.notifications.filter(n => n.userId === user.id);
  res.json({ notifications: userNotifs });
});

app.put('/api/notifications/:id/read', authenticateToken, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { id } = req.params;
  const notif = db.notifications.find(n => n.id === id && n.userId === user.id);

  if (notif) {
    notif.isRead = true;
  }
  res.json({ success: true });
});

app.post('/api/notifications/mark-all-read', authenticateToken, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  db.notifications.forEach(n => {
    if (n.userId === user.id) n.isRead = true;
  });
  res.json({ success: true });
});

// ==========================================
// AI STUDY ASSISTANT (GEMINI POWERED)
// ==========================================

app.post('/api/ai/study-assistant', authenticateToken, async (req: Request, res: Response) => {
  const { lectureId, question, courseName } = req.body;
  const lecture = lectureId ? db.lectures.find(l => l.id === lectureId) : null;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `أنت المساعد الذكي الأكاديمي لمنصة StudyFlow AI الجامعية.
السياق الأكاديمي:
- المقياس / المادة: ${courseName || (lecture ? lecture.courseName : 'مقياس جامعي')}
- عنوان المحاضرة: ${lecture ? lecture.title : 'محاضرة عامة'}
- ملخص المحاضرة الحالي: ${lecture ? lecture.summary : ''}
- النقاط الأساسية: ${lecture ? lecture.keyTakeaways.join('، ') : ''}

سؤال أو طلب الطالب:
"${question}"

المطلوب:
قدم إجابة أكاديمية واضحة، دقيقة، مشجعة، وباللغة العربية الفصحى الأكاديمية (مع المصطلحات التقنية بالإنجليزية بين قوسين). قسّم الإجابة إلى:
1. الشرح المبسط والمباشر
2. نقاط التركيز للاختبار والامتحان
3. سؤال تفاعلي مقترح لاختبار الفهم الذاتي مع الحل.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return res.json({
        answer: response.text,
        source: 'gemini-2.5-flash',
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, providing structured academic fallback:', err?.message);
    }
  }

  // Fallback Academic Study Analysis
  const fallbackAnswer = `### 🎓 إجابة المساعد الذكي StudyFlow AI:
  
**بخصوص سؤالك حول (${lecture ? lecture.title : courseName || 'المحتوى الأكاديمي'}):**

1. **المفهوم الجوهري:**
   الموضوع يركز بشكل أساسي على المبادئ النظرية وتطبيقاتها العملية. في الامتحانات الجامعية، يركز الأساتذة عادة على المقارنة بين الحلول البديلة وفهم الفروقات الجوهرية (Trade-offs).

2. **النقاط الرئيسية التي يجب مراجعتها:**
   ${lecture ? lecture.keyTakeaways.map((k, i) => `• ${k}`).join('\n   ') : '• مراجعة التعريفات الأساسية\n• حل التمارين التوضيحية في الأعمال الموجهة TD'}

3. **سؤال تدريبي مقترح لاختبار نفسك:**
   - **السؤال:** ${lecture?.aiStudyQuestions?.[0]?.question || 'ما هي الميزة الأساسية لهذا الأسلوب مقارنة بالطرق التقليدية؟'}
   - **الإجابة النموذجية:** ${lecture?.aiStudyQuestions?.[0]?.answer || 'الكفاءة الحسابية وتقليل نسبة الخطأ في المعالجة.'}

💡 *نصيحة دراسية: راجع شرائح العرض المرفقة وحاول تلخيص المفهوم بأسلوبك الخاص.*`;

  return res.json({
    answer: fallbackAnswer,
    source: 'studyflow-academic-engine',
  });
});

// ==========================================
// STANDALONE ANDROID APP INFO & APIS
// ==========================================

app.get('/api/export/android-project-info', (_req: Request, res: Response) => {
  res.json({
    appName: 'StudyFlow',
    appId: 'dz.studyflow.app',
    platform: 'Android Native (Jetpack Compose / Kotlin)',
    targetSdk: 34,
    minSdk: 26,
    backendApiUrl: process.env.APP_URL ? `${process.env.APP_URL}/api` : 'http://10.0.2.2:3000/api',
    endpoints: [
      { path: '/api/auth/login', method: 'POST', description: 'مصادقة موحدة لحساب الطالب والإدارة' },
      { path: '/api/academic/courses', method: 'GET', description: 'جلب المواد حسب تخصص ومستوى الطالب' },
      { path: '/api/academic/lectures', method: 'GET', description: 'جلب محاضرات المادة المختارة بدون اختلاط' },
      { path: '/api/community/posts', method: 'GET', description: 'جلب الأخبار الرسمية ومنشورات الطلاب والتربصات' },
      { path: '/api/community/posts', method: 'POST', description: 'نشر منشور جديد (محمي بصلاحيات الإدارة)' },
      { path: '/api/community/posts/:id/like', method: 'POST', description: 'الإعجاب والتفاعل' },
      { path: '/api/notifications', method: 'GET', description: 'إشعارات الإعلانات والمحاضرات والتفاعلات' },
      { path: '/api/ai/study-assistant', method: 'POST', description: 'المساعد الذكي للدراسة والملخصات' },
    ],
    projectDirectory: '/android',
    buildInstructions: {
      step1: 'افتح مجلد /android في برنامج Android Studio.',
      step2: 'قم بتعديل BASE_URL في dz/studyflow/app/network/StudyFlowApiService.kt ليشير إلى عنوان الخادم.',
      step3: 'نفذ الأمر ./gradlew assembleRelease أو Build > Build Bundle(s) / APK(s) > Build APK(s).',
      step4: 'ستجد ملف الـ APK النهائي في: android/app/build/outputs/apk/release/app-release-unsigned.apk',
    },
  });
});

// ==========================================
// VITE DEV SERVER / STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyFlow AI server running on http://0.0.0.0:${PORT}`);
  });
}

// Export app for Vercel Serverless Functions
export { app };
export default app;

// Only start the standalone HTTP listener when not running on Vercel Serverless
if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}
