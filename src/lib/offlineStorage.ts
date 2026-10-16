export interface OfflineFlashcard {
  id: string;
  subject: string;
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  reviewCount: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
}

const DEFAULT_FLASHCARDS: OfflineFlashcard[] = [
  {
    id: 'fc-1',
    subject: 'إدارة مالية',
    question: 'ما هي المعادلة الجوهرية للتوازن المالي الوظيفي؟',
    answer: 'الخزينة الصافية (TN) = رأس المال العامل الصافي الإجمالي (FRNG) - احتياج رأس المال العامل (BFR).',
    reviewCount: 3,
    difficulty: 'easy',
  },
  {
    id: 'fc-2',
    subject: 'إدارة المشاريع',
    question: 'ما هو المسار الحرج (Critical Path) في طريقة CPM؟',
    answer: 'أطول مسار للأنشطة المتتالية في المخطط الشبكي يحدد الحد الأدنى من الوقت لإنجاز المشروع، وفائضه الزمني (Marges) يساوي صفراً.',
    reviewCount: 2,
    difficulty: 'medium',
  },
  {
    id: 'fc-3',
    subject: 'المحاسبة التحليلية',
    question: 'ما هو تعريف عتبة المردودية (Seuil de Rentabilité)؟',
    answer: 'هو رقم الأعمال (Chiffre d’affaires) الذي تكون عنده النتيجة الصافية للمؤسسة مساوية للصفر (لا ربح ولا خسارة)، وتغطي عنده الهوامش مجموع التكاليف الثابتة.',
    reviewCount: 1,
    difficulty: 'hard',
  },
  {
    id: 'fc-4',
    subject: 'أنظمة المعلومات',
    question: 'ما هو الفرق بين البيانات (Data) والمعلومات (Information)؟',
    answer: 'البيانات هي حقائق أولية خام وغير منظمة، بينما المعلومات هي نتاج معالجة وتنظيم وسياقة تلك البيانات لتصبح ذات معنى وقيمة لاتخاذ القرار.',
    reviewCount: 4,
    difficulty: 'easy',
  },
];

export const offlineStorage = {
  // Flashcards
  getFlashcards(): OfflineFlashcard[] {
    try {
      const data = localStorage.getItem('studyflow_flashcards');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse stored flashcards', e);
    }
    localStorage.setItem('studyflow_flashcards', JSON.stringify(DEFAULT_FLASHCARDS));
    return DEFAULT_FLASHCARDS;
  },

  saveFlashcard(card: Omit<OfflineFlashcard, 'id' | 'reviewCount'>): OfflineFlashcard {
    const cards = this.getFlashcards();
    const newCard: OfflineFlashcard = {
      ...card,
      id: `fc-${Date.now()}`,
      reviewCount: 0,
      nextReviewAt: new Date().toISOString(),
    };
    const updated = [newCard, ...cards];
    localStorage.setItem('studyflow_flashcards', JSON.stringify(updated));
    return newCard;
  },

  rateFlashcard(cardId: string, rating: 'easy' | 'medium' | 'hard'): OfflineFlashcard[] {
    const cards = this.getFlashcards();
    const now = new Date();
    const updated = cards.map((c) => {
      if (c.id === cardId) {
        const nextDays = rating === 'easy' ? 4 : rating === 'medium' ? 2 : 1;
        const nextDate = new Date(now.getTime() + nextDays * 24 * 60 * 60 * 1000);
        return {
          ...c,
          difficulty: rating,
          reviewCount: (c.reviewCount || 0) + 1,
          lastReviewedAt: now.toISOString(),
          nextReviewAt: nextDate.toISOString(),
        };
      }
      return c;
    });
    localStorage.setItem('studyflow_flashcards', JSON.stringify(updated));
    return updated;
  },

  // Lecture Notes
  getLectureNotes(lectureId: string): string {
    return localStorage.getItem(`studyflow_note_${lectureId}`) || '';
  },

  saveLectureNotes(lectureId: string, noteText: string): void {
    localStorage.setItem(`studyflow_note_${lectureId}`, noteText);
  },

  // Completed Lectures
  getCompletedLectures(): string[] {
    try {
      const data = localStorage.getItem('studyflow_completed_lectures');
      return data ? JSON.parse(data) : ['lec-1'];
    } catch {
      return ['lec-1'];
    }
  },

  toggleLectureCompleted(lectureId: string): { completedLectures: string[]; isCompleted: boolean } {
    const list = this.getCompletedLectures();
    const index = list.indexOf(lectureId);
    let updated: string[];
    let isCompleted = false;
    if (index > -1) {
      updated = list.filter((id) => id !== lectureId);
      isCompleted = false;
    } else {
      updated = [...list, lectureId];
      isCompleted = true;
    }
    localStorage.setItem('studyflow_completed_lectures', JSON.stringify(updated));
    return { completedLectures: updated, isCompleted };
  },

  // AI Chat History
  getAiHistory(): AiChatMessage[] {
    try {
      const data = localStorage.getItem('studyflow_ai_history');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addAiMessage(sender: 'user' | 'ai', text: string, source?: string): AiChatMessage {
    const history = this.getAiHistory();
    const msg: AiChatMessage = {
      id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source,
    };
    const updated = [...history, msg];
    localStorage.setItem('studyflow_ai_history', JSON.stringify(updated));
    return msg;
  },

  clearAiHistory(): void {
    localStorage.removeItem('studyflow_ai_history');
  },
};
