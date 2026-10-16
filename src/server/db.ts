import crypto from 'crypto';
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

// In-Memory Shared Database for Platform and Mobile App
export interface DatabaseState {
  users: (User & { passwordHash: string; salt: string })[];
  specialties: Specialty[];
  levels: AcademicLevel[];
  courses: Course[];
  lectures: Lecture[];
  posts: CommunityPost[];
  notifications: AppNotification[];
  tokens: Map<string, string>; // token -> userId
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function createDatabase(): DatabaseState {
  const salt1 = 'studyflow-salt-1';
  const salt2 = 'studyflow-salt-2';
  const salt3 = 'studyflow-salt-3';

  const specialties: Specialty[] = [
    {
      id: 'spec-management',
      name: 'إدارة الأعمال (علوم التسيير)',
      code: 'MGT-BUS',
      faculty: 'جامعة عبد الحميد بن باديس مستغانم - كلية العلوم الاقتصادية والتجارية وعلوم التسيير',
      icon: 'Briefcase',
      description: 'إدارة وتسيير المؤسسات، التخطيط الإستراتيجي، التنظيم الهيكلي وإدارة المشاريع والاستثمار.',
    },
    {
      id: 'spec-fintech',
      name: 'تكنولوجيا مالية (ماستر 1)',
      code: 'FIN-TECH',
      faculty: 'جامعة عبد الحميد بن باديس مستغانم - كلية العلوم الاقتصادية والتجارية وعلوم التسيير',
      icon: 'Cpu',
      description: 'التقنيات المالية الحديثة، تحليل الأسواق المالية بالذكاء الاصطناعي والبيانات الضخمة.',
    },
    {
      id: 'spec-ecofin',
      name: 'اقتصاد نقدي ومالي',
      code: 'ECO-MON',
      faculty: 'كلية العلوم الاقتصادية والتجارية وعلوم التسيير',
      icon: 'Coins',
      description: 'النظريات النقدية، البنوك المركزية، السياسات المالية الدولية وأسواق الصرف.',
    },
    {
      id: 'spec-ai',
      name: 'ذكاء اصطناعي وأنظمة ذكية',
      code: 'IA-SI',
      faculty: 'كلية العلوم والتكنولوجيا — جامعة عبد الحميد بن باديس',
      icon: 'Brain',
      description: 'خوارزميات التعلم العميق، الرؤية الحاسوبية، ومعالجة اللغات الطبيعية.',
    },
  ];

  const levels: AcademicLevel[] = [
    { id: 'lvl-l1', name: 'السنة الأولى ليسانس (L1)', code: 'L1', year: 1 },
    { id: 'lvl-l2', name: 'السنة الثانية ليسانس (L2)', code: 'L2', year: 2 },
    { id: 'lvl-l3', name: 'السنة الثالثة ليسانس (L3)', code: 'L3', year: 3 },
    { id: 'lvl-m1', name: 'السنة الأولى ماستر (M1)', code: 'M1', year: 4 },
    { id: 'lvl-m2', name: 'السنة الثانية ماستر (M2)', code: 'M2', year: 5 },
  ];

  const courses: Course[] = [
    // === 8 Exact Courses for L3 Management Sciences (إدارة الأعمال - علوم التسيير) from StudyFlow Platform ===
    {
      id: 'course-law',
      code: 'MGT-301',
      name: 'قانون الأعمال',
      specialtyId: 'spec-management',
      levelId: 'lvl-l3',
      semester: 'S1',
      credits: 4,
      coefficient: 2,
      instructor: 'أ.د. بن علي مختار',
      description: 'القواعد القانونية المنظمة للأنشطة التجارية، العقود التجارية، وإفلاس وتسوية الشركات.',
      icon: '⚖️',
      lectureCount: 3,
    },
    {
      id: 'course-lang',
      code: 'MGT-302',
      name: 'لغة أجنبية متخصصة',
      specialtyId: 'spec-management',
      levelId: 'lvl-l3',
      semester: 'S1',
      credits: 2,
      coefficient: 1,
      instructor: 'د. بوشامة إكرام',
      description: 'English for Business & Management, International Communication and Business Vocabulary.',
      icon: '🔤',
      lectureCount: 2,
    },
    {
      id: 'course-fin-mgmt',
      code: 'MGT-303',
      name: 'إدارة مالية',
      specialtyId: 'spec-management',
      levelId: 'lvl-l3',
      semester: 'S1',
      credits: 5,
      coefficient: 3,
      instructor: 'د. بوعلام توفيق',
      description: 'التحليل المالي للقوائم المالية، حساب هوامش الأمان، ونسب السيولة والربحية وقرارات الاستثمار.',
      icon: '💰',
      lectureCount: 4,
    },
    {
      id: 'course-hr',
      code: 'MGT-304',
      name: 'إدارة الموارد البشرية',
      specialtyId: 'spec-management',
      levelId: 'lvl-l3',
      semester: 'S1',
      credits: 4,
      coefficient: 2,
      instructor: 'د. حيمود فايزة',
      description: 'التوظيف، التدريب، تقييم الأداء، التعويضات والتحفيز في المنظمات الحديثة.',
      icon: '👥',
      lectureCount: 3,
    },
    {
      id: 'course-survey',
      code: 'MGT-305',
      name: 'تقنيات الاستقصاء',
      specialtyId: 'spec-management',
      levelId: 'lvl-l3',
      semester: 'S1',
      credits: 3,
      coefficient: 2,
      instructor: 'د. حمداوي منير',
      description: 'مناهج البحث الميداني، إعداد الاستبيانات، وتقنيات المعاينة وتحليل البيانات الإحصائية.',
      icon: '📊',
      lectureCount: 2,
    },
    {
      id: 'course-it-mgmt',
      code: 'MGT-306',
      name: 'إدارة تكنولوجيا المعلومات',
      specialtyId: 'spec-management',
      levelId: 'lvl-l3',
      semester: 'S1',
      credits: 4,
      coefficient: 2,
      instructor: 'د. مزيان رياض',
      description: 'نظم المعلومات الإدارية (MIS)، تخطيط موارد المؤسسات (ERP)، والأمن السيبراني المؤسسي.',
      icon: '💻',
      lectureCount: 3,
    },
    {
      id: 'course-proj-mgmt',
      code: 'MGT-307',
      name: 'إدارة المشاريع',
      specialtyId: 'spec-management',
      levelId: 'lvl-l3',
      semester: 'S1',
      credits: 5,
      coefficient: 3,
      instructor: 'أ/ قبايلي',
      description: 'دورة حياة المشروع، مخططات Gantt و CPM/PERT، وإدارة مخاطر وجدول الميزانية.',
      icon: '📋',
      lectureCount: 3,
    },
    {
      id: 'course-org-struct',
      code: 'MGT-308',
      name: 'هياكل وتنظيم المؤسسة',
      specialtyId: 'spec-management',
      levelId: 'lvl-l3',
      semester: 'S1',
      credits: 5,
      coefficient: 3,
      instructor: 'أ/ دحمان',
      description: 'نظريات التنظيم، الهياكل الوظيفية والمصفوفية، والتحول الهيكلي وإدارة التغيير التنظيمي.',
      icon: '🏢',
      lectureCount: 3,
    },

    // Fintech M1 Courses
    {
      id: 'course-fin-ai',
      code: 'FT-501',
      name: 'تحليل السوق المالي بالذكاء الاصطناعي',
      specialtyId: 'spec-fintech',
      levelId: 'lvl-m1',
      semester: 'S1',
      credits: 6,
      coefficient: 3,
      instructor: 'أ.د. بن عمارة رشيد',
      description: 'استخدام خوارزميات الذكاء الاصطناعي للتنبؤ بحركات الأسهم وتقييم المخاطر.',
      icon: '🤖',
      lectureCount: 3,
    },
    {
      id: 'course-fin-sql',
      code: 'FT-502',
      name: 'إدارة قواعد البيانات (SQL1)',
      specialtyId: 'spec-fintech',
      levelId: 'lvl-m1',
      semester: 'S1',
      credits: 5,
      coefficient: 3,
      instructor: 'د. ياسمين بوعلام',
      description: 'تصميم وإدارة قواعد البيانات المعقدة والاستعلامات المصرفية.',
      icon: '💾',
      lectureCount: 2,
    },
  ];

  const lectures: Lecture[] = [
    // Lectures for course-proj-mgmt (إدارة المشاريع - أ/ قبايلي)
    {
      id: 'lec-pm-1',
      courseId: 'course-proj-mgmt',
      courseName: 'إدارة المشاريع',
      title: 'المحاضرة 01: الإطار المفاهيمي لإدارة المشاريع ودورة حياة المشروع',
      week: 1,
      summary: 'تعريف المشروع وأركانه الثلاثة (الوقت، التكلفة، الجودة)، مراحل دورة حياة المشروع من البدء والتخطيط إلى التنفيذ والمراقبة والإغلاق.',
      keyTakeaways: [
        'المثلث الحديدي لإدارة المشاريع (Scope, Time, Cost).',
        'ميثاق المشروع (Project Charter) ودوره في تحديد أصحاب المصلحة.',
        'مصفوفة المسؤوليات RACI وتوزيع المهام بدقة.',
      ],
      slidesUrl: 'https://cdn.studyflow.univ/slides/pm-lec1.pdf',
      resources: [
        { id: 'res-pm-1', name: 'ملخص شامل: ميثاق المشروع وهيكل تجزئة العمل WBS', type: 'pdf', url: '#', size: '2.4 MB' },
        { id: 'res-pm-2', name: 'نماذج عملية لمخطط جانت (Gantt Chart Excel)', type: 'doc', url: '#', size: '1.2 MB' },
      ],
      aiStudyQuestions: [
        { question: 'ما الفرق الجوهري بين إدارة المشروع والعمليات اليومية التشغيلية (Operations)؟', answer: 'المشروع مؤقت وله بداية ونهاية وينتج مخرجاً فريداً، بينما العمليات التشغيلية مستمرة ومتكررة لتحقيق سير العمل المعتاد.' },
        { question: 'ما هو المسار الحرج (Critical Path) ولماذا هو مهم جداً؟', answer: 'هو أطول مسار للأنشطة المتتالية من البداية للنهاية، وتأخير أي نشاط فيه يؤدي حتماً إلى تأخير موعد تسليم المشروع بالكامل.' },
      ],
      createdAt: '2026-10-10T08:00:00Z',
    },
    {
      id: 'lec-pm-2',
      courseId: 'course-proj-mgmt',
      courseName: 'إدارة المشاريع',
      title: 'المحاضرة 02: تقنيات الجدولة الزمنية CPM و PERT',
      week: 2,
      summary: 'شرح حساب التقديرات الزمنية الثلاثية لتقنية بيرت (التفاؤلي، الأكثر ترجيحاً، التشاؤمي) وتحديد الفائض الزمني (Float/Slack).',
      keyTakeaways: [
        'صيغة حساب الوقت المتوقع Te = (To + 4Tm + Tp) / 6.',
        'طريقة المسار الحرج وتحديد الأنشطة الحرجة وغير الحرجة.',
      ],
      slidesUrl: 'https://cdn.studyflow.univ/slides/pm-lec2.pdf',
      resources: [
        { id: 'res-pm-3', name: 'تمارين محلولة في تقنية PERT والمخططات الشبكية', type: 'pdf', url: '#', size: '1.8 MB' },
      ],
      aiStudyQuestions: [
        { question: 'كيف يساعد حساب التباين (Variance) في تقنية PERT؟', answer: 'يساعد في قياس درجة عدم اليقين والمخاطرة في إنهاء المشروع ضمن المدة المحددة وحساب الاحتمالية الإحصائية للتسليم.' },
      ],
      createdAt: '2026-10-13T08:00:00Z',
    },

    // Lectures for course-org-struct (هياكل وتنظيم المؤسسة - أ/ دحمان)
    {
      id: 'lec-org-1',
      courseId: 'course-org-struct',
      courseName: 'هياكل وتنظيم المؤسسة',
      title: 'المحاضرة 01: مبادئ التنظيم ونظرية الهياكل التنظيمية (مينتزبرغ)',
      week: 1,
      summary: 'الأجزاء الأساسية الخمسة للمنظمة وفق هنري مينتزبرغ: القمة الاستراتيجية، المركز العملياتي، الخط الأوسط، الهيكل الفني، وموظفو الدعم اللوجستي.',
      keyTakeaways: [
        'آليات التنسيق الخمس (التكيف المتبادل، الإشراف المباشر، وتوحيد معايير العمل/المخرجات/المهارات).',
        'عوامل الموقف والبيئة وتأثيرها على شكل الهيكل التنظيمي.',
      ],
      slidesUrl: 'https://cdn.studyflow.univ/slides/org-lec1.pdf',
      resources: [
        { id: 'res-org-1', name: 'مخطط مقارن لأنواع الهياكل التنظيمية الكلاسيكية والحديثة', type: 'pdf', url: '#', size: '3.1 MB' },
      ],
      aiStudyQuestions: [
        { question: 'ما هو الهيكل المصفوفي (Matrix Structure) وما أبرز عيوبه؟', answer: 'هو هيكل يجمع بين التقسيم الوظيفي وتقسيم المشاريع أو المنتجات، وعيبه الأساسي هو ازدواجية خطوط السلطة وتعدد الرؤساء المباشرين.' },
      ],
      createdAt: '2026-10-10T09:30:00Z',
    },

    // Lectures for course-law (قانون الأعمال)
    {
      id: 'lec-law-1',
      courseId: 'course-law',
      courseName: 'قانون الأعمال',
      title: 'المحاضرة 01: نظرية الأعمال التجارية وشروط اكتساب صفة التاجر',
      week: 1,
      summary: 'التمييز بين العمل التجاري والمدني، التزامات التاجر القانونية (القيد في السجل التجاري ومسك الدفاتر التجارية المحاسبية).',
      keyTakeaways: [
        'معايير التمييز: معيار المضاربة، التداول، والمقاولة.',
        'النتائج القانونية المترتبة على الصفة التجارية وحرية الإثبات.',
      ],
      slidesUrl: 'https://cdn.studyflow.univ/slides/law-lec1.pdf',
      resources: [
        { id: 'res-law-1', name: 'أحكام القانون التجاري الجزائري المحدثة', type: 'pdf', url: '#', size: '4.2 MB' },
      ],
      aiStudyQuestions: [
        { question: 'ما هي أهمية قاعدة حرية الإثبات في المعاملات التجارية مقارنة بالمعاملات المدنية؟', answer: 'تتيح سرعة إبرام الصفقات وحماية الائتمان التجاري دون التقيد بقيود الإثبات الكتابي الصارمة المعمول بها في القانون المدني.' },
      ],
      createdAt: '2026-10-08T10:00:00Z',
    },

    // Lectures for course-fin-mgmt (إدارة مالية)
    {
      id: 'lec-fin-1',
      courseId: 'course-fin-mgmt',
      courseName: 'إدارة مالية',
      title: 'المحاضرة 01: التحليل المالي الوظيفي وإعداد الميزانية المالية',
      week: 1,
      summary: 'تحليل هيكل رأس المال، حساب رأس المال العامل الصافي الإجمالي (FRNG)، واحتياج رأس المال العامل (BFR)، والخزينة الصافية (TN).',
      keyTakeaways: [
        'المعادلة الذهبية للتوازن المالي: TN = FRNG - BFR.',
        'مؤشرات السيولة والربحية ودورها في تقييم الملاءة المالية للمؤسسة.',
      ],
      slidesUrl: 'https://cdn.studyflow.univ/slides/fin-lec1.pdf',
      resources: [
        { id: 'res-fin-1', name: 'دليل حساب المؤشرات والنسب المالية بالنسب المعيارية', type: 'pdf', url: '#', size: '2.9 MB' },
      ],
      aiStudyQuestions: [
        { question: 'ماذا تعني خزينة صافية سالبة (TN < 0) في التحليل المالي؟', answer: 'تعني أن احتياجات تمويل النشاط الاستغلالي تتجاوز الموارد الدائمة المتوفرة، مما يجبر المؤسسة على اللجوء للسحب على المكشوف والقروض المصرفية قصيرة الأجل.' },
      ],
      createdAt: '2026-10-09T11:00:00Z',
    },
  ];

  const posts: CommunityPost[] = [
    {
      id: 'post-official-1',
      authorId: 'user-admin',
      authorName: 'إدارة كلية العلوم الاقتصادية والتجارية وعلوم التسيير',
      authorAvatar: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80',
      authorRole: 'admin',
      isOfficial: true,
      authorBadge: 'إدارة الكلية الرسمية (موثق)',
      category: 'announcement',
      title: 'إعلان رسمي: جدول امتحانات المراقبة المستمرة للفصل الأول 2026/2027',
      content: 'تعلن نيابة العمادة المكلفة بالدراسات والمسائل المرتبطة بالطلبة عن نشر الجداول الرسمية لامتحانات المراقبة المستمرة لجميع الأطوار (ليسانس وماستر). يُرجى من جميع الطلبة الالتزام بالحضور قبل 15 دقيقة من انطلاق الامتحان مع إحضار بطاقة الطالب الوطنية.',
      attachments: [
        {
          type: 'file',
          name: 'الجدول_الرسمي_للامتحانات_السداسي_الأول.pdf',
          url: 'https://cdn.studyflow.univ/docs/exams-s1-2026.pdf',
          size: '1.4 MB',
        },
      ],
      likes: ['user-student-1', 'user-student-2'],
      comments: [
        {
          id: 'c-1',
          authorId: 'user-student-1',
          authorName: 'فوديل كابورة',
          authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          authorRole: 'student',
          text: 'شكراً جزيلاً للإدارة، هل يشمل الجدول مدرجات الامتحانات لطلبة السنة الثالثة إدارة الأعمال؟',
          content: 'شكراً جزيلاً للإدارة، هل يشمل الجدول مدرجات الامتحانات لطلبة السنة الثالثة إدارة الأعمال؟',
          createdAt: '2026-10-14T10:15:00Z',
        },
      ],
      tags: ['إعلان_رسمي', 'امتحانات', 'ليسانس', 'علوم_التسيير'],
      createdAt: '2026-10-14T09:00:00Z',
    },
    {
      id: 'post-internship-1',
      authorId: 'user-admin',
      authorName: 'مكتب التربصات والربط مع المحيط الاقتصادي',
      authorAvatar: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80',
      authorRole: 'admin',
      isOfficial: true,
      authorBadge: 'مكتب التربصات المعتمد (موثق)',
      category: 'internship',
      title: 'فرصة تدريب عملي PFE: بنك التنمية المحلية والمؤسسات المصرفية',
      content: 'فتح باب التقديم لتربصات نهاية التخرج لطلبة السنة الثالثة ليسانس وماستر في تخصصات إدارة الأعمال، المالية، والمحاسبة. مدة التربص 3 أشهر مدفوعة التكاليف مع إمكانية التوظيف المباشر للمتفوقين.',
      attachments: [
        {
          type: 'image',
          name: 'إعلان التربص المصرفي',
          url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',
          size: '620 KB',
        },
      ],
      likes: ['user-student-1'],
      comments: [],
      tags: ['تربصات', 'PFE', 'إدارة_أعمال', 'توظيف'],
      createdAt: '2026-10-13T14:20:00Z',
    },
    {
      id: 'post-event-1',
      authorId: 'user-student-1',
      authorName: 'فوديل كابورة',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      authorRole: 'student',
      isOfficial: false,
      authorBadge: 'مشرف / ممثل الدفعة',
      category: 'event',
      title: 'ملتقى ريادة الأعمال وإدارة المشاريع الناشئة 2026',
      content: 'زميلاتي وزملائي في كلية العلوم الاقتصادية، يسر نادي ريادة الأعمال دعوتكم لحضور الورشة التفاعلية حول إعداد نموذج العمل التجاري BMC ومخططات إدارة المشاريع في قاعة المؤتمرات الكبرى يوم الأربعاء القادم.',
      attachments: [],
      likes: ['user-student-2'],
      comments: [],
      tags: ['فعاليات', 'ريادة_الأعمال', 'ورشات_عمل'],
      createdAt: '2026-10-13T16:45:00Z',
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      userId: 'user-student-1',
      title: 'إعلان رسمي جديد',
      message: 'نشرت إدارة الكلية جدول امتحانات المراقبة المستمرة للفصل الأول.',
      type: 'official_announcement',
      targetId: 'post-official-1',
      isRead: false,
      createdAt: '2026-10-14T09:05:00Z',
    },
    {
      id: 'notif-2',
      userId: 'user-student-1',
      title: 'محاضرة دراسية جديدة',
      message: 'أضاف أ/ قبايلي ملخص المحاضرة 02 في مقياس إدارة المشاريع (تقنيات الجدولة CPM/PERT).',
      type: 'new_lecture',
      targetId: 'lec-pm-2',
      isRead: false,
      createdAt: '2026-10-14T09:35:00Z',
    },
  ];

  const users: (User & { passwordHash: string; salt: string })[] = [
    {
      id: 'user-student-1',
      name: 'فوديل كابورة',
      email: 'fodilkaboura1@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'student',
      specialtyId: 'spec-management',
      specialtyName: 'إدارة الأعمال (علوم التسيير)',
      levelId: 'lvl-l3',
      levelName: 'ليسانس / السنة الثالثة',
      bio: 'طالب سنة ثالثة ليسانس في إدارة الأعمال وعلوم التسيير — جامعة عبد الحميد بن باديس مستغانم.',
      verified: true,
      badge: 'مشرف',
      privacySettings: {
        showEmail: true,
        showSpecialty: true,
        allowDirectMessages: true,
      },
      followingIds: ['user-student-2', 'user-admin'],
      savedPostIds: ['post-official-1', 'post-internship-1'],
      salt: salt1,
      passwordHash: hashPassword('student123', salt1),
    },
    {
      id: 'user-admin',
      name: 'إدارة كلية العلوم الاقتصادية والتجارية وعلوم التسيير',
      email: 'admin@univ-alger.dz',
      avatar: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      specialtyId: 'spec-management',
      specialtyName: 'إدارة الكلية والأقسام الأكاديمية',
      levelId: 'lvl-l3',
      levelName: 'العمادة والشؤون البيداغوجية',
      bio: 'الحساب الرسمي المعتمد لنيابة العمادة للدراسات والشؤون الطلابية بكلية العلوم الاقتصادية وعلوم التسيير.',
      verified: true,
      badge: 'إدارة الكلية الرسمية (موثق)',
      privacySettings: {
        showEmail: true,
        showSpecialty: true,
        allowDirectMessages: false,
      },
      followingIds: [],
      savedPostIds: [],
      salt: salt2,
      passwordHash: hashPassword('admin123', salt2),
    },
    {
      id: 'user-student-2',
      name: 'سارة بلقاسم',
      email: 'sara.b@univ.dz',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'student',
      specialtyId: 'spec-management',
      specialtyName: 'إدارة الأعمال (علوم التسيير)',
      levelId: 'lvl-l3',
      levelName: 'ليسانس / السنة الثالثة',
      bio: 'زميلة دفعة في إدارة الأعمال، مهتمة بإدارة الموارد البشرية والتحول الرقمي للمؤسسات.',
      verified: true,
      badge: 'طالبة متميزة',
      privacySettings: {
        showEmail: false,
        showSpecialty: true,
        allowDirectMessages: true,
      },
      followingIds: ['user-student-1', 'user-admin'],
      savedPostIds: [],
      salt: salt3,
      passwordHash: hashPassword('student123', salt3),
    },
  ];

  const tokens = new Map<string, string>();
  tokens.set('token-fodil-student', 'user-student-1');
  tokens.set('token-admin-official', 'user-admin');

  return {
    users,
    specialties,
    levels,
    courses,
    lectures,
    posts,
    notifications,
    tokens,
  };
}

export const db = createDatabase();
