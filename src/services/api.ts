import type {
  User,
  Specialty,
  AcademicLevel,
  Course,
  Lecture,
  CommunityPost,
  AppNotification,
  PostCategory,
} from '../types/index.ts';

const BASE_URL = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('studyflow_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('studyflow_token', token);
    } else {
      localStorage.removeItem('studyflow_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'حدث خطأ في الاتصال بالخادم');
    }

    return data as T;
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    specialtyId: string;
    levelId: string;
  }): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    return res;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Academic
  async getSpecialties(): Promise<{ specialties: Specialty[] }> {
    return this.request<{ specialties: Specialty[] }>('/academic/specialties');
  }

  async getLevels(): Promise<{ levels: AcademicLevel[] }> {
    return this.request<{ levels: AcademicLevel[] }>('/academic/levels');
  }

  async getCourses(specialtyId?: string, levelId?: string): Promise<{ courses: Course[] }> {
    const query = new URLSearchParams();
    if (specialtyId) query.set('specialtyId', specialtyId);
    if (levelId) query.set('levelId', levelId);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ courses: Course[] }>(`/academic/courses${qStr}`);
  }

  async getLectures(courseId?: string): Promise<{ lectures: Lecture[] }> {
    const qStr = courseId ? `?courseId=${encodeURIComponent(courseId)}` : '';
    return this.request<{ lectures: Lecture[] }>(`/academic/lectures${qStr}`);
  }

  async getLecture(id: string): Promise<{ lecture: Lecture }> {
    return this.request<{ lecture: Lecture }>(`/academic/lectures/${id}`);
  }

  // Community
  async getPosts(category?: string, search?: string): Promise<{ posts: CommunityPost[] }> {
    const query = new URLSearchParams();
    if (category && category !== 'all') query.set('category', category);
    if (search) query.set('search', search);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ posts: CommunityPost[] }>(`/community/posts${qStr}`);
  }

  async createPost(data: {
    title: string;
    content: string;
    category: PostCategory;
    attachments?: { type: 'image' | 'file'; url: string; name: string }[];
    tags?: string[];
  }): Promise<{ post: CommunityPost }> {
    return this.request<{ post: CommunityPost }>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async toggleLike(postId: string): Promise<{ likes: string[]; hasLiked: boolean }> {
    return this.request<{ likes: string[]; hasLiked: boolean }>(`/community/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async addComment(postId: string, text: string) {
    return this.request<{ comment: any; comments: any[] }>(`/community/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async bookmarkPost(postId: string) {
    return this.request<{ savedPostIds: string[]; isSaved: boolean }>(`/community/posts/${postId}/bookmark`, {
      method: 'POST',
    });
  }

  async deletePost(postId: string) {
    return this.request<{ success: boolean }>(`/community/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: AppNotification[] }> {
    return this.request<{ notifications: AppNotification[] }>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead() {
    return this.markAllNotificationsRead();
  }

  // AI Study Assistant
  async askStudyAssistant(lectureId: string | null, question: string, courseName?: string, lectureTitle?: string) {
    return this.request<{ answer: string; source: string }>('/ai/study-assistant', {
      method: 'POST',
      body: JSON.stringify({ lectureId, question, courseName, lectureTitle }),
    });
  }

  async askAssistant(question: string, courseName?: string, lectureTitle?: string) {
    return this.askStudyAssistant(null, question, courseName, lectureTitle);
  }

  // Android info
  async getAndroidProjectInfo() {
    return this.request<any>('/export/android-project-info');
  }
}

export const api = new ApiService();
