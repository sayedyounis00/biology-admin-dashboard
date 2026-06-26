import { useState, useMemo, useEffect } from "react";
import { supabase } from "../supabase";
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Send,
  User,
  TrendingDown,
  CalendarX,
  BookOpenCheck,
  Search,
  X,
  GraduationCap,
  Calendar,
  AlertCircle
} from "lucide-react";

const initialStudents = [
  {
    id: 1,
    name: "أحمد محمد علي",
    warningType: "غياب متكرر",
    typeKey: "غياب",
    reason: "غاب 5 مرات متتالية في الأسبوعين الأخيرين",
    severity: "high",
    warningSent: false,
    coursesEnrolled: ["كورس الأحياء العام", "كورس الكيمياء العضوية"],
    grade: "الصف الثالث الثانوي",
    avatarColor: "bg-red-500/20 text-red-400 border-red-500/30",
    email: "ahmed.ali@gmail.com",
    phone: "01012345678"
  },
  {
    id: 2,
    name: "سارة عبد الرحمن",
    warningType: "تراجع في الأداء",
    typeKey: "أداء",
    reason: "انخفضت درجات الاختبارات القصيرة من 92% إلى 68%",
    severity: "high",
    warningSent: false,
    coursesEnrolled: ["كورس الأحياء العام"],
    grade: "الصف الثالث الثانوي",
    avatarColor: "bg-red-500/20 text-red-400 border-red-500/30",
    email: "sara.rahman@gmail.com",
    phone: "01198765432"
  },
  {
    id: 3,
    name: "يوسف محمود القاضي",
    warningType: "لم يكمل الكورس",
    typeKey: "إتمام",
    reason: "لم يكمل أي حصة في كورس الأحياء منذ 18 يوماً",
    severity: "medium",
    warningSent: false,
    coursesEnrolled: ["كورس الأحياء العام", "كورس الفيزياء الحديثة"],
    grade: "الصف الثالث الثانوي",
    avatarColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    email: "youssef.qadi@gmail.com",
    phone: "01234567890"
  },
  {
    id: 4,
    name: "منى السيد الشريف",
    warningType: "غياب متكرر",
    typeKey: "غياب",
    reason: "غابت عن حضور البث المباشر 3 مرات هذا الشهر",
    severity: "medium",
    warningSent: false,
    coursesEnrolled: ["كورس الكيمياء العضوية"],
    grade: "الصف الثاني الثانوي",
    avatarColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    email: "mona.sherif@gmail.com",
    phone: "01543210987"
  },
  {
    id: 5,
    name: "خالد سعيد البحيري",
    warningType: "تراجع في الأداء",
    typeKey: "أداء",
    reason: "تراجع متوسط تقييم الواجبات اليومية بنسبة 25%",
    severity: "low",
    warningSent: false,
    coursesEnrolled: ["كورس الفيزياء الحديثة"],
    grade: "الصف الثاني الثانوي",
    avatarColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    email: "khaled.behairy@gmail.com",
    phone: "01087654321"
  },
  {
    id: 6,
    name: "فاطمة عمر الصاوي",
    warningType: "لم يكمل الكورس",
    typeKey: "إتمام",
    reason: "لم يكمل اختبار الفصل الأول بالرغم من مشاهدة الدروس",
    severity: "low",
    warningSent: false,
    coursesEnrolled: ["كورس الأحياء العام"],
    grade: "الصف الأول الثانوي",
    avatarColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    email: "fatima.sawy@gmail.com",
    phone: "01287654321"
  }
];

export default function EarlyWarningSystem({ onViewProfile }) {
  const [dummyStudents, setDummyStudents] = useState(initialStudents);
  const [liveStudents, setLiveStudents] = useState([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Base sent count + actual sent warnings in session
  const [sessionSentCount, setSessionSentCount] = useState(0);
  const baseSentCount = 14;

  const students = isLiveMode ? liveStudents : dummyStudents;

  const handleSendWarning = (id) => {
    const updateSent = (prev) =>
      prev.map(student => {
        if (student.id === id && !student.warningSent) {
          setSessionSentCount(c => c + 1);
          return { ...student, warningSent: true };
        }
        return student;
      });

    if (isLiveMode) {
      setLiveStudents(updateSent);
    } else {
      setDummyStudents(updateSent);
    }
  };

  const fetchLiveWarnings = async () => {
    setIsLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*");
      if (profilesError) throw profilesError;

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("*");
      if (enrollmentsError) throw enrollmentsError;

      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*");
      if (coursesError) throw coursesError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*");
      if (lessonsError) throw lessonsError;

      const { data: progressData, error: progressError } = await supabase
        .from("lesson_progress")
        .select("*");
      if (progressError) throw progressError;

      let yearsMap = new Map();
      try {
        const { data: yearsData } = await supabase
          .from("years")
          .select("*");
        if (yearsData) {
          yearsData.forEach((y) => yearsMap.set(y.id, y.title));
        }
      } catch (err) {
        console.warn("Could not load years table, falling back:", err);
      }

      const warnings = [];

      profilesData?.forEach((profile) => {
        const studentEnrollments = enrollmentsData?.filter(e => e.user_id === profile.id) || [];
        const studentCourses = studentEnrollments.map(se => {
          const c = coursesData?.find(course => course.id === se.course_id);
          return c ? c.title : "";
        }).filter(Boolean);

        const enrolledCourseIds = studentEnrollments.map(se => se.course_id);

        const courseLessons = lessonsData?.filter(l => enrolledCourseIds.includes(l.course_id)) || [];
        const totalLessons = courseLessons.length;

        const completedLessons = progressData?.filter(p => p.user_id === profile.id && p.completed) || [];
        const completedCount = completedLessons.length;

        const completionRate = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

        let lastActiveDate = profile.created_at ? new Date(profile.created_at) : new Date();
        if (completedLessons.length > 0) {
          const dates = completedLessons
            .map(p => p.completed_at ? new Date(p.completed_at).getTime() : 0)
            .filter(Boolean);
          if (dates.length > 0) {
            lastActiveDate = new Date(Math.max(...dates));
          }
        }

        const daysSinceLastActive = Math.floor((Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));

        let isAtRisk = false;
        let warningType = "غياب متكرر";
        let typeKey = "غياب";
        let reason = "";
        let severity = "low";

        if (daysSinceLastActive >= 5 && studentEnrollments.length > 0) {
          isAtRisk = true;
          warningType = "غياب متكرر";
          typeKey = "غياب";
          reason = `غاب عن المنصة ولم يسجل أي نشاط منذ ${daysSinceLastActive} أيام`;
          severity = daysSinceLastActive >= 10 ? "high" : "medium";
        }
        else if (studentEnrollments.length > 0 && completionRate < 35 && totalLessons >= 2) {
          isAtRisk = true;
          warningType = "تراجع في الأداء";
          typeKey = "أداء";
          reason = `نسبة إنجاز المحاضرات منخفضة جداً (${Math.round(completionRate)}% من أصل ${totalLessons} درس)`;
          severity = completionRate < 15 ? "high" : "medium";
        }
        else if (studentEnrollments.length > 0 && completionRate >= 35 && completionRate < 85 && daysSinceLastActive >= 3) {
          isAtRisk = true;
          warningType = "لم يكمل الكورس";
          typeKey = "إتمام";
          reason = `لم يستكمل مشاهدة كورس الأحياء وتوقف عند نسبة ${Math.round(completionRate)}% منذ ${daysSinceLastActive} أيام`;
          severity = "low";
        }
        else if (studentEnrollments.length === 0) {
          const daysRegistered = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));
          if (daysRegistered >= 4) {
            isAtRisk = true;
            warningType = "لم يكمل الكورس";
            typeKey = "إتمام";
            reason = `سجل حسابه منذ ${daysRegistered} أيام ولكنه لم يشترك في أي كورس حتى الآن`;
            severity = "medium";
          }
        }

        if (isAtRisk) {
          const colors = [
            "bg-red-500/20 text-red-400 border-red-500/30",
            "bg-amber-500/20 text-amber-400 border-amber-500/30",
            "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          ];
          const avatarColor = severity === "high" ? colors[0] : severity === "medium" ? colors[1] : colors[2];
          const gradeId = profile.current_year_id || profile.year_id;
          const gradeTitle = yearsMap.get(gradeId) || "الصف الثالث الثانوي";

          warnings.push({
            id: profile.id,
            name: profile.full_name || "طالب بدون اسم",
            warningType,
            typeKey,
            reason,
            severity,
            warningSent: false,
            coursesEnrolled: studentCourses.length > 0 ? studentCourses : ["غير مسجل بكورسات"],
            grade: gradeTitle,
            avatarColor,
            email: profile.email || "لا يوجد بريد إلكتروني",
            phone: profile.phone || "لا يوجد هاتف"
          });
        }
      });

      setLiveStudents(warnings);
    } catch (error) {
      console.error("Error loading live warning data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLiveMode) {
      fetchLiveWarnings();
    }
  }, [isLiveMode]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesFilter = activeFilter === "الكل" || student.typeKey === activeFilter;
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.reason.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [students, activeFilter, searchTerm]);

  const stats = useMemo(() => {
    const totalAtRisk = students.length;
    const highSeverityCount = students.filter(s => s.severity === "high").length;
    const totalWarningsSent = baseSentCount + sessionSentCount;

    return {
      totalAtRisk,
      highSeverityCount,
      totalWarningsSent
    };
  }, [students, sessionSentCount]);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "high":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            خطورة عالية
          </span>
        );
      case "medium":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            خطورة متوسطة
          </span>
        );
      case "low":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            خطورة منخفضة
          </span>
        );
    }
  };

  const getWarningIcon = (typeKey) => {
    switch (typeKey) {
      case "غياب":
        return <CalendarX className="w-4 h-4" />;
      case "أداء":
        return <TrendingDown className="w-4 h-4" />;
      case "إتمام":
        return <BookOpenCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full text-gray-100" dir="rtl">
      {/* Container with Dark Navy Sidebar Style Background */}
      <div className="bg-[#1A2035] rounded-3xl border border-white/5 p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle Ambient Background Light */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f5a623]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6 relative z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-[#F0EDE6] tracking-tight flex items-center gap-3">
              <AlertTriangle className="text-[#f5a623] w-7 h-7" />
              نظام الإنذار المبكر للطلاب
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              متابعة تلقائية للطلاب المعرضين للتعثر الدراسي أو الغياب لاتخاذ إجراءات وقائية سريعة.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300 cursor-pointer ${
                isLiveMode
                  ? "bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30 hover:border-[#f5a623]/50 shadow-[0_0_15px_rgba(245,166,35,0.1)]"
                  : "bg-transparent text-gray-400 border-white/5 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isLiveMode ? "bg-[#f5a623] animate-pulse" : "bg-gray-500"}`} />
              <span>{isLiveMode ? "الوضع الحي (قاعدة البيانات)" : "الوضع التجريبي (بيانات محاكاة)"}</span>
            </button>
          </div>
        </div>

        {/* 1. Summary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
          {/* Card 1: Total at-risk students */}
          <div className="bg-[#121829] rounded-2xl border border-white/5 p-5 flex items-center justify-between transition-all duration-300 hover:border-amber-500/20 group">
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-1">الطلاب المعرضون للخطر</p>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">{stats.totalAtRisk} طلاب</h3>
              <p className="text-xs text-gray-500 mt-1">مستحقين للمتابعة العاجلة</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-[#f5a623] border border-amber-500/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: High severity count */}
          <div className="bg-[#121829] rounded-2xl border border-white/5 p-5 flex items-center justify-between transition-all duration-300 hover:border-red-500/20 group">
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-1">حالات شديدة الخطورة</p>
              <h3 className="text-3xl font-extrabold text-red-500 tracking-tight">{stats.highSeverityCount} حالات</h3>
              <p className="text-xs text-red-500/60 mt-1">تتطلب تنبيهاً فورياً</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Warnings sent this week */}
          <div className="bg-[#121829] rounded-2xl border border-white/5 p-5 flex items-center justify-between transition-all duration-300 hover:border-emerald-500/20 group">
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-1">التنبيهات المرسلة هذا الأسبوع</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 tracking-tight">{stats.totalWarningsSent} تنبيه</h3>
              <p className="text-xs text-emerald-400/60 mt-1">تم التواصل مع أولياء الأمور</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 2. Filter Bar and Search */}
        <div className="bg-[#121829] rounded-2xl border border-white/5 p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          {/* Tabs Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {["الكل", "غياب", "أداء", "إتمام"].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border cursor-pointer ${activeFilter === filter
                    ? "bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30 shadow-[0_0_15px_rgba(245,166,35,0.1)]"
                    : "bg-transparent text-gray-400 border-white/5 hover:text-white hover:bg-white/5"
                  }`}
              >
                {filter === "الكل" ? "الكل" : filter === "غياب" ? "تنبيهات الغياب" : filter === "أداء" ? "تنبيهات الأداء" : "تنبيهات الإتمام"}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="البحث باسم الطالب أو السبب..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A2035] border border-white/5 rounded-xl py-2.5 pr-10 pl-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all duration-300"
            />
            <Search className="w-4 h-4 text-gray-500 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* 3. Warning Cards List */}
        <div className="relative z-10">
          {isLoading ? (
            <div className="text-center py-20 bg-[#121829] rounded-2xl border border-white/5 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#f5a623] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-sm font-medium">جاري جلب بيانات الطلاب وتحليل مستويات المخاطر...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  className="bg-[#121829] rounded-2xl border border-white/5 p-5 flex flex-col justify-between transition-all duration-300 hover:border-white/10 hover:shadow-xl group"
                >
                  <div>
                    {/* Card Top: Avatar and Status Badge */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        {/* Initials-based Avatar */}
                        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold text-sm shadow-inner ${student.avatarColor}`}>
                          {student.name.split(" ").slice(0, 2).map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h4 className="font-bold text-white group-hover:text-[#f5a623] transition-colors duration-300">
                            {student.name}
                          </h4>
                          <span className="text-gray-500 text-xs">{student.grade}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {getSeverityBadge(student.severity)}
                      </div>
                    </div>

                    {/* Warning Type Badge */}
                    <div className="mb-3 flex">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#1A2035] text-amber-400 border border-amber-500/10">
                        {getWarningIcon(student.typeKey)}
                        {student.warningType}
                      </span>
                    </div>

                    {/* Auto-generated Reason */}
                    <p className="text-sm text-gray-300 mb-6 bg-[#1A2035]/50 border border-white/5 p-3 rounded-xl leading-relaxed">
                      {student.reason}
                    </p>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-3 border-t border-white/5 pt-4 mt-auto">
                    {/* Action 1: Send Warning */}
                    <button
                      onClick={() => handleSendWarning(student.id)}
                      disabled={student.warningSent}
                      className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${student.warningSent
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                          : "bg-gradient-to-l from-[#f5a623] to-amber-600 text-[#0F1623] hover:from-amber-400 hover:to-amber-500 hover:shadow-[0_4px_15px_rgba(245,166,35,0.15)] active:scale-[0.98]"
                        }`}
                    >
                      {student.warningSent ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>تم الإرسال</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>إرسال تنبيه</span>
                        </>
                      )}
                    </button>

                    {/* Action 2: View Profile */}
                    <button
                      onClick={() => {
                        if (onViewProfile) {
                          onViewProfile(student.id);
                        } else {
                          setSelectedStudent(student);
                        }
                      }}
                      className="py-2.5 px-4 bg-[#1A2035] hover:bg-[#232a44] border border-white/5 hover:border-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>عرض الملف</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#121829] rounded-2xl border border-white/5">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">
                {isLiveMode ? "جميع الطلاب في وضع ممتاز! لا توجد إنذارات نشطة" : "لا توجد حالات مطابقة للبحث"}
              </h3>
              <p className="text-gray-400 text-sm">
                {isLiveMode 
                  ? "جميع الطلاب المسجلين بالمنصة يتفاعلون ويكملون محاضراتهم بشكل طبيعي حالياً." 
                  : "جرب اختيار تصنيف آخر أو تعديل عبارة البحث."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Student Profile Modal Drawer */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/75 z-50 flex justify-end backdrop-blur-sm"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="w-full max-w-md bg-[#1A2035] h-full border-r border-white/5 p-6 flex flex-col justify-between shadow-2xl animate-slide-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <GraduationCap className="text-[#f5a623] w-6 h-6" />
                  ملف الطالب الأكاديمي
                </h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-8 h-8 rounded-lg bg-[#121829] hover:bg-white/5 border border-white/5 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student Profile Info */}
              <div className="flex flex-col items-center text-center gap-3 mb-6 bg-[#121829] border border-white/5 p-5 rounded-2xl">
                <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center text-3xl font-black shadow-inner ${selectedStudent.avatarColor}`}>
                  {selectedStudent.name.split(" ").slice(0, 2).map(n => n[0]).join("")}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedStudent.name}</h4>
                  <p className="text-xs text-[#f5a623] font-semibold mt-0.5">{selectedStudent.grade}</p>
                </div>
              </div>

              {/* Detailed Specs */}
              <div className="space-y-4">
                <div className="bg-[#121829] border border-white/5 p-4 rounded-xl space-y-3">
                  <h5 className="text-xs font-bold text-gray-400 border-b border-white/5 pb-2 mb-2">بيانات الاتصال</h5>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">البريد الإلكتروني:</span>
                    <span className="text-gray-200 font-medium select-all" style={{ direction: 'ltr' }}>{selectedStudent.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">رقم الهاتف:</span>
                    <span className="text-gray-200 font-medium select-all">{selectedStudent.phone}</span>
                  </div>
                </div>

                <div className="bg-[#121829] border border-white/5 p-4 rounded-xl space-y-3">
                  <h5 className="text-xs font-bold text-gray-400 border-b border-white/5 pb-2 mb-2">الوضع الأكاديمي الحالي</h5>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">الكورسات المسجلة:</span>
                    <span className="text-gray-200 font-semibold">{selectedStudent.coursesEnrolled.length} كورسات</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedStudent.coursesEnrolled.map((course, idx) => (
                      <span key={idx} className="bg-[#1A2035] border border-white/5 text-gray-300 text-xs px-2.5 py-1 rounded-lg">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#121829] border border-white/5 p-4 rounded-xl space-y-2">
                  <h5 className="text-xs font-bold text-gray-400 border-b border-white/5 pb-2 mb-2">تفاصيل حالة الإنذار</h5>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">نوع الإنذار:</span>
                    <span className="text-amber-400 font-semibold">{selectedStudent.warningType}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">مستوى الخطورة:</span>
                    {getSeverityBadge(selectedStudent.severity)}
                  </div>
                  <p className="text-xs text-red-400/80 bg-red-500/5 border border-red-500/10 p-3 rounded-lg mt-2 leading-relaxed">
                    <span className="font-bold">ملاحظة النظام:</span> {selectedStudent.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 border-t border-white/5 pt-4">
              <button
                onClick={() => {
                  handleSendWarning(selectedStudent.id);
                  setSelectedStudent(null);
                }}
                disabled={selectedStudent.warningSent}
                className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${selectedStudent.warningSent
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                    : "bg-gradient-to-l from-[#f5a623] to-amber-600 text-[#0F1623] hover:from-amber-400 hover:to-amber-500 hover:shadow-[0_4px_15px_rgba(245,166,35,0.15)]"
                  }`}
              >
                {selectedStudent.warningSent ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>تم إرسال التنبيه بالفعل</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>إرسال تنبيه الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
