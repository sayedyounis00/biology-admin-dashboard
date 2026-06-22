import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  LayoutDashboard, 
  BookOpen, 
  Edit3, 
  Users, 
  CreditCard, 
  BarChart3, 
  Database, 
  TrendingUp, 
  Plus, 
  RefreshCw, 
  GraduationCap, 
  DollarSign, 
  ArrowUpRight, 
  Sparkles,
  Search,
  BookOpenCheck,
  X,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  FileText,
  Video,
  UserPlus,
  Award,
  CheckCircle,
  Circle,
  Phone,
  Mail,
  Calendar,
  Layers
} from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dbConnected, setDbConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- LIVE DATABASE STATES ---
  const [liveCourses, setLiveCourses] = useState([]);
  const [liveCourseRequests, setLiveCourseRequests] = useState([]);
  const [liveStudents, setLiveStudents] = useState([]);
  const [liveEnrollments, setLiveEnrollments] = useState([]);
  const [liveLessons, setLiveLessons] = useState([]);
  const [liveLessonProgress, setLiveLessonProgress] = useState([]);
  const [liveEnrollmentCounts, setLiveEnrollmentCounts] = useState({});
  const [years, setYears] = useState([]);
  const [liveStats, setLiveStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
    recentSignups: [],
    recentEnrollments: [],
    chartData: []
  });

  // --- TAB-SPECIFIC FILTER & INTERACTION STATES ---
  // Courses search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    title: '',
    description: '',
    year_id: '',
    price: 0,
    thumbnail_url: ''
  });

  // Students search/filter
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentGradeFilter, setStudentGradeFilter] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetailOpen, setStudentDetailOpen] = useState(false);
  const [activeCourseAccordionId, setActiveCourseAccordionId] = useState(null);

  // Enrollments search/filter
  const [enrollmentSearchTerm, setEnrollmentSearchTerm] = useState('');
  const [enrollmentCourseFilter, setEnrollmentCourseFilter] = useState('all');
  const [isNewEnrollModalOpen, setIsNewEnrollModalOpen] = useState(false);
  const [newEnrollForm, setNewEnrollForm] = useState({
    user_id: '',
    course_id: ''
  });
  const [enrollStudentSearch, setEnrollStudentSearch] = useState('');

  // Analytics selections
  const [analyticsSelectedCourseId, setAnalyticsSelectedCourseId] = useState('c1');

  // --- COURSE EDITOR STATES ---
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editorCourseForm, setEditorCourseForm] = useState({
    title: '',
    description: '',
    price: 0,
    year_id: '',
    thumbnail_url: '',
    is_published: false
  });
  const [editorLessons, setEditorLessons] = useState([]);
  const [activeLessonEditId, setActiveLessonEditId] = useState(null);
  const [lessonEditForm, setLessonEditForm] = useState({
    title: '',
    video_url: '',
    content: ''
  });

  // Dashboard Revenue Chart tooltip states
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // --- LIVE DB DATA FETCHERS ---
  const fetchLiveDatabaseState = async () => {
    try {
      setIsLoading(true);
      
      // Profiles
      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) setLiveStudents(profilesData);

      // Enrollments
      const { data: enrollmentsData } = await supabase.from('enrollments').select('*').order('enrolled_at', { ascending: false });
      if (enrollmentsData) setLiveEnrollments(enrollmentsData);

      // Lessons
      const { data: lessonsData } = await supabase.from('lessons').select('*').order('order_index', { ascending: true });
      if (lessonsData) setLiveLessons(lessonsData);

      // Lesson Progress
      const { data: progressData } = await supabase.from('lesson_progress').select('*');
      if (progressData) setLiveLessonProgress(progressData);

      // Courses
      const { data: coursesData } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (coursesData) setLiveCourses(coursesData);

      // Course Requests
      const { data: courseRequestsData } = await supabase.from('course_requests').select('*').order('created_at', { ascending: false });
      if (courseRequestsData) setLiveCourseRequests(courseRequestsData);

      // Years
      const { data: yearsData } = await supabase.from('years').select('*').order('order_index');
      if (yearsData) {
        setYears(yearsData);
        if (yearsData.length > 0 && !newCourseForm.year_id) {
          setNewCourseForm(prev => ({ ...prev, year_id: yearsData[0].id }));
        }
      }

      // Enrollment counts per course
      const counts = {};
      if (enrollmentsData) {
        enrollmentsData.forEach(e => {
          counts[e.course_id] = (counts[e.course_id] || 0) + 1;
        });
      }
      setLiveEnrollmentCounts(counts);

    } catch (err) {
      console.error("Error loading live database tables:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLiveStats = async () => {
    try {
      setIsLoading(true);
      
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      const { data: coursesList } = await supabase
        .from('courses')
        .select('*');

      const { data: enrollmentsList } = await supabase
        .from('enrollments')
        .select('*')
        .order('enrolled_at', { ascending: false });

      const { data: recentProfilesList } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setDbConnected(true);

      let enrichedEnrollments = [];
      if (enrollmentsList && enrollmentsList.length > 0) {
        const userIds = [...new Set(enrollmentsList.map(e => e.user_id))];
        const { data: enrollmentProfiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        const profileMap = {};
        if (enrollmentProfiles) {
          enrollmentProfiles.forEach(p => {
            profileMap[p.id] = p;
          });
        }

        const courseMap = {};
        if (coursesList) {
          coursesList.forEach(c => {
            courseMap[c.id] = c;
          });
        }

        enrichedEnrollments = enrollmentsList.map(e => ({
          ...e,
          profile: profileMap[e.user_id] || { full_name: 'طالب غير معروف', email: 'N/A' },
          course: courseMap[e.course_id] || { title: 'كورس غير معروف', price: 0 }
        }));
      }

      const totalRev = enrichedEnrollments.reduce((sum, e) => sum + (Number(e.course?.price) || 0), 0);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const activeThisMonth = enrichedEnrollments.filter(e => new Date(e.enrolled_at) >= startOfMonth).length;

      const chartPoints = [];
      const now = new Date();
      for (let i = 9; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i * 3);
        const dateStr = d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
        
        const dayIntervalEnrollments = enrichedEnrollments.filter(e => {
          const eDate = new Date(e.enrolled_at);
          const diffTime = Math.abs(now - eDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= (i * 3) && diffDays > ((i - 1) * 3);
        });

        const rev = dayIntervalEnrollments.reduce((sum, e) => sum + (Number(e.course?.price) || 0), 0);
        chartPoints.push({ label: dateStr, value: rev });
      }

      const finalChart = chartPoints.every(p => p.value === 0) 
        ? [
            { label: '10 أيام مضت', value: 0 },
            { label: '7 أيام مضت', value: totalRev * 0.3 },
            { label: '4 أيام مضت', value: totalRev * 0.7 },
            { label: 'اليوم', value: totalRev }
          ]
        : chartPoints;

      setLiveStats({
        totalStudents: studentCount || 0,
        totalCourses: courseCount || 0,
        totalRevenue: totalRev,
        activeEnrollments: activeThisMonth,
        recentSignups: recentProfilesList || [],
        recentEnrollments: enrichedEnrollments.slice(0, 5),
        chartData: finalChart
      });

    } catch (err) {
      console.warn("Could not connect to Supabase database stats", err);
      setDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
    fetchLiveDatabaseState();
  }, []);

  // Sync editor if active course changes
  useEffect(() => {
    if (editingCourseId) {
      loadLessonsForCourse(editingCourseId);
    }
  }, [editingCourseId]);

  // Sync analytics selection if courses list changes
  useEffect(() => {
    const list = liveCourses;
    if (list.length > 0) {
      // Find matching course or default to first
      const found = list.find(c => c.id === analyticsSelectedCourseId);
      if (!found) {
        setAnalyticsSelectedCourseId(list[0].id);
      }
    }
  }, [liveCourses]);

  // --- RESOLVE CURRENT STATE ---
  const currentStudents = liveStudents;
  const currentEnrollments = liveEnrollments;
  const currentCourses = liveCourses;
  const currentEnrollmentCounts = liveEnrollmentCounts;
  const currentYears = years;
  const currentLessons = liveLessons;
  const currentLessonProgress = liveLessonProgress;
  const currentCourseRequests = liveCourseRequests;

  // --- MATH & JOIN HELPERS ---
  const getYearTitle = (yearId) => {
    const year = currentYears.find(y => y.id === yearId);
    return year ? year.title : 'صف دراسي غير محدد';
  };

  const getStudentEnrollmentCount = (studentId) => {
    return currentEnrollments.filter(e => e.user_id === studentId).length;
  };

  const getEnrolledCoursesForStudent = (studentId) => {
    const enrolls = currentEnrollments.filter(e => e.user_id === studentId);
    return enrolls.map(e => {
      const course = currentCourses.find(c => c.id === e.course_id);
      return course ? { ...course, enrolled_at: e.enrolled_at } : null;
    }).filter(Boolean);
  };

  const getLessonsForCourse = (courseId) => {
    return liveLessons.filter(l => l.course_id === courseId);
  };

  const getLessonCompletionPercentage = (studentId, courseId) => {
    const courseLessons = getLessonsForCourse(courseId);
    if (courseLessons.length === 0) return 0;

    const completedCount = courseLessons.filter(l => 
      currentLessonProgress.some(p => p.user_id === studentId && p.lesson_id === l.id && p.completed)
    ).length;

    return Math.round((completedCount / courseLessons.length) * 100);
  };

  const getLessonStatusText = (studentId, lessonId) => {
    const isCompleted = currentLessonProgress.some(p => p.user_id === studentId && p.lesson_id === lessonId && p.completed);
    return isCompleted ? 'مكتمل' : 'غير مكتمل';
  };

  // --- ACTIONS: GENERAL ---
  const handleTogglePublish = async (courseId, currentStatus) => {
    setIsLoading(true);
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !currentStatus })
      .eq('id', courseId);
    
    if (!error) {
      await fetchLiveDatabaseState();
      await fetchLiveStats();
    } else {
      alert("خطأ في تحديث حالة النشر: " + error.message);
    }
    setIsLoading(false);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكورس نهائياً؟ سيتم حذف جميع المرفقات والاشتراكات والدروس التابعة له.")) return;
    
    setIsLoading(true);
    const { data: lessons } = await supabase.from('lessons').select('id').eq('course_id', courseId);
    const lessonIds = lessons?.map(l => l.id) || [];
    if (lessonIds.length > 0) {
      await supabase.from('lesson_progress').delete().in('lesson_id', lessonIds);
      await supabase.from('lessons').delete().eq('course_id', courseId);
    }
    await supabase.from('enrollments').delete().eq('course_id', courseId);
    
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (!error) {
      await fetchLiveDatabaseState();
      await fetchLiveStats();
      if (editingCourseId === courseId) setEditingCourseId(null);
    } else {
      alert("خطأ في حذف الكورس: " + error.message);
    }
    setIsLoading(false);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseForm.title) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: newCourseForm.title,
        description: newCourseForm.description,
        year_id: newCourseForm.year_id || years[0]?.id,
        price: Number(newCourseForm.price) || 0,
        thumbnail_url: newCourseForm.thumbnail_url || null,
        is_published: false
      })
      .select()
      .single();

    if (!error && data) {
      await fetchLiveDatabaseState();
      await fetchLiveStats();
      setIsNewCourseModalOpen(false);
      setNewCourseForm({ title: '', description: '', year_id: years[0]?.id, price: 0, thumbnail_url: '' });
      setEditingCourseId(data.id);
    } else {
      alert("خطأ أثناء إنشاء الكورس: " + (error?.message || 'غير معروف'));
    }
    setIsLoading(false);
  };

  // --- EDITOR SYSTEM FUNCTIONS ---
  const loadLessonsForCourse = async (courseId) => {
    setIsLoading(true);
    const { data: course } = await supabase.from('courses').select('*').eq('id', courseId).single();
    if (course) {
      setEditorCourseForm({
        title: course.title,
        description: course.description || '',
        price: course.price,
        year_id: course.year_id || '',
        thumbnail_url: course.thumbnail_url || '',
        is_published: course.is_published
      });
    }
    const { data: lessonsData } = await supabase.from('lessons').select('*').eq('course_id', courseId).order('order_index', { ascending: true });
    setEditorLessons(lessonsData || []);
    setIsLoading(false);
    setActiveLessonEditId(null);
  };

  const handleUpdateCourseDetails = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase
      .from('courses')
      .update({
        title: editorCourseForm.title,
        description: editorCourseForm.description,
        price: Number(editorCourseForm.price) || 0,
        year_id: editorCourseForm.year_id,
        thumbnail_url: editorCourseForm.thumbnail_url || null,
        is_published: editorCourseForm.is_published
      })
      .eq('id', editingCourseId);

    if (!error) {
      alert("تم تعديل الكورس بنجاح!");
      await fetchLiveDatabaseState();
      await fetchLiveStats();
    } else {
      alert("خطأ في تحديث البيانات: " + error.message);
    }
    setIsLoading(false);
  };

  const handleAddLesson = async () => {
    const nextIndex = editorLessons.length;
    const initialLesson = {
      title: 'محاضرة جديدة',
      content: 'محتوى نصي إضافي للدرس',
      video_url: '',
      order_index: nextIndex
    };

    setIsLoading(true);
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: editingCourseId,
        ...initialLesson
      })
      .select()
      .single();

    if (!error && data) {
      setEditorLessons(prev => [...prev, data]);
      await fetchLiveDatabaseState();
      handleOpenLessonEdit(data);
    } else {
      alert("خطأ في إضافة الدرس: " + error.message);
    }
    setIsLoading(false);
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;

    setIsLoading(true);
    await supabase.from('lesson_progress').delete().eq('lesson_id', lessonId);
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (!error) {
      const remaining = editorLessons.filter(l => l.id !== lessonId);
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i].order_index !== i) {
          await supabase.from('lessons').update({ order_index: i }).eq('id', remaining[i].id);
          remaining[i].order_index = i;
        }
      }
      await fetchLiveDatabaseState();
      setEditorLessons(remaining);
      if (activeLessonEditId === lessonId) setActiveLessonEditId(null);
    } else {
      alert("خطأ في حذف الدرس: " + error.message);
    }
    setIsLoading(false);
  };

  const handleMoveLesson = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === editorLessons.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const list = [...editorLessons];
    
    const tempIndex = list[index].order_index;
    list[index].order_index = list[targetIndex].order_index;
    list[targetIndex].order_index = tempIndex;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setEditorLessons(list);

    setIsLoading(true);
    await supabase.from('lessons').update({ order_index: list[index].order_index }).eq('id', list[index].id);
    await supabase.from('lessons').update({ order_index: list[targetIndex].order_index }).eq('id', list[targetIndex].id);
    await fetchLiveDatabaseState();
    setIsLoading(false);
  };

  const handleOpenLessonEdit = (lesson) => {
    setActiveLessonEditId(lesson.id);
    setLessonEditForm({
      title: lesson.title,
      video_url: lesson.video_url || '',
      content: lesson.content || ''
    });
  };

  const handleSaveLessonEdit = async (lessonId) => {
    const fields = {
      title: lessonEditForm.title,
      video_url: lessonEditForm.video_url || null,
      content: lessonEditForm.content || null
    };

    setIsLoading(true);
    const { error } = await supabase.from('lessons').update(fields).eq('id', lessonId);
    if (!error) {
      setEditorLessons(prev => prev.map(l => l.id === lessonId ? { ...l, ...fields } : l));
      await fetchLiveDatabaseState();
      setActiveLessonEditId(null);
    } else {
      alert("خطأ في حفظ التغييرات: " + error.message);
    }
    setIsLoading(false);
  };

  // --- ACTIONS: ENROLLMENTS ---
  const handleCreateEnrollment = async (e) => {
    e.preventDefault();
    if (!newEnrollForm.user_id || !newEnrollForm.course_id) return;

    // Check duplicate
    const isDuplicate = currentEnrollments.some(e => e.user_id === newEnrollForm.user_id && e.course_id === newEnrollForm.course_id);
    if (isDuplicate) {
      alert("هذا الطالب مشترك بالفعل في هذا الكورس!");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: newEnrollForm.user_id,
        course_id: newEnrollForm.course_id
      });

    if (!error) {
      await fetchLiveDatabaseState();
      await fetchLiveStats();
      setIsNewEnrollModalOpen(false);
      setNewEnrollForm({ user_id: '', course_id: '' });
      setEnrollStudentSearch('');
    } else {
      alert("حدث خطأ أثناء الاشتراك: " + error.message);
    }
    setIsLoading(false);
  };

  const handleRevokeEnrollment = async (enrollId) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الاشتراك؟ سيفقد الطالب إمكانية الوصول إلى الكورس والدروس.")) return;

    setIsLoading(true);
    const { error } = await supabase.from('enrollments').delete().eq('id', enrollId);
    if (!error) {
      await fetchLiveDatabaseState();
      await fetchLiveStats();
    } else {
      alert("خطأ في إلغاء الاشتراك: " + error.message);
    }
    setIsLoading(false);
  };

  const handleApproveRequest = async (requestId, userId, courseId) => {
    setIsLoading(true);
    // 1. Insert into enrollments
    const { error: enrollError } = await supabase.from('enrollments').insert({
      user_id: userId,
      course_id: courseId
    });
    if (enrollError) {
      alert("حدث خطأ أثناء الاشتراك: " + enrollError.message);
      setIsLoading(false);
      return;
    }
    // 2. Update status of request to 'approved'
    const { error: reqError } = await supabase
      .from('course_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);
    if (reqError) {
      console.error("Error updating course request status:", reqError);
    }
    await fetchLiveDatabaseState();
    await fetchLiveStats();
    setIsLoading(false);
    alert("تم قبول الطلب وتفعيل الكورس بنجاح!");
  };

  const handleRejectRequest = async (requestId) => {
    if (!confirm("هل أنت متأكد من رفض هذا الطلب؟")) return;

    setIsLoading(true);
    const { error } = await supabase
      .from('course_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (!error) {
      await fetchLiveDatabaseState();
      alert("تم رفض الطلب بنجاح!");
    } else {
      alert("خطأ في رفض الطلب: " + error.message);
    }
    setIsLoading(false);
  };

  // --- FILTERS: STUDENTS ---
  const filteredStudents = currentStudents.filter(student => {
    const matchesSearch = 
      (student.full_name && student.full_name.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
      (student.email && student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
      (student.phone && student.phone.includes(studentSearchTerm));
    
    const matchesGrade = studentGradeFilter === 'all' || student.current_year_id === studentGradeFilter;
    return matchesSearch && matchesGrade;
  });

  // --- FILTERS: ENROLLMENTS ---
  const filteredEnrollmentsList = currentEnrollments.map(e => {
    const student = currentStudents.find(s => s.id === e.user_id);
    const course = currentCourses.find(c => c.id === e.course_id);
    return { ...e, student, course };
  }).filter(e => {
    if (!e.student || !e.course) return false;
    const matchesSearch = 
      e.student.full_name.toLowerCase().includes(enrollmentSearchTerm.toLowerCase()) || 
      e.student.email.toLowerCase().includes(enrollmentSearchTerm.toLowerCase());
    const matchesCourse = enrollmentCourseFilter === 'all' || e.course_id === enrollmentCourseFilter;
    return matchesSearch && matchesCourse;
  });

  const filteredStudentsForEnroll = currentStudents.filter(s => 
    s.full_name.toLowerCase().includes(enrollStudentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(enrollStudentSearch.toLowerCase())
  );

  // --- MATH FOR ANALYTICS PAGE ---
  const getAnalyticsPopularCourses = () => {
    return currentCourses.map(course => {
      const count = currentEnrollments.filter(e => e.course_id === course.id).length;
      return {
        id: course.id,
        title: course.title,
        enrollments: count
      };
    }).sort((a, b) => b.enrollments - a.enrollments);
  };

  const getAnalyticsCompletionRates = () => {
    return currentCourses.map(course => {
      const enrolled = currentEnrollments.filter(e => e.course_id === course.id);
      if (enrolled.length === 0) return { id: course.id, title: course.title, rate: 0, count: 0 };

      let totalPercent = 0;
      enrolled.forEach(e => {
        totalPercent += getLessonCompletionPercentage(e.user_id, course.id);
      });

      return {
        id: course.id,
        title: course.title,
        rate: Math.round(totalPercent / enrolled.length),
        count: enrolled.length
      };
    });
  };

  const getAnalyticsDropoffs = (courseId) => {
    const courseLessons = getLessonsForCourse(courseId);
    return courseLessons.map(l => {
      const completedCount = currentLessonProgress.filter(p => p.lesson_id === l.id && p.completed).length;
      return {
        lessonId: l.id,
        title: l.title,
        completedCount
      };
    });
  };

  // --- SOLVE FILTERED COURSES AND STATS ---
  const stats = liveStats;

  const filteredCourses = currentCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGrade = gradeFilter === 'all' || course.year_id === gradeFilter;
    return matchesSearch && matchesGrade;
  });


  // Generate paths for dashboard chart
  const generateChartPaths = () => {
    const data = stats.chartData || [];
    if (data.length === 0) return { linePath: '', areaPath: '', points: [] };

    const svgWidth = 500;
    const svgHeight = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingBottom = 30;
    const paddingTop = 15;

    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    const maxValue = Math.max(...data.map(d => d.value), 100);

    const points = data.map((d, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
      const y = svgHeight - paddingBottom - (d.value / maxValue) * chartHeight;
      return { x, y, label: d.label, value: d.value };
    });

    const linePath = points.reduce((acc, p, index) => {
      return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`
      : '';

    return { linePath, areaPath, points };
  };

  const { linePath, areaPath, points: chartPoints } = generateChartPaths();

  const handlePointMouseMove = (e, index, point) => {
    const rect = e.target.getBoundingClientRect();
    const container = e.currentTarget.parentNode.getBoundingClientRect();
    const tooltipX = rect.left - container.left + rect.width / 2;
    const tooltipY = rect.top - container.top;
    
    setTooltipPos({ x: tooltipX, y: tooltipY });
    setHoveredChartPoint(point);
  };

  const formatTimeAgo = (isoString) => {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'الآن';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  const selectedStudent = currentStudents.find(s => s.id === selectedStudentId);

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <GraduationCap size={24} />
          </div>
          <div className="sidebar-logo-text">
            أحمد سعد<span>.</span>
          </div>
        </div>

        <nav>
          <ul className="sidebar-menu">
            <li>
              <button 
                className={`menu-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('overview');
                  setEditingCourseId(null);
                }}
              >
                <LayoutDashboard />
                <span>الرئيسية / الإحصاءات</span>
              </button>
            </li>
            <li>
              <button 
                className={`menu-item-btn ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('courses');
                  setEditingCourseId(null);
                }}
              >
                <BookOpen />
                <span>إدارة الكورسات</span>
              </button>
            </li>

            <li>
              <button 
                className={`menu-item-btn ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('students');
                  setEditingCourseId(null);
                }}
              >
                <Users />
                <span>حسابات الطلاب</span>
              </button>
            </li>
            <li>
              <button 
                className={`menu-item-btn ${activeTab === 'enrollments' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('enrollments');
                  setEditingCourseId(null);
                }}
                style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CreditCard />
                  <span>الاشتراكات والطلبات</span>
                </div>
                {currentCourseRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span style={{
                    backgroundColor: '#EF4444',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    marginRight: 'auto'
                  }}>
                    {currentCourseRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button 
                className={`menu-item-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('analytics');
                  setEditingCourseId(null);
                }}
              >
                <BarChart3 />
                <span>تحليلات الأداء</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-avatar">أ</div>
          <div className="admin-info">
            <span className="admin-name">أ. أحمد سعد</span>
            <span className="admin-role">المدير العام</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-main">
        {/* HEADER */}
        <header className="dashboard-header">
          <div className="header-title-area">
            {editingCourseId ? (
              <>
                <h1>تعديل الكورس التعليمي</h1>
                <p>تحديث محتوى الدروس ومقاطع الفيديو والمعلومات التفصيلية للكورس.</p>
              </>
            ) : (
              <>
                <h1>
                  {activeTab === 'overview' && 'لوحة تحكم منصة الأحياء'}
                  {activeTab === 'courses' && 'إدارة الكورسات والمناهج'}
                  {activeTab === 'editor' && 'محرر المنهج والدروس'}
                  {activeTab === 'students' && 'حسابات الطلاب المسجلين'}
                  {activeTab === 'enrollments' && 'إدارة الاشتراكات اليدوية'}
                  {activeTab === 'analytics' && 'تحليلات الأداء والمبيعات'}
                </h1>
                <p>
                  {activeTab === 'overview' && 'مرحباً بك مجدداً، أ. أحمد. إليك آخر مستجدات المنصة التعليمية لهذا اليوم.'}
                  {activeTab === 'courses' && 'عرض، تعديل، ونشر الفصول الدراسية والكورسات التعليمية لمختلف الصفوف.'}
                  {activeTab === 'editor' && 'اختر كورس من قائمة الكورسات لبدء تحرير المحاضرات وإعادة ترتيبها.'}
                  {activeTab === 'students' && 'متابعة بيانات الطلاب ونسب تقدمهم الدراسي وتتبع إتمام الدروس والمشاهدات.'}
                  {activeTab === 'enrollments' && 'إضافة أو حذف الاشتراكات اليدوية للطلاب بالكورسات المدفوعة.'}
                  {activeTab === 'analytics' && 'رؤى بيانية مفصلة حول إتمام الدروس ونسب التساقط وشعبية الكورسات.'}
                </p>
              </>
            )}
          </div>

          <div className="header-actions">
            {/* Status Indicator */}
            {dbConnected ? (
              <div className="status-badge">
                <span className="status-indicator-dot"></span>
                <span>متصل بقاعدة البيانات</span>
              </div>
            ) : (
              <div className="status-badge error" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444' }}>
                <span className="status-indicator-dot" style={{ backgroundColor: '#EF4444', boxShadow: '0 0 8px #EF4444' }}></span>
                <span>غير متصل بقاعدة البيانات</span>
              </div>
            )}

            {isLoading && (
              <RefreshCw className="spin" style={{ color: 'var(--text-secondary)' }} />
            )}
          </div>
        </header>

        {/* --- PAGE 1: OVERVIEW --- */}
        {activeTab === 'overview' && !editingCourseId && (
          <div>
            <section className="dashboard-grid">
              <div className="stat-card blue">
                <div className="stat-card-header">
                  <span className="stat-card-title">إجمالي الطلاب المسجلين</span>
                  <div className="stat-card-icon-wrapper">
                    <Users size={20} />
                  </div>
                </div>
                <div className="stat-card-value">{isLoading ? '...' : stats.totalStudents}</div>
                <div className="stat-card-footer">
                  <span className="stat-trend-label">طلاب المنصة النشطين</span>
                </div>
              </div>

              <div className="stat-card gold">
                <div className="stat-card-header">
                  <span className="stat-card-title">الكورسات والمناهج</span>
                  <div className="stat-card-icon-wrapper">
                    <BookOpenCheck size={20} />
                  </div>
                </div>
                <div className="stat-card-value">{isLoading ? '...' : stats.totalCourses}</div>
                <div className="stat-card-footer">
                  <span className="stat-trend-label">3 صفوف دراسية مغطاة</span>
                </div>
              </div>

              <div className="stat-card emerald">
                <div className="stat-card-header">
                  <span className="stat-card-title">إجمالي المبيعات المحصلة</span>
                  <div className="stat-card-icon-wrapper">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="stat-card-value">{isLoading ? '...' : `${stats.totalRevenue} EGP`}</div>
                <div className="stat-card-footer">
                  <span className="stat-trend-label">مبيعات الكورسات المشتركة</span>
                </div>
              </div>

              <div className="stat-card green">
                <div className="stat-card-header">
                  <span className="stat-card-title">الاشتراكات الفعالة هذا الشهر</span>
                  <div className="stat-card-icon-wrapper">
                    <CreditCard size={20} />
                  </div>
                </div>
                <div className="stat-card-value">{isLoading ? '...' : stats.activeEnrollments}</div>
                <div className="stat-card-footer">
                  <span className="stat-trend-label">الاشتراكات المنشأة حديثاً</span>
                </div>
              </div>
            </section>

            <div className="dashboard-row">
              <div className="content-card">
                <div className="card-header-area">
                  <div>
                    <h3 className="card-title">منحنى نمو الإيرادات اليومية</h3>
                    <span className="card-subtitle">التقرير التفصيلي لآخر 30 يوماً</span>
                  </div>
                  <TrendingUp style={{ color: 'var(--accent-gold)' }} />
                </div>
                
                <div className="chart-container">
                  {stats.chartData && stats.chartData.length > 0 ? (
                    <svg className="chart-svg" viewBox="0 0 500 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chart-gradient-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="chart-gradient-stroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="var(--accent-gold)" />
                          <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                      </defs>

                      <line x1="40" y1="15" x2="480" y2="15" className="chart-grid-line" />
                      <line x1="40" y1="65" x2="480" y2="65" className="chart-grid-line" />
                      <line x1="40" y1="115" x2="480" y2="115" className="chart-grid-line" />
                      <line x1="40" y1="170" x2="480" y2="170" className="chart-grid-line" />

                      {areaPath && <path d={areaPath} className="chart-area" />}
                      {linePath && <path d={linePath} className="chart-line" />}

                      {chartPoints.map((p, idx) => (
                        <circle
                          key={idx}
                          cx={p.x}
                          cy={p.y}
                          r={hoveredChartPoint && hoveredChartPoint.label === p.label ? 6 : 4}
                          className="chart-dot"
                          onMouseMove={(e) => handlePointMouseMove(e, idx, p)}
                          onMouseLeave={() => setHoveredChartPoint(null)}
                        />
                      ))}

                      {chartPoints.map((p, idx) => {
                        if (idx % 2 !== 0 && idx !== chartPoints.length - 1) return null;
                        return (
                          <text key={idx} x={p.x} y="190" textAnchor="middle" className="chart-axis-text">
                            {p.label}
                          </text>
                        );
                      })}
                    </svg>
                  ) : (
                    <div className="empty-state">
                      <BarChart3 />
                      <p>لا توجد بيانات كافية لرسم الرسم البياني</p>
                    </div>
                  )}

                  {hoveredChartPoint && (
                    <div 
                      className="chart-tooltip" 
                      style={{ 
                        left: `${tooltipPos.x}px`, 
                        top: `${tooltipPos.y}px` 
                      }}
                    >
                      <span className="chart-tooltip-date">{hoveredChartPoint.label}</span>
                      <span className="chart-tooltip-value">{hoveredChartPoint.value} EGP</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="content-card">
                <div className="card-header-area">
                  <div>
                    <h3 className="card-title">أحدث حسابات الطلاب المسجلة</h3>
                    <span className="card-subtitle">الطلاب الجدد المنضمين مؤخراً للمنصة</span>
                  </div>
                  <Sparkles style={{ color: 'var(--accent-green)' }} />
                </div>

                <div className="recent-list">
                  {stats.recentSignups && stats.recentSignups.length > 0 ? (
                    stats.recentSignups.map((student) => (
                      <div key={student.id} className="recent-item">
                        <div className="recent-item-info">
                          <div className="recent-avatar blue">
                            {student.full_name ? student.full_name[0] : 'ط'}
                          </div>
                          <div className="recent-details">
                            <span className="recent-name">{student.full_name}</span>
                            <span className="recent-subtext">{student.email}</span>
                          </div>
                        </div>
                        <div className="recent-time">
                          {formatTimeAgo(student.created_at)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <Users />
                      <p>لا يوجد طلاب مسجلون حالياً</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="content-card" style={{ marginBottom: '24px' }}>
              <div className="card-header-area">
                <div>
                  <h3 className="card-title">أحدث طلبات الاشتراك بالكورسات</h3>
                  <span className="card-subtitle">الاشتراكات اليدوية الأخيرة التي تم تفعيلها</span>
                </div>
                <BookOpen style={{ color: 'var(--accent-gold)' }} />
              </div>

              <div className="recent-list">
                {stats.recentEnrollments && stats.recentEnrollments.length > 0 ? (
                  stats.recentEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="recent-item">
                      <div className="recent-item-info">
                        <div className="recent-avatar">
                          {enrollment.profile?.full_name ? enrollment.profile.full_name[0] : 'ط'}
                        </div>
                        <div className="recent-details">
                          <span className="recent-name">{enrollment.profile?.full_name}</span>
                          <span className="recent-subtext">{enrollment.course?.title}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className={`recent-value-badge ${Number(enrollment.course?.price) === 0 ? 'free' : ''}`}>
                          {Number(enrollment.course?.price) === 0 ? 'كورس مجاني' : `${enrollment.course?.price} EGP`}
                        </span>
                        <span className="recent-time">
                          {formatTimeAgo(enrollment.enrolled_at)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <CreditCard />
                    <p>لا توجد اشتراكات مفعّلة حالياً</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE 2: COURSES LIST --- */}
        {activeTab === 'courses' && !editingCourseId && (
          <div>
            {/* Table Filters & Toolbar */}
            <div className="content-card" style={{ padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                
                {/* Search and Grade Filter */}
                <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input 
                      type="text" 
                      placeholder="البحث عن كورس..." 
                      className="form-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: '100%', paddingRight: '40px' }}
                    />
                    <Search size={18} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  </div>
                  
                  <select 
                    className="form-select"
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    style={{ minWidth: '180px' }}
                  >
                    <option value="all">كل الصفوف الدراسية</option>
                    {currentYears.map(year => (
                      <option key={year.id} value={year.id}>{year.title}</option>
                    ))}
                  </select>
                </div>

                {/* Add New Course Button */}
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsNewCourseModalOpen(true)}
                >
                  <Plus size={18} />
                  <span>إضافة كورس جديد</span>
                </button>

              </div>
            </div>

            {/* Courses Table */}
            <div className="table-container">
              {filteredCourses.length > 0 ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>اسم الكورس / الصف الدراسي</th>
                      <th>السعر</th>
                      <th>الطلاب المشتركين</th>
                      <th>حالة النشر</th>
                      <th>العمليات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id}>
                        <td 
                          onClick={() => setEditingCourseId(course.id)} 
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="course-meta-title">{course.title}</div>
                          <div className="course-meta-subtitle">{getYearTitle(course.year_id)}</div>
                        </td>

                        <td>
                          <span style={{ fontWeight: '600' }}>
                            {course.price == 0 ? (
                              <span style={{ color: 'var(--accent-emerald)' }}>مجاني</span>
                            ) : (
                              `${course.price} EGP`
                            )}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={16} style={{ color: 'var(--text-muted)' }} />
                            <span>{currentEnrollmentCounts[course.id] || 0} طالب</span>
                          </div>
                        </td>

                        <td>
                          {course.is_published ? (
                            <span className="badge badge-success">
                              <span className="badge-dot"></span>
                              <span>منشور للطلاب</span>
                            </span>
                          ) : (
                            <span className="badge badge-warning">
                              <span className="badge-dot"></span>
                              <span>مسودة (مخفي)</span>
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="actions-cell">
                            <button 
                              className="action-btn"
                              onClick={() => handleTogglePublish(course.id, course.is_published)}
                              title={course.is_published ? "إلغاء النشر" : "تفعيل النشر للطلاب"}
                            >
                              {course.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>

                            <button 
                              className="action-btn edit-btn"
                              onClick={() => setEditingCourseId(course.id)}
                              title="تعديل الدروس والتفاصيل"
                            >
                              <Edit size={18} />
                            </button>

                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteCourse(course.id)}
                              title="حذف الكورس نهائياً"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <BookOpen size={48} />
                  <p style={{ marginTop: '16px', fontSize: '15px' }}>لا توجد كورسات مطابقة لمعايير البحث الحالية.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PAGE 3: COURSE EDITOR (SUB-PAGE / TAB) --- */}
        {((activeTab === 'editor') || editingCourseId) && (
          <div>
            {!editingCourseId ? (
              <div className="content-card" style={{ padding: '40px', textAlign: 'center' }}>
                <Edit3 size={48} style={{ color: 'var(--accent-gold)', marginBottom: '16px' }} />
                <h3>لم يتم تحديد كورس لتعديله</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                  يرجى الانتقال لصفحة "إدارة الكورسات" واختيار الكورس الذي ترغب في تحريره وإضافة حصص له.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('courses')}
                >
                  الذهاب إلى قائمة الكورسات
                </button>
              </div>
            ) : (
              <div className="editor-container">
                {/* Course Metadata Form */}
                <div className="editor-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <h3 className="card-title">تفاصيل وبيانات الكورس</h3>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setEditingCourseId(null);
                        setActiveTab('courses');
                      }}
                    >
                      عودة للقائمة
                    </button>
                  </div>

                  <form onSubmit={handleUpdateCourseDetails} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">عنوان الكورس التعليمي</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required
                        value={editorCourseForm.title}
                        onChange={(e) => setEditorCourseForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">الصف الدراسي المستهدف</label>
                      <select 
                        className="form-select"
                        value={editorCourseForm.year_id}
                        onChange={(e) => setEditorCourseForm(prev => ({ ...prev, year_id: e.target.value }))}
                      >
                        {currentYears.map(year => (
                          <option key={year.id} value={year.id}>{year.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">سعر الكورس (EGP - ضع 0 للمجاني)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0"
                        value={editorCourseForm.price}
                        onChange={(e) => setEditorCourseForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      />
                    </div>



                    <div className="form-group">
                      <label className="form-label">وصف الكورس والشروحات المشمولة</label>
                      <textarea 
                        className="form-textarea"
                        value={editorCourseForm.description}
                        onChange={(e) => setEditorCourseForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="form-group" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', marginTop: '8px' }}>
                      <span className="form-label" style={{ margin: 0 }}>نشر الكورس للطلاب فوراً</span>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={editorCourseForm.is_published}
                          onChange={(e) => setEditorCourseForm(prev => ({ ...prev, is_published: e.target.checked }))}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
                      حفظ تفاصيل الكورس
                    </button>
                  </form>
                </div>

                {/* Lessons Manager */}
                <div className="editor-card" style={{ flexGrow: 1 }}>
                  <div className="lessons-manager-header">
                    <div>
                      <h3 className="card-title">دروس ومحاضرات المنهج</h3>
                      <span className="card-subtitle">ترتيب الحصص وربط الفيديوهات لكل درس</span>
                    </div>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={handleAddLesson}
                    >
                      <Plus size={16} />
                      <span>إضافة درس جديد</span>
                    </button>
                  </div>

                  <div className="lessons-list">
                    {editorLessons.length > 0 ? (
                      editorLessons.map((lesson, idx) => (
                        <div key={lesson.id} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div className="lesson-card-item">
                            <div className="lesson-drag-controls">
                              <button 
                                className="lesson-drag-arrow"
                                onClick={() => handleMoveLesson(idx, 'up')}
                                disabled={idx === 0}
                              >
                                <ChevronUp size={16} />
                              </button>
                              <button 
                                className="lesson-drag-arrow"
                                onClick={() => handleMoveLesson(idx, 'down')}
                                disabled={idx === editorLessons.length - 1}
                              >
                                <ChevronDown size={16} />
                              </button>
                            </div>

                            <div className="lesson-card-info">
                              <span className="lesson-card-title">
                                {idx + 1}. {lesson.title}
                              </span>
                              <div className="lesson-card-meta">
                                {lesson.video_url ? (
                                  <span style={{ color: 'var(--accent-emerald)' }}>
                                    <Video size={12} />
                                    <span>فيديو مربوط</span>
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>
                                    <Video size={12} />
                                    <span>بدون فيديو</span>
                                  </span>
                                )}
                                {lesson.content ? (
                                  <span>
                                    <FileText size={12} />
                                    <span>محتوى نصي</span>
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className="lesson-actions-area">
                              <button 
                                className="action-btn edit-btn"
                                onClick={() => {
                                  if (activeLessonEditId === lesson.id) {
                                    setActiveLessonEditId(null);
                                  } else {
                                    handleOpenLessonEdit(lesson);
                                  }
                                }}
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteLesson(lesson.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {activeLessonEditId === lesson.id && (
                            <div className="lesson-editor-form">
                              <div className="form-group">
                                <label className="form-label">عنوان الدرس / المحاضرة</label>
                                <input 
                                  type="text" 
                                  className="form-input" 
                                  value={lessonEditForm.title}
                                  onChange={(e) => setLessonEditForm(prev => ({ ...prev, title: e.target.value }))}
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">رابط الفيديو (Vimeo / YouTube)</label>
                                <input 
                                  type="text" 
                                  className="form-input" 
                                  placeholder="رابط الفيديو..."
                                  value={lessonEditForm.video_url}
                                  onChange={(e) => setLessonEditForm(prev => ({ ...prev, video_url: e.target.value }))}
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label">شرح ملخص / محتوى الدرس النصي</label>
                                <textarea 
                                  className="form-textarea"
                                  placeholder="تفاصيل الدرس..."
                                  value={lessonEditForm.content}
                                  onChange={(e) => setLessonEditForm(prev => ({ ...prev, content: e.target.value }))}
                                />
                              </div>

                              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                <button 
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setActiveLessonEditId(null)}
                                >
                                  إلغاء
                                </button>
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleSaveLessonEdit(lesson.id)}
                                >
                                  حفظ الدرس
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-state" style={{ padding: '24px 0' }}>
                        <FileText size={36} />
                        <p>لا توجد حصص في هذا كورس. اضغط على إضافة درس جديد.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- PAGE 4: STUDENTS LIST --- */}
        {activeTab === 'students' && (
          <div>
            <div className="content-card" style={{ padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                  <input 
                    type="text" 
                    placeholder="البحث عن طالب بالاسم، الإيميل، أو الهاتف..." 
                    className="form-input"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    style={{ width: '100%', paddingRight: '40px' }}
                  />
                  <Search size={18} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--text-muted)' }} />
                </div>
                
                <select 
                  className="form-select"
                  value={studentGradeFilter}
                  onChange={(e) => setStudentGradeFilter(e.target.value)}
                  style={{ minWidth: '180px' }}
                >
                  <option value="all">كل الصفوف الدراسية</option>
                  {currentYears.map(year => (
                    <option key={year.id} value={year.id}>{year.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-container">
              {filteredStudents.length > 0 ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>اسم الطالب</th>
                      <th>الصف الدراسي</th>
                      <th>رقم الهاتف</th>
                      <th>عدد الكورسات المشترك بها</th>
                      <th>تاريخ التسجيل</th>
                      <th>التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="admin-avatar" style={{ margin: 0, width: '36px', height: '36px', fontSize: '13px' }}>
                              {student.full_name ? student.full_name[0] : 'ط'}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600' }}>{student.full_name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{getYearTitle(student.current_year_id)}</td>
                        <td>{student.phone || 'غير محدد'}</td>
                        <td>
                          <span className="badge badge-success" style={{ padding: '2px 8px' }}>
                            {getStudentEnrollmentCount(student.id)} كورس
                          </span>
                        </td>
                        <td>{new Date(student.created_at).toLocaleDateString('ar-EG')}</td>
                        <td>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setStudentDetailOpen(true);
                            }}
                          >
                            <FileText size={14} />
                            <span>عرض التقدم</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <Users size={48} />
                  <p style={{ marginTop: '16px' }}>لا يوجد طلاب يطابقون معايير البحث.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PAGE 5: ENROLLMENTS MANAGER --- */}
        {activeTab === 'enrollments' && (
          <div>
            {(() => {
              const pendingRequests = currentCourseRequests.filter(req => req.status === 'pending');
              const enrichedRequests = pendingRequests.map(req => {
                const student = currentStudents.find(s => s.id === req.user_id);
                const course = currentCourses.find(c => c.id === req.course_id);
                return { ...req, student, course };
              }).filter(r => r.student && r.course);

              if (enrichedRequests.length === 0) return null;

              return (
                <div className="content-card" style={{ padding: '20px', marginBottom: '24px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', boxShadow: '0 0 10px var(--accent-gold)' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                      طلبات تفعيل الكورسات المعلقة ({enrichedRequests.length})
                    </h3>
                  </div>
                  
                  <div className="table-container" style={{ marginTop: 0 }}>
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>الطالب</th>
                          <th>الكورس المطلوب</th>
                          <th>الصف الدراسي</th>
                          <th>سعر الكورس</th>
                          <th>تاريخ الطلب</th>
                          <th>الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrichedRequests.map((req) => (
                          <tr key={req.id}>
                            <td>
                              <div style={{ fontWeight: '600' }}>{req.student.full_name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{req.student.email}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>الهاتف: {req.student.phone || 'غير محدد'}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: '600' }}>{req.course.title}</div>
                            </td>
                            <td>{getYearTitle(req.course.year_id)}</td>
                            <td style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                              {req.course.price} جنيه
                            </td>
                            <td>
                              {new Date(req.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className="btn btn-sm"
                                  onClick={() => handleApproveRequest(req.id, req.user_id, req.course_id)}
                                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10B981' }}
                                >
                                  <span>موافقة وتفعيل</span>
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRejectRequest(req.id)}
                                >
                                  <span>رفض الطلب</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            <div className="content-card" style={{ padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                
                <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input 
                      type="text" 
                      placeholder="البحث باسم الطالب..." 
                      className="form-input"
                      value={enrollmentSearchTerm}
                      onChange={(e) => setEnrollmentSearchTerm(e.target.value)}
                      style={{ width: '100%', paddingRight: '40px' }}
                    />
                    <Search size={18} style={{ position: 'absolute', right: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  </div>
                  
                  <select 
                    className="form-select"
                    value={enrollmentCourseFilter}
                    onChange={(e) => setEnrollmentCourseFilter(e.target.value)}
                    style={{ minWidth: '180px' }}
                  >
                    <option value="all">كل الكورسات</option>
                    {currentCourses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setIsNewEnrollModalOpen(true);
                    if (currentStudents.length > 0 && !newEnrollForm.user_id) {
                      setNewEnrollForm(prev => ({
                        ...prev,
                        user_id: currentStudents[0].id,
                        course_id: currentCourses[0]?.id || ''
                      }));
                    }
                  }}
                >
                  <UserPlus size={18} />
                  <span>إضافة اشتراك يدوي</span>
                </button>

              </div>
            </div>

            <div className="table-container">
              {filteredEnrollmentsList.length > 0 ? (
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>طالب</th>
                      <th>الكورس المشترك به</th>
                      <th>الصف الدراسي</th>
                      <th>تاريخ الاشتراك</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnrollmentsList.map((enroll) => (
                      <tr key={enroll.id}>
                        <td>
                          <div style={{ fontWeight: '600' }}>{enroll.student?.full_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{enroll.student?.email}</div>
                        </td>
                        <td>{enroll.course?.title}</td>
                        <td>{getYearTitle(enroll.course?.year_id)}</td>
                        <td>{new Date(enroll.enrolled_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                        <td>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRevokeEnrollment(enroll.id)}
                            style={{ display: 'inline-flex', gap: '6px' }}
                          >
                            <Trash2 size={12} />
                            <span>إلغاء الاشتراك</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <CreditCard size={48} />
                  <p style={{ marginTop: '16px' }}>لا توجد اشتراكات مطابقة للبحث حالياً.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PAGE 6: ANALYTICS --- */}
        {activeTab === 'analytics' && (
          <div>
            {/* Top Cards Grid */}
            <div className="analytics-grid">
              {/* Popular courses chart */}
              <div className="content-card">
                <div className="card-header-area" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <h3 className="card-title">شعبية الكورسات وإحصاءات التسجيل</h3>
                    <span className="card-subtitle">النسبة التناسبية للطلاب المسجلين لكل كورس</span>
                  </div>
                  <Layers style={{ color: 'var(--accent-gold)' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {getAnalyticsPopularCourses().map(item => {
                    const maxEnroll = Math.max(...getAnalyticsPopularCourses().map(i => i.enrollments), 1);
                    const pct = (item.enrollments / maxEnroll) * 100;
                    return (
                      <div key={item.id} className="chart-bar-horizontal">
                        <div className="chart-bar-horizontal-header">
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{item.title}</span>
                          <span style={{ color: 'var(--accent-gold)' }}>{item.enrollments} طالب</span>
                        </div>
                        <div className="chart-bar-horizontal-track">
                          <div 
                            className="chart-bar-horizontal-fill"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completion rates */}
              <div className="content-card">
                <div className="card-header-area" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <h3 className="card-title">نسب إتمام الدروس والمحاضرات</h3>
                    <span className="card-subtitle">متوسط الدروس التي أكملها الطلاب المشتركون</span>
                  </div>
                  <Award style={{ color: 'var(--accent-emerald)' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {getAnalyticsCompletionRates().map(item => (
                    <div key={item.id} className="chart-bar-horizontal">
                      <div className="chart-bar-horizontal-header">
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{item.title}</span>
                        <span style={{ color: 'var(--accent-emerald)' }}>{item.rate}% إتمام</span>
                      </div>
                      <div className="chart-bar-horizontal-track">
                        <div 
                          className="chart-bar-horizontal-fill emerald"
                          style={{ width: `${item.rate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drop-offs Visualization */}
            <div className="content-card" style={{ marginBottom: '24px' }}>
              <div className="card-header-area" style={{ flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 className="card-title">تتبع نقاط التسرب وعزوف الطلاب (Drop-off Points)</h3>
                  <span className="card-subtitle">عدد الطلاب الذين أكملوا كل محاضرة على حدة لملاحظة نقاط العزوف</span>
                </div>
                
                <select 
                  className="form-select"
                  value={analyticsSelectedCourseId}
                  onChange={(e) => setAnalyticsSelectedCourseId(e.target.value)}
                  style={{ minWidth: '220px' }}
                >
                  {currentCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              {getLessonsForCourse(analyticsSelectedCourseId).length > 0 ? (
                <div>
                  <div className="dropoff-chart-container">
                    {getAnalyticsDropoffs(analyticsSelectedCourseId).map((lesson, idx) => {
                      const maxCompleted = Math.max(...getAnalyticsDropoffs(analyticsSelectedCourseId).map(l => l.completedCount), 1);
                      const barHeight = (lesson.completedCount / maxCompleted) * 120 + 20; // range 20px - 140px
                      return (
                        <div key={lesson.lessonId} className="dropoff-bar-wrapper">
                          <div 
                            className="dropoff-bar-column"
                            style={{ height: `${barHeight}px` }}
                          >
                            <span className="dropoff-bar-tooltip">{lesson.completedCount} طالب</span>
                          </div>
                          <span className="dropoff-bar-label" title={lesson.title}>
                            حـ{idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>* حـ1، حـ2 تعبر عن ترتيب المحاضرات المنهجية.</span>
                    <span>* يوضح العمود الطويل كثرة المشاهدة والإتمام، وتناقص الأعمدة يحدد موضع عزوف الطلاب لدعم وتعديل المحتوى.</span>
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <FileText size={36} />
                  <p>لا توجد حصص مضافة في الكورس المحدد بعد.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- STUDENT DETAIL DRAWER --- */}
        {studentDetailOpen && selectedStudent && (
          <div className="drawer-overlay" onClick={() => setStudentDetailOpen(false)}>
            <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header">
                <div>
                  <h3 className="modal-title">{selectedStudent.full_name}</h3>
                  <span className="course-meta-subtitle" style={{ fontSize: '13px' }}>
                    {getYearTitle(selectedStudent.current_year_id)}
                  </span>
                </div>
                <button 
                  className="modal-close-btn"
                  onClick={() => setStudentDetailOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="drawer-body">
                {/* Contact specs */}
                <div className="content-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <Mail size={16} style={{ color: 'var(--accent-gold)' }} />
                    <span style={{ direction: 'ltr' }}>{selectedStudent.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <Phone size={16} style={{ color: 'var(--accent-gold)' }} />
                    <span>{selectedStudent.phone || 'رقم الهاتف غير مسجل'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <Calendar size={16} style={{ color: 'var(--accent-gold)' }} />
                    <span>انضم في: {new Date(selectedStudent.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Academic tracking list */}
                <div>
                  <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: '700' }}>
                    نسبة المشاهدة والتقدم بالكورسات
                  </h4>
                  
                  {getEnrolledCoursesForStudent(selectedStudentId).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {getEnrolledCoursesForStudent(selectedStudentId).map(course => {
                        const progressPct = getLessonCompletionPercentage(selectedStudentId, course.id);
                        const courseLessons = getLessonsForCourse(course.id);
                        const isAccordionActive = activeCourseAccordionId === course.id;
                        
                        return (
                          <div 
                            key={course.id} 
                            className="content-card" 
                            style={{ padding: '16px', border: '1px solid var(--border-light)' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: '700', fontSize: '14px' }}>{course.title}</span>
                              <span className="badge badge-success">{progressPct}% مكتمل</span>
                            </div>

                            <div className="progress-bar-container">
                              <div 
                                className={`progress-bar-fill ${progressPct < 40 ? 'warning' : ''}`}
                                style={{ width: `${progressPct}%` }}
                              ></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                إتمام {courseLessons.filter(l => currentLessonProgress.some(p => p.user_id === selectedStudentId && p.lesson_id === l.id && p.completed)).length} من أصل {courseLessons.length} حصة
                              </span>

                              {courseLessons.length > 0 && (
                                <button 
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '2px 8px', fontSize: '11px' }}
                                  onClick={() => setActiveCourseAccordionId(isAccordionActive ? null : course.id)}
                                >
                                  {isAccordionActive ? 'إخفاء التفاصيل' : 'عرض المحاضرات'}
                                </button>
                              )}
                            </div>

                            {/* Collapsible lesson list */}
                            {isAccordionActive && courseLessons.length > 0 && (
                              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {courseLessons.map(lesson => {
                                  const isComp = currentLessonProgress.some(p => p.user_id === selectedStudentId && p.lesson_id === lesson.id && p.completed);
                                  return (
                                    <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                                      <span style={{ color: isComp ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                        {lesson.title}
                                      </span>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isComp ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                                        {isComp ? <CheckCircle size={14} /> : <Circle size={14} />}
                                        <span>{isComp ? 'مكتمل' : 'غير مشاهد'}</span>
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state" style={{ padding: '24px 0' }}>
                      <BookOpen size={32} />
                      <p>الطالب غير مشترك في أي كورسات حتى الآن.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ADD NEW ENROLLMENT MODAL --- */}
        {isNewEnrollModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '480px' }}>
              <div className="modal-header">
                <h3 className="modal-title">إضافة اشتراك يدوي لطالب</h3>
                <button 
                  className="modal-close-btn"
                  onClick={() => setIsNewEnrollModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateEnrollment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Search student to narrow select */}
                <div className="form-group">
                  <label className="form-label">البحث عن طالب</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="ابحث بالاسم لتضييق القائمة..."
                    value={enrollStudentSearch}
                    onChange={(e) => setEnrollStudentSearch(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">اختر الطالب</label>
                  <select 
                    className="form-select"
                    required
                    value={newEnrollForm.user_id}
                    onChange={(e) => setNewEnrollForm(prev => ({ ...prev, user_id: e.target.value }))}
                  >
                    {filteredStudentsForEnroll.length > 0 ? (
                      filteredStudentsForEnroll.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.full_name} ({student.email})
                        </option>
                      ))
                    ) : (
                      <option disabled>لا توجد نتائج مطابقة للبحث</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">الكورس التعليمي</label>
                  <select 
                    className="form-select"
                    required
                    value={newEnrollForm.course_id}
                    onChange={(e) => setNewEnrollForm(prev => ({ ...prev, course_id: e.target.value }))}
                  >
                    {currentCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.price === 0 ? 'مجاني' : `${course.price} EGP`})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setIsNewEnrollModalOpen(false)}
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={filteredStudentsForEnroll.length === 0}
                  >
                    تأكيد الاشتراك
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- ADD NEW COURSE MODAL --- */}
        {isNewCourseModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">إنشاء كورس جديد</h3>
                <button 
                  className="modal-close-btn"
                  onClick={() => setIsNewCourseModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">عنوان الكورس</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="مثال: التكاثر في الكائنات الحية"
                    required
                    value={newCourseForm.title}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الصف الدراسي</label>
                  <select 
                    className="form-select"
                    value={newCourseForm.year_id}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, year_id: e.target.value }))}
                  >
                    {currentYears.map(year => (
                      <option key={year.id} value={year.id}>{year.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">سعر الاشتراك للكورس (EGP - ضع 0 للمجاني)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="0"
                    value={newCourseForm.price}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>



                <div className="form-group">
                  <label className="form-label">وصف مختصر</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="شرح موجز لمحتويات الكورس..."
                    value={newCourseForm.description}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setIsNewCourseModalOpen(false)}
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    إنشاء والذهاب للمحرر
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
