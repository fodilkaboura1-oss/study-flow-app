export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  specialtyId: string;
  specialtyName: string;
  levelId: string;
  levelName: string;
  bio: string;
  verified: boolean;
  badge?: string; // e.g., 'إدارة الكلية الرسمية' or 'ممثل الدفعة'
  privacySettings?: {
    showEmail: boolean;
    showSpecialty: boolean;
    allowDirectMessages: boolean;
  };
  followingIds?: string[];
  savedPostIds?: string[];
}

export interface Specialty {
  id: string;
  name: string;
  code: string;
  faculty: string;
  icon: string;
  description: string;
}

export interface AcademicLevel {
  id: string;
  name: string;
  code: string;
  year: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  specialtyId: string;
  levelId: string;
  semester: 'S1' | 'S2';
  credits: number;
  coefficient: number;
  instructor: string;
  description: string;
  icon: string;
  lectureCount: number;
}

export interface LectureResource {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'video' | 'link';
  url: string;
  size?: string;
}

export interface AIStudyQuestion {
  question: string;
  answer: string;
}

export interface Lecture {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  week: number;
  summary: string;
  keyTakeaways: string[];
  slidesUrl?: string;
  resources: LectureResource[];
  aiStudyQuestions: AIStudyQuestion[];
  createdAt: string;
}

export type PostCategory =
  | 'announcement' // إعلانات رسمية
  | 'news'         // أخبار الكلية
  | 'event'        // فعاليات وملتقيات
  | 'internship'   // فرص تربص وتكوين
  | 'competition'  // مسابقات وهاكاثونات
  | 'discussion';  // نقاشات طلابية

export interface PostAttachment {
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: string;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  authorBadge?: string;
  text: string;
  content?: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  isOfficial: boolean;
  authorBadge?: string;
  category: PostCategory;
  title: string;
  content: string;
  attachments: PostAttachment[];
  likes: string[]; // user IDs
  comments: PostComment[];
  tags: string[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'official_announcement' | 'new_lecture' | 'comment' | 'like' | 'internship';
  targetId?: string;
  isRead: boolean;
  createdAt: string;
}
