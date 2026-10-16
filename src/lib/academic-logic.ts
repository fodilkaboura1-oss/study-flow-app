import type { Course, Lecture, CommunityPost, User, PostCategory } from '../types/index.ts';

/**
 * Filter lectures strictly belonging to a specific course.
 * Guarantees courses do not leak or mix lectures across subjects.
 */
export function filterLecturesByCourse(lectures: Lecture[], courseId: string): Lecture[] {
  if (!courseId) return [];
  return lectures.filter(l => l.courseId === courseId);
}

/**
 * Filter courses according to the student's enrolled specialty and academic level.
 */
export function filterCoursesByStudent(
  courses: Course[],
  specialtyId: string,
  levelId: string
): Course[] {
  if (!specialtyId || !levelId) return courses;
  return courses.filter(c => c.specialtyId === specialtyId && c.levelId === levelId);
}

/**
 * Verify whether a user is authorized to publish official administrative announcements.
 * Only authenticated administrators with role === 'admin' and verified === true can publish.
 */
export function canPublishOfficialAnnouncement(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin' && user.verified === true;
}

/**
 * Check if a student has liked a specific post.
 */
export function hasUserLikedPost(post: CommunityPost, userId: string): boolean {
  if (!post || !userId) return false;
  return post.likes.includes(userId);
}

/**
 * Toggle like status on a post immutably.
 */
export function togglePostLike(post: CommunityPost, userId: string): CommunityPost {
  if (!post || !userId) return post;
  const isLiked = post.likes.includes(userId);
  const updatedLikes = isLiked
    ? post.likes.filter(id => id !== userId)
    : [...post.likes, userId];

  return {
    ...post,
    likes: updatedLikes
  };
}

/**
 * Filter posts by category or return all if 'all' is chosen.
 */
export function filterPostsByCategory(
  posts: CommunityPost[],
  category: PostCategory | 'all'
): CommunityPost[] {
  if (category === 'all') return posts;
  return posts.filter(p => p.category === category);
}

/**
 * Search posts by query matching title, content, author, or tags.
 */
export function searchPosts(posts: CommunityPost[], query: string): CommunityPost[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return posts;
  return posts.filter(p => 
    p.title.toLowerCase().includes(clean) ||
    p.content.toLowerCase().includes(clean) ||
    p.authorName.toLowerCase().includes(clean) ||
    p.tags.some(t => t.toLowerCase().includes(clean))
  );
}
