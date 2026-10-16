import { useState, useEffect } from 'react';

export type Language = 'ar' | 'fr' | 'en';

export interface Translations {
  appName: string;
  appSubtitle: string;
  tabs: {
    home: string;
    study: string;
    flashcards: string;
    community: string;
    ai: string;
    notifications: string;
    profile: string;
  };
  common: {
    search: string;
    filter: string;
    save: string;
    cancel: string;
    add: string;
    delete: string;
    edit: string;
    submit: string;
    loading: string;
    offline: string;
    offlineMsg: string;
    retry: string;
    refresh: string;
    close: string;
    back: string;
    completed: string;
    empty: string;
    error: string;
    installApp: string;
    installIos: string;
    installIosStep1: string;
    installIosStep2: string;
    installBannerTitle: string;
    installBannerDesc: string;
    installed: string;
  };
  home: {
    welcome: string;
    greeting: string;
    quickStats: string;
    todayFocus: string;
    startFlashcards: string;
    flashcardsReady: string;
    recentCourses: string;
    latestDiscussions: string;
    askAiPrompt: string;
    askAiSub: string;
    viewAll: string;
    studyStreak: string;
    streakDays: string;
    completedLecturesCount: string;
  };
  study: {
    title: string;
    courses: string;
    lectures: string;
    allSpecialties: string;
    allLevels: string;
    summary: string;
    keyTakeaways: string;
    personalNotes: string;
    notesPlaceholder: string;
    saveNotes: string;
    notesSaved: string;
    markAsCompleted: string;
    completedBadge: string;
    downloadPdf: string;
    noLecturesFound: string;
    selectCourseToStart: string;
  };
  flashcards: {
    title: string;
    subtitle: string;
    cardOf: string;
    clickToReveal: string;
    question: string;
    answer: string;
    rateHeading: string;
    easy: string;
    medium: string;
    hard: string;
    addNew: string;
    newCardTitle: string;
    subjectLabel: string;
    questionLabel: string;
    answerLabel: string;
    addSuccess: string;
    noCards: string;
    createFirstCard: string;
    reviewFinished: string;
    restartReview: string;
  };
  community: {
    title: string;
    subtitle: string;
    categories: {
      all: string;
      discussion: string;
      summary: string;
      question: string;
      exam_prep: string;
    };
    newPost: string;
    postTitle: string;
    postContent: string;
    postCategory: string;
    postAttachment: string;
    postTags: string;
    tagsPlaceholder: string;
    publish: string;
    comments: string;
    addComment: string;
    writeComment: string;
    send: string;
    likes: string;
    savePost: string;
    noPosts: string;
    createFirstPost: string;
  };
  ai: {
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    sendButton: string;
    clearChat: string;
    suggestionsTitle: string;
    suggestion1: string;
    suggestion2: string;
    suggestion3: string;
    thinking: string;
    copyAnswer: string;
    copied: string;
    emptyHistory: string;
    disclaimer: string;
  };
  profile: {
    title: string;
    accountInfo: string;
    role: string;
    student: string;
    admin: string;
    university: string;
    specialty: string;
    level: string;
    settings: string;
    theme: string;
    dayMode: string;
    nightMode: string;
    language: string;
    pwaStatus: string;
    offlineCached: string;
    logout: string;
    login: string;
    switchRole: string;
  };
}

export const translations: Record<Language, Translations> = {
  ar: {
    appName: 'StudyFlow',
    appSubtitle: 'منصتك الأكاديمية للدراسة والتفوق الجامعي',
    tabs: {
      home: 'الرئيسية',
      study: 'المقررات',
      flashcards: 'البطاقات',
      community: 'المجتمع',
      ai: 'مساعد AI',
      notifications: 'الإشعارات',
      profile: 'حسابي',
    },
    common: {
      search: 'بحث في المحتوى والمقررات...',
      filter: 'تصفية',
      save: 'حفظ',
      cancel: 'إلغاء',
      add: 'إضافة',
      delete: 'حذف',
      edit: 'تعديل',
      submit: 'إرسال',
      loading: 'جاري التحميل...',
      offline: 'غير متصل بالإنترنت',
      offlineMsg: 'أنت في وضع العمل دون اتصال — يتم عرض البيانات المخزنة محلياً',
      retry: 'إعادة المحاولة',
      refresh: 'تحديث',
      close: 'إغلاق',
      back: 'رجوع',
      completed: 'مكتمل',
      empty: 'لا توجد بيانات متاحة حالياً',
      error: 'حدث خطأ غير متوقع',
      installApp: 'تثبيت التطبيق',
      installIos: 'تثبيت على آيفون (iOS)',
      installIosStep1: '1. اضغط على زر المشاركة (Share) في شريط سفاري السفلي.',
      installIosStep2: '2. مرر للأسفل واختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).',
      installBannerTitle: 'ثبّت StudyFlow على هاتفك',
      installBannerDesc: 'استمتع بوصول فوري للمحاضرات والبطاقات حتى بدون إنترنت',
      installed: 'تم تثبيت التطبيق بنجاح',
    },
    home: {
      welcome: 'مرحباً بك مجدداً',
      greeting: 'واصل تقدمك الأكاديمي اليوم',
      quickStats: 'إحصائيات المذاكرة',
      todayFocus: 'جلسة التكرار المتباعد جاهزة',
      startFlashcards: 'ابدأ مراجعة البطاقات الذكية',
      flashcardsReady: 'بطاقات بانتظار مراجعتك لترسيخ المعلومات',
      recentCourses: 'المقاييس الأكاديمية النشطة',
      latestDiscussions: 'آخر نقاشات المجتمع الطلابي',
      askAiPrompt: 'اسأل المساعد الذكي عن أي مقياس',
      askAiSub: 'شرح فوري للمحاضرات، تلخيص، وحل نماذج الأسئلة بـ Gemini',
      viewAll: 'عرض الكل',
      studyStreak: 'أيام دراسة متتالية',
      streakDays: 'أيام',
      completedLecturesCount: 'محاضرات منجزة',
    },
    study: {
      title: 'المقررات والمحاضرات',
      courses: 'المقاييس',
      lectures: 'المحاضرات المتاحة',
      allSpecialties: 'جميع التخصصات',
      allLevels: 'جميع المستويات',
      summary: 'ملخص المحاضرة',
      keyTakeaways: 'أهم النقاط المفتاحية للاختبار',
      personalNotes: 'ملاحظاتي الدراسية الخاصة',
      notesPlaceholder: 'سجل هنا ملاحظاتك وتلخيصك الشخصي لهذه المحاضرة (تُحفظ تلقائياً)...',
      saveNotes: 'حفظ الملاحظات',
      notesSaved: 'تم حفظ الملاحظات محلياً',
      markAsCompleted: 'تحديد كمكتمل ومُراجع',
      completedBadge: 'تمت دراستها',
      downloadPdf: 'تحميل / فتح الملخص (PDF)',
      noLecturesFound: 'لا توجد محاضرات مدرجة لهذا المقياس حتى الآن.',
      selectCourseToStart: 'اختر مقياساً من القائمة أعلاه لبدء المذاكرة والتصفح.',
    },
    flashcards: {
      title: 'البطاقات التعليمية والتكرار المتباعد',
      subtitle: 'نظام الحفظ طويل المدى المبني على خوارزمية Leitner',
      cardOf: 'بطاقة',
      clickToReveal: 'اضغط على البطاقة لإظهار الإجابة والحل',
      question: 'السؤال',
      answer: 'الإجابة والشرح',
      rateHeading: 'ما مدى سهولة تذكرك لهذه المعلومة؟',
      easy: 'سهل (متقن)',
      medium: 'متوسط (يحتاج مراجعة)',
      hard: 'صعب (إعادة فورية)',
      addNew: 'إضافة بطاقة جديدة',
      newCardTitle: 'إنشاء بطاقة استذكار جديدة',
      subjectLabel: 'المقياس / المادة',
      questionLabel: 'نص السؤال أو المصطلح',
      answerLabel: 'الإجابة النموذجية أو التعريف',
      addSuccess: 'تمت إضافة البطاقة بنجاح!',
      noCards: 'لا توجد بطاقات متاحة في هذا المقياس.',
      createFirstCard: 'أضف بطاقتك الأولى لبدء رحلة التكرار المتباعد',
      reviewFinished: 'تهانينا! أنهيت جميع البطاقات المجدولة لهذه الجلسة.',
      restartReview: 'إعادة مراجعة البطاقات من البداية',
    },
    community: {
      title: 'المجتمع الأكاديمي والتبادل الطلابي',
      subtitle: 'شارك الملخصات، اطرح التساؤلات، وتفاعل مع زملائك',
      categories: {
        all: 'الكل',
        discussion: 'نقاش عام',
        summary: 'ملخصات ومراجع',
        question: 'استفسارات وحلول',
        exam_prep: 'تحضير للامتحانات',
      },
      newPost: 'منشور جديد',
      postTitle: 'عنوان المنشور',
      postContent: 'محتوى المنشور أو السؤال بالتفصيل...',
      postCategory: 'التصنيف',
      postAttachment: 'رابط المرفق أو الصورة (اختياري)',
      postTags: 'الوسوم (مفصولة بمسافة)',
      tagsPlaceholder: '#إدارة #مالية #امتحانات',
      publish: 'نشر الآن',
      comments: 'التعليقات',
      addComment: 'إضافة تعليق',
      writeComment: 'اكتب تعليقك الأكاديمي هنا...',
      send: 'إرسال',
      likes: 'إعجاب',
      savePost: 'حفظ في المفضلة',
      noPosts: 'لا توجد منشورات في هذا التصنيف حالياً.',
      createFirstPost: 'كن أول من يشارك زملاءه بموضوع مفيد!',
    },
    ai: {
      title: 'المساعد الأكاديمي الذكي (Gemini)',
      subtitle: 'مساعدتك الفورية لشرح المواد، حل التمارين وتلخيص الدروس',
      inputPlaceholder: 'اطرح سؤالك الأكاديمي هنا (مثال: اشرح لي مفهوم التوازن المالي)...',
      sendButton: 'إرسال للمساعد',
      clearChat: 'مسح المحادثة',
      suggestionsTitle: 'أسئلة مقترحة سريعة:',
      suggestion1: 'اشرح لي مفهوم التوازن المالي الوظيفي باختصار',
      suggestion2: 'ما هو المسار الحرج (Critical Path) في طريقة CPM؟',
      suggestion3: 'أعطني 3 أسئلة تدريبية لاختبار فهمي في المحاسبة المالية',
      thinking: 'المساعد الذكي يقوم بصياغة الإجابة الأكاديمية الدقيقة...',
      copyAnswer: 'نسخ الإجابة',
      copied: 'تم النسخ!',
      emptyHistory: 'لا توجد محادثات بعد. اسألني عن أي موضوع في مقرراتك الجامعية!',
      disclaimer: 'يقوم المساعد الذكي بمعالجة وتلخيص المفاهيم اعتماداً على أحدث نماذج الذكاء الاصطناعي من جوجل.',
    },
    profile: {
      title: 'الملف الشخصي والإعدادات',
      accountInfo: 'معلومات الحساب الأكاديمي',
      role: 'الصفة / الدور',
      student: 'طالب جامعي',
      admin: 'أستاذ / إدارة الكلية',
      university: 'المؤسسة الجامعية',
      specialty: 'التخصص الأكاديمي',
      level: 'المستوى الدراسي',
      settings: 'تفضيلات التطبيق',
      theme: 'المظهر والسمة',
      dayMode: 'الوضع النهاري',
      nightMode: 'الوضع الليلي',
      language: 'لغة الواجهة (Language)',
      pwaStatus: 'حالة تطبيق الويب (PWA)',
      offlineCached: 'البيانات محفوظة وجاهزة للاستخدام بدون إنترنت',
      logout: 'تسجيل الخروج',
      login: 'تسجيل الدخول / إنشاء حساب',
      switchRole: 'التبديل بين حساب الطالب والمشرف',
    },
  },
  fr: {
    appName: 'StudyFlow',
    appSubtitle: 'Votre plateforme académique pour réussir vos études',
    tabs: {
      home: 'Accueil',
      study: 'Cours',
      flashcards: 'Flashcards',
      community: 'Communauté',
      ai: 'Tuteur IA',
      notifications: 'Alertes',
      profile: 'Profil',
    },
    common: {
      search: 'Rechercher dans les cours et résumés...',
      filter: 'Filtrer',
      save: 'Enregistrer',
      cancel: 'Annuler',
      add: 'Ajouter',
      delete: 'Supprimer',
      edit: 'Modifier',
      submit: 'Envoyer',
      loading: 'Chargement en cours...',
      offline: 'Hors ligne',
      offlineMsg: 'Mode hors ligne — Affichage des données enregistrées localement',
      retry: 'Réessayer',
      refresh: 'Actualiser',
      close: 'Fermer',
      back: 'Retour',
      completed: 'Terminé',
      empty: 'Aucune donnée disponible pour le moment',
      error: 'Une erreur inattendue est survenue',
      installApp: 'Installer l\'application',
      installIos: 'Installer sur iPhone (iOS)',
      installIosStep1: '1. Appuyez sur le bouton Partager dans la barre Safari.',
      installIosStep2: '2. Faites défiler et appuyez sur "Sur l\'écran d\'accueil".',
      installBannerTitle: 'Installez StudyFlow sur votre mobile',
      installBannerDesc: 'Accédez instantanément à vos cours et fiches, même sans connexion',
      installed: 'Application installée avec succès',
    },
    home: {
      welcome: 'Bienvenue à nouveau',
      greeting: 'Continuez votre progression académique aujourd\'hui',
      quickStats: 'Statistiques d\'étude',
      todayFocus: 'Session de répétition espacée prête',
      startFlashcards: 'Commencer la révision intelligente',
      flashcardsReady: 'cartes en attente de révision pour ancrer vos acquis',
      recentCourses: 'Matières académiques actives',
      latestDiscussions: 'Dernières discussions étudiantes',
      askAiPrompt: 'Interrogez le tuteur IA sur n\'importe quelle matière',
      askAiSub: 'Explication instantanée, résumés et résolutions d\'exercices par Gemini',
      viewAll: 'Voir tout',
      studyStreak: 'Jours consécutifs d\'étude',
      streakDays: 'jours',
      completedLecturesCount: 'cours complétés',
    },
    study: {
      title: 'Modules et Cours',
      courses: 'Modules',
      lectures: 'Cours disponibles',
      allSpecialties: 'Toutes les spécialités',
      allLevels: 'Tous les niveaux',
      summary: 'Résumé du cours',
      keyTakeaways: 'Points clés essentiels pour l\'examen',
      personalNotes: 'Mes notes personnelles',
      notesPlaceholder: 'Écrivez ici vos notes personnelles pour ce cours (sauvegarde automatique)...',
      saveNotes: 'Enregistrer les notes',
      notesSaved: 'Notes enregistrées localement',
      markAsCompleted: 'Marquer comme étudié',
      completedBadge: 'Étudié',
      downloadPdf: 'Télécharger / Ouvrir le résumé (PDF)',
      noLecturesFound: 'Aucun cours disponible pour ce module pour le moment.',
      selectCourseToStart: 'Sélectionnez un module ci-dessus pour commencer l\'étude.',
    },
    flashcards: {
      title: 'Flashcards & Répétition Espacée',
      subtitle: 'Mémorisation à long terme optimisée selon le système Leitner',
      cardOf: 'Carte',
      clickToReveal: 'Cliquez sur la carte pour afficher la réponse',
      question: 'Question',
      answer: 'Réponse et explication',
      rateHeading: 'Comment évaluez-vous votre mémorisation ?',
      easy: 'Facile (Maîtrisé)',
      medium: 'Moyen (À revoir)',
      hard: 'Difficile (Révision immédiate)',
      addNew: 'Nouvelle carte',
      newCardTitle: 'Créer une nouvelle flashcard',
      subjectLabel: 'Matière / Module',
      questionLabel: 'Question ou concept',
      answerLabel: 'Réponse ou définition',
      addSuccess: 'Carte ajoutée avec succès !',
      noCards: 'Aucune carte disponible pour cette matière.',
      createFirstCard: 'Créez votre première carte pour démarrer la révision',
      reviewFinished: 'Félicitations ! Vous avez terminé toutes les cartes prévues.',
      restartReview: 'Recommencer la révision depuis le début',
    },
    community: {
      title: 'Communauté Académique',
      subtitle: 'Partagez des résumés, posez des questions et collaborez',
      categories: {
        all: 'Tous',
        discussion: 'Discussion générale',
        summary: 'Résumés et fiches',
        question: 'Questions et entraide',
        exam_prep: 'Préparation examens',
      },
      newPost: 'Nouvelle publication',
      postTitle: 'Titre de la publication',
      postContent: 'Contenu détaillé de votre question ou partage...',
      postCategory: 'Catégorie',
      postAttachment: 'Lien de la pièce jointe ou image (optionnel)',
      postTags: 'Tags (séparés par un espace)',
      tagsPlaceholder: '#gestion #finance #examens',
      publish: 'Publier maintenant',
      comments: 'Commentaires',
      addComment: 'Ajouter un commentaire',
      writeComment: 'Écrivez votre commentaire académique...',
      send: 'Envoyer',
      likes: 'J\'aime',
      savePost: 'Sauvegarder',
      noPosts: 'Aucune publication dans cette catégorie actuellement.',
      createFirstPost: 'Soyez le premier à partager un contenu utile avec vos camarades !',
    },
    ai: {
      title: 'Tuteur Académique IA (Gemini)',
      subtitle: 'Assistance instantanée pour comprendre vos cours et préparer vos examens',
      inputPlaceholder: 'Posez votre question académique ici...',
      sendButton: 'Envoyer à l\'IA',
      clearChat: 'Effacer l\'historique',
      suggestionsTitle: 'Suggestions rapides :',
      suggestion1: 'Expliquez-moi le concept de l\'équilibre financier fonctionnel',
      suggestion2: 'Qu\'est-ce que le chemin critique (Critical Path) dans la méthode CPM ?',
      suggestion3: 'Donnez-moi 3 questions d\'entraînement pour tester ma compréhension',
      thinking: 'L\'IA rédige une réponse académique claire...',
      copyAnswer: 'Copier la réponse',
      copied: 'Copié !',
      emptyHistory: 'Aucune discussion pour le moment. Posez une question sur vos cours !',
      disclaimer: 'Le tuteur académique s\'appuie sur les modèles avancés Google Gemini pour générer des explications.',
    },
    profile: {
      title: 'Profil et Paramètres',
      accountInfo: 'Informations du compte académique',
      role: 'Rôle',
      student: 'Étudiant universitaire',
      admin: 'Enseignant / Administration',
      university: 'Établissement',
      specialty: 'Spécialité académique',
      level: 'Niveau d\'études',
      settings: 'Préférences de l\'application',
      theme: 'Thème d\'affichage',
      dayMode: 'Mode Jour',
      nightMode: 'Mode Nuit',
      language: 'Langue de l\'interface',
      pwaStatus: 'État de l\'application (PWA)',
      offlineCached: 'Données mises en cache pour une utilisation hors ligne',
      logout: 'Déconnexion',
      login: 'Connexion / Inscription',
      switchRole: 'Basculer entre profil étudiant et enseignant',
    },
  },
  en: {
    appName: 'StudyFlow',
    appSubtitle: 'Your Academic Platform for University Excellence',
    tabs: {
      home: 'Home',
      study: 'Courses',
      flashcards: 'Flashcards',
      community: 'Community',
      ai: 'AI Tutor',
      notifications: 'Alerts',
      profile: 'Profile',
    },
    common: {
      search: 'Search courses and summaries...',
      filter: 'Filter',
      save: 'Save',
      cancel: 'Cancel',
      add: 'Add',
      delete: 'Delete',
      edit: 'Edit',
      submit: 'Submit',
      loading: 'Loading...',
      offline: 'Offline',
      offlineMsg: 'You are currently in offline mode — displaying locally cached data',
      retry: 'Retry',
      refresh: 'Refresh',
      close: 'Close',
      back: 'Back',
      completed: 'Completed',
      empty: 'No data available at the moment',
      error: 'An unexpected error occurred',
      installApp: 'Install App',
      installIos: 'Install on iPhone (iOS)',
      installIosStep1: '1. Tap the Share button in Safari toolbar.',
      installIosStep2: '2. Scroll down and tap "Add to Home Screen".',
      installBannerTitle: 'Install StudyFlow on your device',
      installBannerDesc: 'Instant access to courses and flashcards, even offline',
      installed: 'App installed successfully',
    },
    home: {
      welcome: 'Welcome back',
      greeting: 'Keep progressing in your academic journey today',
      quickStats: 'Study Overview',
      todayFocus: 'Spaced repetition session ready',
      startFlashcards: 'Start Smart Review',
      flashcardsReady: 'cards waiting for review to solidify your knowledge',
      recentCourses: 'Active Academic Courses',
      latestDiscussions: 'Latest Student Discussions',
      askAiPrompt: 'Ask the AI Tutor about any course topic',
      askAiSub: 'Instant explanations, summaries, and exam problem solving via Gemini',
      viewAll: 'View All',
      studyStreak: 'Study Streak Days',
      streakDays: 'days',
      completedLecturesCount: 'completed lectures',
    },
    study: {
      title: 'Courses & Lectures',
      courses: 'Courses',
      lectures: 'Available Lectures',
      allSpecialties: 'All Specialties',
      allLevels: 'All Levels',
      summary: 'Lecture Summary',
      keyTakeaways: 'Key Exam Takeaways',
      personalNotes: 'My Personal Notes',
      notesPlaceholder: 'Write your personal study notes here (auto-saved locally)...',
      saveNotes: 'Save Notes',
      notesSaved: 'Notes saved locally',
      markAsCompleted: 'Mark as Studied',
      completedBadge: 'Completed',
      downloadPdf: 'Download / View Summary (PDF)',
      noLecturesFound: 'No lectures available for this course yet.',
      selectCourseToStart: 'Select a course from above to begin studying.',
    },
    flashcards: {
      title: 'Flashcards & Spaced Repetition',
      subtitle: 'Long-term retention powered by the Leitner memory algorithm',
      cardOf: 'Card',
      clickToReveal: 'Tap card to reveal answer and explanation',
      question: 'Question',
      answer: 'Answer & Explanation',
      rateHeading: 'How well did you recall this information?',
      easy: 'Easy (Mastered)',
      medium: 'Medium (Needs review)',
      hard: 'Hard (Repeat now)',
      addNew: 'New Card',
      newCardTitle: 'Create New Study Flashcard',
      subjectLabel: 'Course / Subject',
      questionLabel: 'Question or Concept',
      answerLabel: 'Model Answer or Definition',
      addSuccess: 'Flashcard added successfully!',
      noCards: 'No cards available for this subject yet.',
      createFirstCard: 'Create your first card to begin spaced repetition',
      reviewFinished: 'Congratulations! You completed all scheduled cards for this session.',
      restartReview: 'Restart review from the beginning',
    },
    community: {
      title: 'Academic Community',
      subtitle: 'Share summaries, ask questions, and collaborate with peers',
      categories: {
        all: 'All',
        discussion: 'Discussions',
        summary: 'Summaries & Notes',
        question: 'Questions & Help',
        exam_prep: 'Exam Prep',
      },
      newPost: 'New Post',
      postTitle: 'Post Title',
      postContent: 'Detailed content of your question or study note...',
      postCategory: 'Category',
      postAttachment: 'Attachment or image URL (optional)',
      postTags: 'Tags (separated by space)',
      tagsPlaceholder: '#management #finance #exams',
      publish: 'Publish Now',
      comments: 'Comments',
      addComment: 'Add Comment',
      writeComment: 'Write your academic comment...',
      send: 'Send',
      likes: 'Likes',
      savePost: 'Bookmark',
      noPosts: 'No posts in this category yet.',
      createFirstPost: 'Be the first to share helpful study insights with your classmates!',
    },
    ai: {
      title: 'Academic AI Tutor (Gemini)',
      subtitle: 'Instant academic support to understand lectures and solve exercises',
      inputPlaceholder: 'Ask your academic question here...',
      sendButton: 'Ask Tutor',
      clearChat: 'Clear Chat',
      suggestionsTitle: 'Quick suggestions:',
      suggestion1: 'Explain the concept of functional financial balance simply',
      suggestion2: 'What is the Critical Path in the CPM method?',
      suggestion3: 'Give me 3 practice questions to test my understanding',
      thinking: 'AI is formulating a precise academic answer...',
      copyAnswer: 'Copy Answer',
      copied: 'Copied!',
      emptyHistory: 'No messages yet. Ask me any question about your university courses!',
      disclaimer: 'The AI Tutor processes and summarizes concepts using modern Google Gemini models.',
    },
    profile: {
      title: 'Profile & Settings',
      accountInfo: 'Academic Account Details',
      role: 'Role',
      student: 'University Student',
      admin: 'Professor / Department Admin',
      university: 'Institution',
      specialty: 'Academic Specialty',
      level: 'Study Level',
      settings: 'App Preferences',
      theme: 'Display Theme',
      dayMode: 'Day Mode',
      nightMode: 'Night Mode',
      language: 'Interface Language',
      pwaStatus: 'Progressive Web App (PWA)',
      offlineCached: 'Data cached and ready for offline use',
      logout: 'Sign Out',
      login: 'Sign In / Register',
      switchRole: 'Switch between Student and Admin accounts',
    },
  },
};

export function getInitialLanguage(): Language {
  const saved = localStorage.getItem('studyflow_lang') as Language;
  if (saved && (saved === 'ar' || saved === 'fr' || saved === 'en')) {
    return saved;
  }
  return 'ar';
}

export function isRTL(lang: Language): boolean {
  return lang === 'ar';
}

export function useI18n() {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('studyflow_lang', newLang);
    document.documentElement.dir = isRTL(newLang) ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return {
    lang,
    setLanguage,
    t: translations[lang],
    isRTL: isRTL(lang),
  };
}
