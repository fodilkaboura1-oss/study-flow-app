import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterLecturesByCourse,
  filterCoursesByStudent,
  canPublishOfficialAnnouncement,
  hasUserLikedPost,
  togglePostLike,
  filterPostsByCategory,
  searchPosts,
} from './academic-logic.ts';
import type { Course, Lecture, CommunityPost, User } from '../types/index.ts';

test('filterLecturesByCourse isolates lectures without leaking across courses', () => {
  const dummyLectures: Lecture[] = [
    {
      id: 'lec-1',
      courseId: 'course-ai',
      courseName: 'ذكاء اصطناعي',
      title: 'مقدمة في الشبكات العصبية',
      week: 1,
      summary: 'مقدمة شاملة',
      keyTakeaways: ['perceptron', 'mlp'],
      resources: [],
      aiStudyQuestions: [],
      createdAt: '2026-10-01',
    },
    {
      id: 'lec-2',
      courseId: 'course-db',
      courseName: 'قواعد البيانات المتقدمة',
      title: 'الفهرسة والاستعلامات',
      week: 1,
      summary: 'مفاهيم B-Tree',
      keyTakeaways: ['b-tree', 'indexing'],
      resources: [],
      aiStudyQuestions: [],
      createdAt: '2026-10-02',
    },
    {
      id: 'lec-3',
      courseId: 'course-ai',
      courseName: 'ذكاء اصطناعي',
      title: 'دوال التنشيط والتدريب',
      week: 2,
      summary: 'تفاصيل backprop',
      keyTakeaways: ['relu', 'sgd'],
      resources: [],
      aiStudyQuestions: [],
      createdAt: '2026-10-08',
    },
  ];

  const aiLectures = filterLecturesByCourse(dummyLectures, 'course-ai');
  assert.equal(aiLectures.length, 2);
  assert.ok(aiLectures.every(l => l.courseId === 'course-ai'));

  const dbLectures = filterLecturesByCourse(dummyLectures, 'course-db');
  assert.equal(dbLectures.length, 1);
  assert.equal(dbLectures[0].title, 'الفهرسة والاستعلامات');

  const emptyLectures = filterLecturesByCourse(dummyLectures, 'non-existent');
  assert.equal(emptyLectures.length, 0);
});

test('filterCoursesByStudent returns courses matching student specialty and level', () => {
  const courses: Course[] = [
    {
      id: 'c1',
      code: 'CS-301',
      name: 'معمارية الحاسوب',
      specialtyId: 'spec-cs',
      levelId: 'lvl-l3',
      semester: 'S1',
      credits: 4,
      coefficient: 2,
      instructor: 'د. عماري',
      description: 'معمارية الحاسوب',
      icon: 'Cpu',
      lectureCount: 12,
    },
    {
      id: 'c2',
      code: 'AI-401',
      name: 'التعلم العميق المتقدم',
      specialtyId: 'spec-ai',
      levelId: 'lvl-m1',
      semester: 'S1',
      credits: 6,
      coefficient: 3,
      instructor: 'أ.د. منصوري',
      description: 'شبكات عصبية عميقة',
      icon: 'Brain',
      lectureCount: 14,
    },
  ];

  const m1AiCourses = filterCoursesByStudent(courses, 'spec-ai', 'lvl-m1');
  assert.equal(m1AiCourses.length, 1);
  assert.equal(m1AiCourses[0].id, 'c2');
});

test('canPublishOfficialAnnouncement strictly restricts official publishing to verified admins', () => {
  const studentUser: User = {
    id: 'u1',
    name: 'أحمد طالب',
    email: 'student@example.com',
    avatar: '',
    role: 'student',
    specialtyId: 'spec-ai',
    specialtyName: 'ذكاء اصطناعي',
    levelId: 'lvl-m1',
    levelName: 'ماستر 1',
    bio: '',
    verified: false,
  };

  const fakeAdminUser: User = {
    ...studentUser,
    role: 'admin',
    verified: false, // unverified!
  };

  const trueAdminUser: User = {
    ...studentUser,
    role: 'admin',
    verified: true,
    badge: 'إدارة الكلية الرسمية',
  };

  assert.equal(canPublishOfficialAnnouncement(studentUser), false);
  assert.equal(canPublishOfficialAnnouncement(fakeAdminUser), false);
  assert.equal(canPublishOfficialAnnouncement(null), false);
  assert.equal(canPublishOfficialAnnouncement(trueAdminUser), true);
});

test('togglePostLike adds and removes user ID reliably', () => {
  const post: CommunityPost = {
    id: 'post-1',
    authorId: 'u-dean',
    authorName: 'عمادة الكلية',
    authorAvatar: '',
    authorRole: 'admin',
    isOfficial: true,
    category: 'announcement',
    title: 'افتتاح التسجيلات للماستر',
    content: 'يرجى مراجعة الجدول',
    attachments: [],
    likes: ['user-1'],
    comments: [],
    tags: ['ماستر'],
    createdAt: '2026-10-10',
  };

  assert.equal(hasUserLikedPost(post, 'user-1'), true);
  assert.equal(hasUserLikedPost(post, 'user-2'), false);

  const likedPost = togglePostLike(post, 'user-2');
  assert.equal(likedPost.likes.includes('user-2'), true);
  assert.equal(likedPost.likes.length, 2);

  const unlikedPost = togglePostLike(likedPost, 'user-2');
  assert.equal(unlikedPost.likes.includes('user-2'), false);
  assert.equal(unlikedPost.likes.length, 1);
});

test('filterPostsByCategory and searchPosts accurately match criteria', () => {
  const posts: CommunityPost[] = [
    {
      id: 'p1',
      authorId: 'u1',
      authorName: 'سارة طالبة',
      authorAvatar: '',
      authorRole: 'student',
      isOfficial: false,
      category: 'internship',
      title: 'فرصة تربص في مجال الذكاء الاصطناعي بشركة سوناطراك',
      content: 'مطلوب طلبة ماستر ذكاء اصطناعي',
      attachments: [],
      likes: [],
      comments: [],
      tags: ['تربص', 'ذكاء اصطناعي'],
      createdAt: '2026-10-12',
    },
    {
      id: 'p2',
      authorId: 'u-dean',
      authorName: 'إدارة الكلية',
      authorAvatar: '',
      authorRole: 'admin',
      isOfficial: true,
      category: 'announcement',
      title: 'جدول امتحانات السداسي الأول',
      content: 'تم نشر تواريخ الامتحانات الرسمية',
      attachments: [],
      likes: [],
      comments: [],
      tags: ['امتحانات'],
      createdAt: '2026-10-14',
    },
  ];

  const internships = filterPostsByCategory(posts, 'internship');
  assert.equal(internships.length, 1);
  assert.equal(internships[0].id, 'p1');

  const searchResults = searchPosts(posts, 'امتحانات');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, 'p2');
});
