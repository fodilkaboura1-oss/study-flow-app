# دليل بناء وتشغيل تطبيق Android المستقل — StudyFlow

تطبيق **StudyFlow** هو تطبيق أندرويد حقيقي مستقل مبني باستخدام **Kotlin** و **Jetpack Compose (Material3)**، ويتصل مباشرة وبشكل آمن بالخادم الخلفي لمنصة StudyFlow AI الحالية عبر واجهات REST API مشفرة.

---

## 1. البنية المعمارية للربط (Architecture & Data Flow)

```
[ تطبيق أندرويد StudyFlow ]  <--- (Retrofit 2 / HTTPS / Bearer Token) --->  [ خادم StudyFlow AI الخلفي ]
        |                                                                           |
        |---> شريط التنقل السفلي (Bottom Navigation)                                |---> قاعدة البيانات المشتركة (المواد، المحاضرات، المستخدمون)
        |---> الأخبار الرسمية وإعلانات الإدارة الموثقة                                |---> المساعد الذكي الأكاديمي (Gemini 2.5 Flash)
        |---> مجتمع الطلاب (منشورات، تعليقات، إعجاب، تربصات)                        |---> نظام التحقق وصلاحيات الإدارة الموثقة
        |---> قسم الدراسة والمحاضرات (مفصولة بدقة حسب التخصص والمستوى)
```

- **نفس حساب الطالب:** الطالب يسجل دخوله بنفس البريد الإلكتروني وكلمة المرور دون تكرار أو قواعد بيانات منفصلة.
- **تزامن حقيقي:** أي منشور أو إعلان يتم نشره من المنصة أو من التطبيق يظهر مباشرة للطرف الآخر فوراً.
- **حماية الإعلانات الرسمية:** فقط الحسابات الإدارية الموثقة (`role = 'admin'` و `verified = true`) تمتلك صلاحية نشر الإعلانات الرسمية (`announcement`) مع ظهور شارة التوثيق المعتمدة.

---

## 2. متطلبات بيئة البناء والتطوير

1. **Android Studio**: إصدار Hedgehog أو Iguana أو أحدث.
2. **JDK**: الإصدار 17 (Java Development Kit 17).
3. **Android SDK**: Compile SDK 34 / Min SDK 26.

---

## 3. خطوات بناء ملف الـ APK وتجربته

### الخطوة 1: ضبط عنوان الخادم (Server BASE_URL)
افتح الملف التالي:
`android/app/src/main/java/dz/studyflow/app/network/StudyFlowApiService.kt`

عدل متغير `BASE_URL`:
- **للتجربة عبر محاكي الأندرويد (Android Emulator):**
  ```kotlin
  const val BASE_URL = "http://10.0.2.2:3000/api/"
  ```
- **للتجربة على هاتف حقيقي عبر شبكة Wi-Fi:**
  ```kotlin
  const val BASE_URL = "http://192.168.1.X:3000/api/" // استبدل X بـ IP حاسوبك
  ```
- **للخادم السحابي المنشور (Production / Cloud Run):**
  ```kotlin
  const val BASE_URL = "https://your-domain.run.app/api/"
  ```

---

### الخطوة 2: فتح المشروع في Android Studio
1. افتح Android Studio واختر **Open**.
2. حدد المجلد `/android` الموجود في جذر المشروع.
3. انتظر حتى يكتمل مزامنة Gradle (Gradle Sync).

---

### الخطوة 3: بناء الـ APK (Build APK)
يمكنك بناء الـ APK بإحدى الطريقتين:

#### الطريقة أ: عبر واجهة Android Studio
- من القائمة العلوية: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
- بعد انتهاء البناء، ستظهر رسالة تنبيه منبثقة تفيدك باكتمال الـ APK مع زر `locate` لفتح مجلد الملف.

#### الطريقة ب: عبر سطر الأوامر (Terminal)
من داخل مجلد `android`:
```bash
# لنظام Linux / macOS:
./gradlew assembleDebug

# لنظام Windows:
gradlew.bat assembleDebug
```

ستجد ملف الـ APK الناتج في المسار:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

### الخطوة 4: تثبيت الـ APK على الهاتف المحمول
1. صل الهاتف بالكمبيوتر عبر كابل USB وفعل **تصحيح أخطاء USB (USB Debugging)**.
2. نفذ الأمر:
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```
3. أو انسخ ملف `app-debug.apk` مباشرة إلى ذاكرة هاتفك وافتحه لتثبيته.

---

## 4. واجهات API المستخدمة بين المنصة والتطبيق

| المسار (Endpoint) | الطريقة | الوصف والوظيفة |
| :--- | :--- | :--- |
| `/api/auth/login` | `POST` | تسجيل دخول موحد بالبريد وكلمة المرور وتوليد رمز Bearer token |
| `/api/auth/me` | `GET` | جلب الملف الشخصي للطالب، التخصص، المستوى، والمنشورات المحفوظة |
| `/api/academic/courses` | `GET` | جلب المقاييس المعتمدة لتخصص ومستوى الطالب فقط |
| `/api/academic/lectures` | `GET` | جلب المحاضرات والملخصات الخاصة بمقياس معين دون اختلاط |
| `/api/community/posts` | `GET` | جلب آخر الأخبار، الإعلانات الموثقة، التربصات، والهاكاثونات |
| `/api/community/posts` | `POST` | نشر منشور جديد (يتحقق الخادم من صلاحيات الإدارة في حال كان إعلاناً رسمياً) |
| `/api/community/posts/:id/like` | `POST` | تسجيل الإعجاب وتحديث التفاعل فورياً |
| `/api/community/posts/:id/comment` | `POST` | إضافة تعليق وإرسال إشعار لصاحب المنشور |
| `/api/notifications` | `GET` | جلب إشعارات الإعلانات، المحاضرات الجديدة، والتفاعلات |
| `/api/ai/study-assistant` | `POST` | مساعد الدراسة الذكي المدعوم بـ Gemini لتقديم ملخصات وأسئلة تدريبية |
