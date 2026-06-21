# ملخص واجهة المستخدم (UI Summary)

هذا المستند يلخص التصميم البصري ونظام المكونات الجمالية الخاص بمنصة الأحياء التعليمية. تم تصميم المنصة باتباع فلسفة التصميم الحديثة لتوفر تجربة مستخدم فاخرة وجذابة تدعم اللغتين وتعتمد التنسيق العربي الافتراضي (RTL).

---

## 🎨 نظام التصميم والألوان (Design System & Color Palette)

تعتمد المنصة على نمط الألوان الداكن الفاخر (Premium Midnight Theme) مع لمسات لونية مشعة وجذابة لتمييز العناصر الهامة:

| العنصر | اللون المعتمد (Hex) | الوظيفة البصرية |
| :--- | :--- | :--- |
| **الخلفية الأساسية (Base Background)** | `#0F1623` | لون داكن عميق للصفحات لتقليل إجهاد العين |
| **البطاقات والحاويات (Containers/Cards)** | `#1A2235` | لون أفتح قليلاً لإبراز البطاقات والمكونات البصرية |
| **اللون الثانوي المميز (Accent Gold)** | `#FBBF24` | يُسخدم للروابط الأساسية وأزرار التفاعل الهامة والتنبيهات |
| **لون التنافس والجوائز (Lime/Neon Green)** | `#C0E838` | مخصص لقسم "ذاكر واكسب" والتحفيز |
| **لون النجاح والتقدم (Emerald)** | `#10B981` | لإبراز حالة إكمال الدروس والأسعار المجانية |
| **التذييل (Footer)** | `#06333c` | لون أخضر زيتي غامق يمنح توازناً بصرياً دافئاً |

---

## ✍️ الخطوط والطباعة (Typography)

* **الخط الأساسي:** يتم تحميل خطوط مثل **Geist** كخط افتراضي مدعوماً بخطوط عربية تناسب القراءة الأكاديمية.
* **الخطوط الفنية:**
  * **Badeen Display:** يُستخدم للعناوين الجذابة مثل عنوان قسم "ذاكر واكسب" لإعطاء طابع بصري فريد.
  * **Georgia/Serif:** يُستخدم بلمسات مائلة وخفيفة لبعض الكلمات المفتاحية في الصفحة الرئيسية (مثل كلمة "الأحياء").

---

## 🖥️ هيكل صفحات واجهة المستخدم (Page-by-Page UI Breakdown)

### 1. الصفحة الرئيسية (Home Page - `/`)
* **شريط التنقل (Navbar):**
  * تصميم زجاجي ضبابي (Frosted Glass Effect) يتأثر بالتمرير.
  * يحتوي على شعار المنصة "احمد سعد" على اليمين وروابط الدخول/الملف الشخصي على اليسار.
* **قسم الواجهة الرئيسي (Scroll Video Hero):**
  * خلفية تفاعلية مدفوعة بحركة التمرير.
  * عنوان رئيسي كبير بخطوط متباينة ووصف الكورسات.
  * بطاقة إحصائيات تفاعلية متحركة (Micro-animations) تعرض عدد الكورسات المنشورة واقتباس ملهم للمستر.
* **قسم التنافس والجوائز (Study & Win):**
  * تصميم غير تقليدي يحتوي على صورة مائلة ومحاطة بإطار نيون متحرك وخلفية دائرية منحنية لكسر جمود التصميم التقليدي.
* **بطاقات اختيار الصف الدراسي (Grade Selection Grid):**
  * بطاقات تفاعلية للصف الأول والثاني والثالث الثانوي.
  * تتضمن الصور التعبيرية ومؤشرات تفاعلية تتلون عند مرور مؤشر الفأرة (Hover States).
* **قسم المنهجية والخطوات (Methodology Section):**
  * تصميم يعرض خطوات الدراسة بصورة مبسطة بلمسات الخط الرقمي أحادي المسافة (Mono).
* **التذييل (Footer):**
  * شريط يضم روابط التواصل الاجتماعي (فيسبوك، تيك توك، يوتيوب، ومجموعة التفاعل).
  * بطاقة حقوق وتطوير تحمل لمسات برمجية تكريمية للمطورين.

---

### 2. دليل الكورسات (Courses Directory - `/courses`)
* تصفية سريعة وسلسة بين الصفوف الدراسية الثلاثة عبر أزرار تصفية دائرية.
* بطاقات شبكية (Grid Layout) تعرض تفاصيل الكورسات، السعر (مجاني/مدفوع)، وزر الاشتراك التفاعلي.

---

### 3. صفحة محتوى الكورس (Course Details - `/courses/[id]`)
* تصميم يعتمد على مسار تنقل مرئي (Breadcrumb navigation).
* بطاقة غلاف الكورس بالأبعاد العريضة (Banner Layout).
* قائمة الدروس بتصميم بطاقات أفقية متناسقة ومؤشرات لحالة المشاهدة والاشتراك.

---

### 4. نافذة عرض الدروس والتعلم (Interactive Lesson Viewer)
* **المشغل الذكي (Custom Video Player):**
  * مشغل فيديو مبني خصيصاً للمنصة لحماية المحتوى يمنع النقر الأيمن ويدمج أكواد حظر الفحص (Developer Inspect Blocking).
  * لوحة تحكم مخصصة بالكامل تتيح التحكم في سرعة التشغيل (من 1x إلى 3x)، كتم الصوت، ووضع ملء الشاشة.
* **شريط التقدم البصري (Course Progress Bar):**
  * يعرض نسبة مئوية تفاعلية للإنجاز تتأثر تلقائياً بمجرد إكمال الدرس.
* **شريط الدروس الجانبي (Lessons Sidebar):**
  * يتيح التنقل السلس بين الدروس ويضع علامة صح (`✓`) خضراء بجانب الدروس المكتملة.

---

### 5. صفحة الدفع والاشتراك (Manual Billing/Payment - `/courses/[id]/payment`)
* بطاقة ملخص الطلب مع السعر بالجنيه المصري.
* خطوات دفع واضحة للمحفظة الإلكترونية (فودافون كاش) مع زر نسخ فوري للرقم.
* زر توجيه فوري للمحادثة المباشرة على واتساب لإرسال لقطة الشاشة وتأكيد الاشتراك.

---

## 🛠️ تفاصيل الأمان وحماية المحتوى بالواجهة (Anti-Inspect & Obfuscation)
* **تشفير المسارات:** يتم تشفير روابط الفيديو القادمة من قاعدة البيانات بترميز Base64 وفك تشفيرها على مستوى العميل لمنع استخراج الروابط المباشرة من تفاصيل الصفحة (Inspect Source).
* **hجب الفحص والأزرار:** مدمج بالواجهة ملف استماع للأحداث (Event Listeners) لمنع تفعيل قائمة الزر الأيمن واختصارات لوحة المفاتيح الشهيرة بالفحص مثل `F12` و `Ctrl+Shift+I`.

---

# UI Summary (English version)

This document outlines the visual layout, components, and design system of the biology education platform. The site uses a responsive RTL design optimized for high school students.

## 🎨 Theme & Palette
* **Theme:** Premium Midnight (sleek dark mode).
* **Base Color:** Deep Slate `#0F1623` & `#1A2235`.
* **Accent Gold:** `#FBBF24` for CTAs and highlighted interactions.
* **Gamification Green:** `#C0E838` for "Study & Win" section.
* **Emerald Success:** `#10B981` for lesson completion.
* **Footer Teal:** `#06333c` for structural visual balance.

## 🖥️ Layout Sections
1. **Home (`/`):** Custom scroll video hero, interactive stats display, grade cards (1st, 2nd, 3rd secondary years), methodology steps, and social-focused footer.
2. **Courses Directory (`/courses`):** Custom grade filters, responsive grid course cards with price status.
3. **Course Hub (`/courses/[id]`):** Details, banner headers, list of curriculum lessons.
4. **Lesson Hub (`/courses/[id]/lessons/[lessonId]`):** Sidebar course navigator, visual progress bar, custom video controller with inspect deterrents, Base64 obfuscated source decoding, and manual/auto lesson completion triggers.
5. **Payment flow (`/courses/[id]/payment`):** Mobile wallet payment instruction card with copy action, dynamic link to WhatsApp helper support chat.
