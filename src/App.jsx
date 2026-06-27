import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabase';
import { 
  LayoutDashboard, 
  BookOpen, 
  Edit3, 
  Users, 
  CreditCard, 
  BarChart3, 
  TrendingUp, 
  Plus, 
  RefreshCw, 
  GraduationCap, 
  DollarSign, 
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
  Layers,
  AlertTriangle,
  MessageSquare,
  Image,
  Upload,
  Copy,
  ExternalLink
} from 'lucide-react';
import './App.css';
import EarlyWarningSystem from './components/EarlyWarningSystem';

// --- WHATSAPP HELPER AND ICON ---
const WhatsAppIcon = ({ size = 20, ...props }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.417 9.86-9.86 0-2.637-1.025-5.114-2.887-6.978C16.578 1.902 14.1 .88 11.465.88c-5.44 0-9.862 4.418-9.865 9.861a9.814 9.814 0 0 0 1.488 5.122l-.98 3.58 3.673-.963zm10.518-6.195c-.3-.15-1.782-.88-2.05-.98-.268-.1-.463-.15-.658.15-.195.3-.755.95-.925 1.15-.17.2-.34.225-.64.075-.3-.15-1.266-.467-2.41-1.485-.89-.794-1.49-1.775-1.665-2.075-.175-.3-.018-.463.13-.61.134-.133.3-.348.45-.522.15-.175.2-.3.3-.5s.05-.375-.025-.525C8.26 8.478 7.64 6.97 7.38 6.345c-.253-.607-.51-.524-.658-.53-.14-.006-.3-.008-.46-.008-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.09 3.615.57.246 1.017.394 1.366.505.574.182 1.096.157 1.507.096.46-.067 1.782-.73 2.033-1.433.253-.703.253-1.305.178-1.43-.076-.127-.272-.2-.572-.35z" />
  </svg>
);

const getWhatsAppUrl = (phone) => {
  if (!phone) return '#';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '2' + cleaned;
  } else if (cleaned.startsWith('1') && cleaned.length === 10) {
    cleaned = '20' + cleaned;
  }
  return `https://wa.me/${cleaned}`;
};

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dbConnected, setDbConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- LIVE DATABASE STATES ---
  const [liveCourses, setLiveCourses] = useState([]);
  const [liveCourseRequests, setLiveCourseRequests] = useState([]);
  const [liveStudents, setLiveStudents] = useState([]);
  const [liveEnrollments, setLiveEnrollments] = useState([]);
  const [liveLessons, setLiveLessons] = useState([]);
  const [liveLessonProgress, setLiveLessonProgress] = useState([]);
  const [liveEnrollmentCounts, setLiveEnrollmentCounts] = useState({});
  const [years, setYears] = useState([]);
  const [liveComplaints, setLiveComplaints] = useState([]);
  const [complaintSearchTerm, setComplaintSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaBucket, setMediaBucket] = useState('course-images');
  const [mediaSearchTerm, setMediaSearchTerm] = useState('');
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);
  const [mediaBucketError, setMediaBucketError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
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
    content: '',
    attachment_urls: []
  });
  const [courseImagesList, setCourseImagesList] = useState([]);
  const [attachmentFilesList, setAttachmentFilesList] = useState([]);
  const [thumbnailDropdownOpen, setThumbnailDropdownOpen] = useState(false);

  // Exams feature states
  const [examForm, setExamForm] = useState({
    title: '',
    year_id: '',
    exam_url: ''
  });
  const [allExams, setAllExams] = useState([]);
  const [allExamSubmissions, setAllExamSubmissions] = useState([]);

  // Dashboard Revenue Chart tooltip states
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // --- LIVE DB DATA FETCHERS ---
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [
        profilesRes,
        enrollmentsRes,
        lessonsRes,
        progressRes,
        coursesRes,
        requestsRes,
        yearsRes,
        complaintsRes,
        examsRes,
        submissionsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('enrollments').select('*').order('enrolled_at', { ascending: false }),
        supabase.from('lessons').select('*').order('order_index', { ascending: true }),
        supabase.from('lesson_progress').select('*'),
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('course_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('years').select('*').order('order_index'),
        supabase.from('complaints').select('*').order('created_at', { ascending: false }),
        supabase.from('exams').select('*').order('created_at', { ascending: false }).then(res => res).catch(err => ({ error: err, data: [] })),
        supabase.from('exam_submissions').select('*').order('submitted_at', { ascending: false }).then(res => res).catch(err => ({ error: err, data: [] }))
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (enrollmentsRes.error) throw enrollmentsRes.error;
      if (lessonsRes.error) throw lessonsRes.error;
      if (progressRes.error) throw progressRes.error;
      if (coursesRes.error) throw coursesRes.error;
      if (requestsRes.error) throw requestsRes.error;
      if (yearsRes.error) throw yearsRes.error;
      if (complaintsRes.error) throw complaintsRes.error;

      const profilesData = profilesRes.data || [];
      const enrollmentsData = enrollmentsRes.data || [];
      const lessonsData = lessonsRes.data || [];
      const progressData = progressRes.data || [];
      const coursesData = coursesRes.data || [];
      const courseRequestsData = requestsRes.data || [];
      const yearsData = yearsRes.data || [];
      const complaintsData = complaintsRes.data || [];
      const examsData = examsRes?.data || [];
      const submissionsData = submissionsRes?.data || [];
      // Set live states
      setLiveStudents(profilesData);
      setLiveEnrollments(enrollmentsData);
      setLiveLessons(lessonsData);
      setLiveLessonProgress(progressData);
      setLiveCourses(coursesData);
      setLiveCourseRequests(courseRequestsData);
      setYears(yearsData);
      setLiveComplaints(complaintsData);
      setAllExams(examsData);
      setAllExamSubmissions(submissionsData);
      setDbConnected(true);

      // Pre-calculate newCourseForm default year if needed
      if (yearsData.length > 0) {
        setNewCourseForm(prev => {
          if (!prev.year_id) {
            return { ...prev, year_id: yearsData[0].id };
          }
          return prev;
        });
      }

      // Enrollment counts per course
      const counts = {};
      enrollmentsData.forEach(e => {
        counts[e.course_id] = (counts[e.course_id] || 0) + 1;
      });
      setLiveEnrollmentCounts(counts);

      // Stats Calculation
      const studentCount = profilesData.length;
      const courseCount = coursesData.length;

      // Construct maps for fast lookup during enrichment
      const profileMap = {};
      profilesData.forEach(p => {
        profileMap[p.id] = p;
      });

      const courseMap = {};
      coursesData.forEach(c => {
        courseMap[c.id] = c;
      });

      const enrichedEnrollments = enrollmentsData.map(e => ({
        ...e,
        profile: profileMap[e.user_id] || { full_name: 'طالب غير معروف', email: 'N/A' },
        course: courseMap[e.course_id] || { title: 'كورس غير معروف', price: 0 }
      }));

      const totalRev = enrichedEnrollments.reduce((sum, e) => sum + (Number(e.course?.price) || 0), 0);

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const activeThisMonth = enrichedEnrollments.filter(e => new Date(e.enrolled_at) >= startOfMonth).length;

      // Chart Calculations
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
        totalStudents: studentCount,
        totalCourses: courseCount,
        totalRevenue: totalRev,
        activeEnrollments: activeThisMonth,
        recentSignups: profilesData.slice(0, 5),
        recentEnrollments: enrichedEnrollments.slice(0, 5),
        chartData: finalChart
      });

    } catch (err) {
      console.warn("Could not load data from Supabase", err);
      setDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBucketFiles = useCallback(async (bucketName) => {
    try {
      const { data, error } = await supabase.storage.from(bucketName).list('', {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      if (error || !data) return [];
      return data
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(file.name);
          return { ...file, url: publicUrl };
        });
    } catch {
      return [];
    }
  }, []);

  const loadLessonsForCourse = useCallback(async (courseId) => {
    setIsLoading(true);
    try {
      const [courseResult, lessonsResult, images, attachments] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('lessons').select('*').eq('course_id', courseId).order('order_index', { ascending: true }),
        fetchBucketFiles('course-images'),
        fetchBucketFiles('attachment')
      ]);

      setCourseImagesList(images);
      setAttachmentFilesList(attachments);

      const course = courseResult.data;
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
      setEditorLessons(lessonsResult.data || []);
      setActiveLessonEditId(null);
    } catch (err) {
      console.error("Error loading lessons for course:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBucketFiles]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // Sync editor if active course changes
  useEffect(() => {
    if (editingCourseId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadLessonsForCourse(editingCourseId);
    }
  }, [editingCourseId, loadLessonsForCourse]);

  // --- RESOLVE CURRENT STATE ---
  const currentStudents = liveStudents;
  const currentEnrollments = liveEnrollments;
  const currentCourses = liveCourses;
  const currentEnrollmentCounts = liveEnrollmentCounts;
  const currentYears = years;
  const currentLessonProgress = liveLessonProgress;
  const currentCourseRequests = liveCourseRequests;

  // --- MATH & JOIN HELPERS ---
  const yearsMap = useMemo(() => {
    const map = new Map();
    currentYears.forEach(y => map.set(y.id, y.title));
    return map;
  }, [currentYears]);

  const getYearTitle = useCallback((yearId) => {
    return yearsMap.get(yearId) || 'صف دراسي غير محدد';
  }, [yearsMap]);

  const studentEnrollmentCountMap = useMemo(() => {
    const map = new Map();
    currentEnrollments.forEach(e => {
      map.set(e.user_id, (map.get(e.user_id) || 0) + 1);
    });
    return map;
  }, [currentEnrollments]);

  const getStudentEnrollmentCount = useCallback((studentId) => {
    return studentEnrollmentCountMap.get(studentId) || 0;
  }, [studentEnrollmentCountMap]);

  const enrolledCoursesForStudentMap = useMemo(() => {
    const map = new Map();
    const courseMap = new Map();
    currentCourses.forEach(c => courseMap.set(c.id, c));

    currentEnrollments.forEach(e => {
      if (!map.has(e.user_id)) {
        map.set(e.user_id, []);
      }
      const course = courseMap.get(e.course_id);
      if (course) {
        map.get(e.user_id).push({ ...course, enrolled_at: e.enrolled_at });
      }
    });
    return map;
  }, [currentEnrollments, currentCourses]);

  const getEnrolledCoursesForStudent = useCallback((studentId) => {
    return enrolledCoursesForStudentMap.get(studentId) || [];
  }, [enrolledCoursesForStudentMap]);

  const lessonsByCourseMap = useMemo(() => {
    const map = new Map();
    liveLessons.forEach(l => {
      if (!map.has(l.course_id)) {
        map.set(l.course_id, []);
      }
      map.get(l.course_id).push(l);
    });
    return map;
  }, [liveLessons]);

  const getLessonsForCourse = useCallback((courseId) => {
    return lessonsByCourseMap.get(courseId) || [];
  }, [lessonsByCourseMap]);

  const progressByStudentLessonMap = useMemo(() => {
    const map = new Map();
    currentLessonProgress.forEach(p => {
      if (p.completed) {
        map.set(`${p.user_id}_${p.lesson_id}`, true);
      }
    });
    return map;
  }, [currentLessonProgress]);

  const lessonProgressCountMap = useMemo(() => {
    const map = new Map();
    currentLessonProgress.forEach(p => {
      if (p.completed) {
        map.set(p.lesson_id, (map.get(p.lesson_id) || 0) + 1);
      }
    });
    return map;
  }, [currentLessonProgress]);

  const filteredComplaints = useMemo(() => {
    return liveComplaints.filter(complaint => {
      const student = liveStudents.find(s => s.id === complaint.user_id);
      const searchLower = complaintSearchTerm.toLowerCase();
      
      const matchText = complaint.complaint_text?.toLowerCase().includes(searchLower) || false;
      const matchName = student?.full_name?.toLowerCase().includes(searchLower) || false;
      const matchEmail = student?.email?.toLowerCase().includes(searchLower) || false;
      const matchPhone = student?.phone?.toLowerCase().includes(searchLower) || false;
      
      return matchText || matchName || matchEmail || matchPhone;
    });
  }, [liveComplaints, liveStudents, complaintSearchTerm]);

  const filteredMediaFiles = useMemo(() => {
    return mediaFiles.filter(file => {
      return file.name.toLowerCase().includes(mediaSearchTerm.toLowerCase());
    });
  }, [mediaFiles, mediaSearchTerm]);

  const getLessonCompletionPercentage = useCallback((studentId, courseId) => {
    const courseLessons = getLessonsForCourse(courseId);
    if (courseLessons.length === 0) return 0;

    const completedCount = courseLessons.filter(l => 
      progressByStudentLessonMap.has(`${studentId}_${l.id}`)
    ).length;

    return Math.round((completedCount / courseLessons.length) * 100);
  }, [getLessonsForCourse, progressByStudentLessonMap]);

  const getAnalyticsDropoffs = useCallback((courseId) => {
    const courseLessons = getLessonsForCourse(courseId);
    return courseLessons.map(l => {
      const completedCount = lessonProgressCountMap.get(l.id) || 0;
      return {
        lessonId: l.id,
        title: l.title,
        completedCount
      };
    });
  }, [getLessonsForCourse, lessonProgressCountMap]);

  // --- ACTIONS: GENERAL ---
  const handleTogglePublish = async (courseId, currentStatus) => {
    setIsLoading(true);
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !currentStatus })
      .eq('id', courseId);
    
    if (!error) {
      await fetchData();
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
    await supabase.from('course_requests').delete().eq('course_id', courseId);
    
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (!error) {
      await fetchData();
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
      await fetchData();
      setIsNewCourseModalOpen(false);
      setNewCourseForm({ title: '', description: '', year_id: years[0]?.id, price: 0, thumbnail_url: '' });
      setEditingCourseId(data.id);
    } else {
      alert("خطأ أثناء إنشاء الكورس: " + (error?.message || 'غير معروف'));
    }
    setIsLoading(false);
  };

  // --- EDITOR SYSTEM FUNCTIONS ---

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
      await fetchData();
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
      await fetchData();
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
      await fetchData();
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
    await Promise.all([
      supabase.from('lessons').update({ order_index: list[index].order_index }).eq('id', list[index].id),
      supabase.from('lessons').update({ order_index: list[targetIndex].order_index }).eq('id', list[targetIndex].id)
    ]);
    await fetchData();
    setIsLoading(false);
  };

  const handleOpenLessonEdit = (lesson) => {
    setActiveLessonEditId(lesson.id);
    setLessonEditForm({
      title: lesson.title,
      video_url: lesson.video_url || '',
      content: lesson.content || '',
      attachment_urls: lesson.attachment_urls || []
    });
  };

  const handleSaveLessonEdit = async (lessonId) => {
    const fields = {
      title: lessonEditForm.title,
      video_url: lessonEditForm.video_url || null,
      content: lessonEditForm.content || null,
      attachment_urls: lessonEditForm.attachment_urls || []
    };

    setIsLoading(true);
    const { error } = await supabase.from('lessons').update(fields).eq('id', lessonId);
    if (!error) {
      setEditorLessons(prev => prev.map(l => l.id === lessonId ? { ...l, ...fields } : l));
      await fetchData();
      setActiveLessonEditId(null);
    } else {
      alert("خطأ في حفظ التغييرات: " + error.message);
    }
    setIsLoading(false);
  };

  const toggleAttachmentUrl = (url) => {
    setLessonEditForm(prev => {
      const current = prev.attachment_urls || [];
      if (current.includes(url)) {
        return { ...prev, attachment_urls: current.filter(u => u !== url) };
      } else {
        return { ...prev, attachment_urls: [...current, url] };
      }
    });
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
      await fetchData();
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
    const enrollment = currentEnrollments.find(e => e.id === enrollId);

    const { error } = await supabase.from('enrollments').delete().eq('id', enrollId);
    if (!error) {
      if (enrollment) {
        const { error: reqError } = await supabase
          .from('course_requests')
          .delete()
          .eq('user_id', enrollment.user_id)
          .eq('course_id', enrollment.course_id);
        if (reqError) {
          console.error("Error deleting course request:", reqError);
        }
      }
      await fetchData();
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
    await fetchData();
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
      await fetchData();
      alert("تم رفض الطلب بنجاح!");
    } else {
      alert("خطأ في رفض الطلب: " + error.message);
    }
    setIsLoading(false);
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!confirm("هل أنت متأكد من حذف هذه الشكوى؟")) return;

    setIsLoading(true);
    const { error } = await supabase.from('complaints').delete().eq('id', complaintId);
    if (!error) {
      await fetchData();
      alert("تم حذف الشكوى بنجاح!");
    } else {
      alert("خطأ في حذف الشكوى: " + error.message);
    }
    setIsLoading(false);
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!examForm.title || !examForm.year_id || !examForm.exam_url) {
      alert("يرجى إكمال جميع الحقول");
      return;
    }
    
    setIsLoading(true);
    const { error } = await supabase.from('exams').insert([
      {
        title: examForm.title,
        year_id: examForm.year_id,
        exam_url: examForm.exam_url
      }
    ]);
    
    if (error) {
      alert("حدث خطأ أثناء إضافة الامتحان: " + error.message);
    } else {
      alert("تمت إضافة الامتحان بنجاح");
      setExamForm({ title: '', year_id: '', exam_url: '' });
      await fetchData();
    }
    setIsLoading(false);
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm("هل أنت متأكد من حذف هذا الامتحان؟")) return;
    
    setIsLoading(true);
    const { error } = await supabase.from('exams').delete().eq('id', examId);
    
    if (error) {
      alert("حدث خطأ أثناء حذف الامتحان: " + error.message);
    } else {
      alert("تم حذف الامتحان بنجاح");
      await fetchData();
    }
    setIsLoading(false);
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!confirm("هل أنت متأكد من حذف هذا التسليم؟ سيتيح ذلك للطالب إعادة تسليم الامتحان.")) return;
    
    setIsLoading(true);
    const { error } = await supabase.from('exam_submissions').delete().eq('id', submissionId);
    
    if (error) {
      alert("حدث خطأ أثناء حذف التسليم: " + error.message);
    } else {
      alert("تم حذف التسليم بنجاح");
      await fetchData();
    }
    setIsLoading(false);
  };

  const fetchMedia = useCallback(async (bucketName = mediaBucket) => {
    setMediaLoading(true);
    setMediaBucketError(null);
    try {
      const { data, error } = await supabase.storage.from(bucketName).list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      if (error) {
        if (error.message?.includes('not found') || error.status === 404 || error.statusCode === '404') {
          setMediaBucketError("bucket_not_found");
        } else {
          setMediaBucketError(error.message);
        }
        setMediaFiles([]);
      } else {
        const enrichedFiles = data.map(file => {
          const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(file.name);
          return {
            ...file,
            url: publicUrl
          };
        }).filter(file => file.name !== '.emptyFolderPlaceholder');
        setMediaFiles(enrichedFiles);
      }
    } catch (e) {
      console.error("Error fetching media:", e);
      setMediaBucketError(e.message);
    } finally {
      setMediaLoading(false);
    }
  }, [mediaBucket]);

  useEffect(() => {
    if (activeTab === 'media') {
      fetchMedia();
    } else if (activeTab === 'exams') {
      const loadAttachments = async () => {
        try {
          const files = await fetchBucketFiles('attachment');
          setAttachmentFilesList(files);
        } catch (e) {
          console.error("Error fetching attachments for exams", e);
        }
      };
      loadAttachments();
    }
  }, [activeTab, fetchMedia, mediaBucket, fetchBucketFiles]);

  const isAttachmentBucket = mediaBucket === 'attachment';

  const handleUploadFile = async (e) => {
    const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
    if (!files || files.length === 0) return;
    
    const file = files[0];

    // For course-images bucket, only allow images
    if (!isAttachmentBucket && !file.type.startsWith('image/')) {
      alert("يرجى اختيار ملف صورة صالح (PNG, JPEG, WEBP, GIF)");
      return;
    }

    const maxSize = isAttachmentBucket ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    const maxSizeLabel = isAttachmentBucket ? '50 ميجابايت' : '5 ميجابايت';
    if (file.size > maxSize) {
      alert(`حجم الملف كبير جداً. الحد الأقصى هو ${maxSizeLabel}.`);
      return;
    }

    setMediaUploadLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from(mediaBucket)
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        alert("فشل رفع الملف: " + error.message);
      } else {
        alert(isAttachmentBucket ? "تم رفع المرفق بنجاح!" : "تم رفع الصورة بنجاح!");
        fetchMedia();
      }
    } catch (e) {
      alert("حدث خطأ أثناء الرفع: " + e.message);
    } finally {
      setMediaUploadLoading(false);
    }
  };

  const isImageFile = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['ppt', 'pptx'].includes(ext)) return '📎';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return '🎬';
    if (['mp3', 'wav', 'ogg'].includes(ext)) return '🎵';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
    return '📁';
  };

  const handleDeleteFile = async (fileName) => {
    if (!confirm("هل أنت متأكد من حذف هذا الملف نهائياً؟")) return;

    setMediaLoading(true);
    try {
      const { error } = await supabase.storage.from(mediaBucket).remove([fileName]);
      if (error) {
        alert("فشل حذف الملف: " + error.message);
      } else {
        alert("تم حذف الملف بنجاح!");
        fetchMedia();
      }
    } catch (e) {
      alert("حدث خطأ أثناء الحذف: " + e.message);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    alert("تم نسخ الرابط المباشر بنجاح!");
  };

  const handleBucketSwitch = (bucketName) => {
    if (bucketName === mediaBucket) return;
    setMediaBucket(bucketName);
    setMediaSearchTerm('');
    setMediaFiles([]);
    setMediaBucketError(null);
    // fetchMedia will trigger via useEffect dependency on mediaBucket
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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

  // --- SOLVE FILTERED COURSES AND STATS ---
  const stats = liveStats;

  const currentAnalyticsCourseId = useMemo(() => {
    return currentCourses.some(c => c.id === analyticsSelectedCourseId)
      ? analyticsSelectedCourseId
      : (currentCourses[0]?.id || '');
  }, [currentCourses, analyticsSelectedCourseId]);

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
            <li>
              <button 
                className={`menu-item-btn ${activeTab === 'warnings' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('warnings');
                  setEditingCourseId(null);
                }}
              >
                <AlertTriangle />
                <span>الإنذار المبكر</span>
              </button>
            </li>
            <li>
              <button 
                className={`menu-item-btn ${activeTab === 'complaints' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('complaints');
                  setEditingCourseId(null);
                }}
                style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MessageSquare />
                  <span>الشكاوى والاقتراحات</span>
                </div>
                {liveComplaints.length > 0 && (
                  <span style={{
                    backgroundColor: '#EF4444',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    marginRight: 'auto'
                  }}>
                    {liveComplaints.length}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button 
                className={`menu-item-btn ${activeTab === 'media' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('media');
                  setEditingCourseId(null);
                }}
              >
                <Image />
                <span>مكتبة الوسائط</span>
              </button>
            </li>
            <li>
              <button 
                className={`menu-item-btn ${activeTab === 'exams' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('exams');
                  setEditingCourseId(null);
                }}
              >
                <FileText />
                <span>إدارة الامتحانات</span>
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
                  {activeTab === 'warnings' && 'نظام الإنذار المبكر'}
                  {activeTab === 'complaints' && 'الشكاوى والاقتراحات'}
                  {activeTab === 'media' && 'مكتبة الوسائط والصور'}
                  {activeTab === 'exams' && 'إدارة وإضافة الامتحانات'}
                </h1>
                <p>
                  {activeTab === 'overview' && 'مرحباً بك مجدداً، أ. أحمد. إليك آخر مستجدات المنصة التعليمية لهذا اليوم.'}
                  {activeTab === 'courses' && 'عرض، تعديل، ونشر الفصول الدراسية والكورسات التعليمية لمختلف الصفوف.'}
                  {activeTab === 'editor' && 'اختر كورس من قائمة الكورسات لبدء تحرير المحاضرات وإعادة ترتيبها.'}
                  {activeTab === 'students' && 'متابعة بيانات الطلاب ونسب تقدمهم الدراسي وتتبع إتمام الدروس والمشاهدات.'}
                  {activeTab === 'enrollments' && 'إضافة أو حذف الاشتراكات اليدوية للطلاب بالكورسات المدفوعة.'}
                  {activeTab === 'analytics' && 'رؤى بيانية مفصلة حول إتمام الدروس ونسب التساقط وشعبية الكورسات.'}
                  {activeTab === 'warnings' && 'تتبع تلقائي للطلاب المعرضين للتعثر أو الانقطاع الدراسي واتخاذ الإجراءات الوقائية.'}
                  {activeTab === 'complaints' && 'متابعة شكاوى الطلاب، رسائل الدعم الفني، والملاحظات المستلمة للعمل على حلها.'}
                  {activeTab === 'media' && 'رفع وإدارة صور المنصة، واستخراج روابطها المباشرة لاستخدامها في تفاصيل الكورسات والمحاضرات.'}
                  {activeTab === 'exams' && 'إضافة امتحانات للطلاب وتحديد الصفوف الدراسية المستهدفة ومرفقات الامتحانات.'}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {course.thumbnail_url ? (
                              <img 
                                src={course.thumbnail_url} 
                                alt={course.title} 
                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', backgroundColor: 'rgba(255,255,255,0.05)' }} 
                              />
                            ) : (
                              <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BookOpen size={20} style={{ color: 'var(--text-muted)' }} />
                              </div>
                            )}
                            <div>
                              <div className="course-meta-title">{course.title}</div>
                              <div className="course-meta-subtitle">{getYearTitle(course.year_id)}</div>
                            </div>
                          </div>
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

                    <div className="form-group" style={{ position: 'relative' }}>
                      <label className="form-label">الصورة المصغرة للكورس (Thumbnail)</label>
                      
                      {/* Selected thumbnail preview */}
                      <div 
                        onClick={() => setThumbnailDropdownOpen(!thumbnailDropdownOpen)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-card)',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s',
                          borderColor: thumbnailDropdownOpen ? 'var(--primary)' : 'var(--border-color)'
                        }}
                      >
                        {editorCourseForm.thumbnail_url ? (
                          <>
                            <img 
                              src={editorCourseForm.thumbnail_url} 
                              alt="thumbnail" 
                              style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'right' }}>
                                {editorCourseForm.thumbnail_url.split('/').pop()}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>اضغط لتغيير الصورة</div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditorCourseForm(prev => ({ ...prev, thumbnail_url: '' }));
                              }}
                              style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px',
                                cursor: 'pointer',
                                color: '#EF4444',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="إزالة الصورة"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <div style={{
                              width: '44px', height: '44px', borderRadius: '6px',
                              backgroundColor: 'var(--bg-app)', border: '1px dashed var(--border-color)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <Image size={20} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>اختر صورة مصغرة من مكتبة الصور</div>
                            </div>
                            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                          </>
                        )}
                      </div>

                      {/* Dropdown */}
                      {thumbnailDropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 50,
                          marginTop: '4px',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                          maxHeight: '320px',
                          overflowY: 'auto'
                        }}>
                          {courseImagesList.length > 0 ? (
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                              gap: '8px',
                              padding: '12px'
                            }}>
                              {courseImagesList.map(img => (
                                <div
                                  key={img.id || img.name}
                                  onClick={() => {
                                    setEditorCourseForm(prev => ({ ...prev, thumbnail_url: img.url }));
                                    setThumbnailDropdownOpen(false);
                                  }}
                                  style={{
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: editorCourseForm.thumbnail_url === img.url ? '2px solid var(--primary)' : '2px solid transparent',
                                    transition: 'all 0.2s',
                                    backgroundColor: 'var(--bg-app)',
                                    position: 'relative'
                                  }}
                                  title={img.name}
                                >
                                  <img 
                                    src={img.url} 
                                    alt={img.name}
                                    style={{ width: '100%', height: '72px', objectFit: 'cover', display: 'block' }}
                                  />
                                  {editorCourseForm.thumbnail_url === img.url && (
                                    <div style={{
                                      position: 'absolute',
                                      top: '4px',
                                      right: '4px',
                                      backgroundColor: 'var(--primary)',
                                      borderRadius: '50%',
                                      width: '18px',
                                      height: '18px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <CheckCircle size={12} style={{ color: '#fff' }} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                              <Image size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
                              <p>لا توجد صور في حاوية صور الكورسات. ارفع صورة أولاً من تبويب "الميديا".</p>
                            </div>
                          )}
                        </div>
                      )}
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
                                {lesson.attachment_urls && lesson.attachment_urls.length > 0 ? (
                                  <span style={{ color: 'var(--primary)' }}>
                                    <Layers size={12} />
                                    <span>{lesson.attachment_urls.length} مرفق</span>
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

                              {/* --- ATTACHMENTS SELECTOR --- */}
                              <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Layers size={14} />
                                  <span>المرفقات المرتبطة بالدرس</span>
                                  {lessonEditForm.attachment_urls.length > 0 && (
                                    <span style={{
                                      backgroundColor: 'var(--primary)',
                                      color: '#fff',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      padding: '2px 8px',
                                      borderRadius: '10px',
                                      minWidth: '20px',
                                      textAlign: 'center'
                                    }}>
                                      {lessonEditForm.attachment_urls.length}
                                    </span>
                                  )}
                                </label>

                                {/* Selected attachments list */}
                                {lessonEditForm.attachment_urls.length > 0 && (
                                  <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    marginBottom: '12px',
                                    padding: '10px',
                                    backgroundColor: 'rgba(59,130,246,0.04)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(59,130,246,0.1)'
                                  }}>
                                    {lessonEditForm.attachment_urls.map((url, i) => (
                                      <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '6px 8px',
                                        backgroundColor: 'var(--bg-card)',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)',
                                        fontSize: '12px'
                                      }}>
                                        <FileText size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'right', color: 'var(--text-main)' }}>
                                          {decodeURIComponent(url.split('/').pop())}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => toggleAttachmentUrl(url)}
                                          style={{
                                            background: 'rgba(239,68,68,0.1)',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '2px',
                                            cursor: 'pointer',
                                            color: '#EF4444',
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexShrink: 0
                                          }}
                                          title="إزالة"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Available attachments grid */}
                                <div style={{
                                  maxHeight: '200px',
                                  overflowY: 'auto',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--bg-app)'
                                }}>
                                  {attachmentFilesList.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      {attachmentFilesList.map(file => {
                                        const isSelected = (lessonEditForm.attachment_urls || []).includes(file.url);
                                        const ext = file.name?.split('.').pop()?.toLowerCase();
                                        const isImg = ['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext);
                                        return (
                                          <div
                                            key={file.id || file.name}
                                            onClick={() => toggleAttachmentUrl(file.url)}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '10px',
                                              padding: '8px 12px',
                                              cursor: 'pointer',
                                              transition: 'background-color 0.15s',
                                              backgroundColor: isSelected ? 'rgba(59,130,246,0.08)' : 'transparent',
                                              borderBottom: '1px solid var(--border-color)'
                                            }}
                                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                          >
                                            {/* Checkbox */}
                                            <div style={{
                                              width: '18px',
                                              height: '18px',
                                              borderRadius: '4px',
                                              border: isSelected ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                                              backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              flexShrink: 0,
                                              transition: 'all 0.15s'
                                            }}>
                                              {isSelected && <CheckCircle size={12} style={{ color: '#fff' }} />}
                                            </div>

                                            {/* Preview */}
                                            {isImg ? (
                                              <img src={file.url} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }} />
                                            ) : (
                                              <div style={{
                                                width: '32px', height: '32px', borderRadius: '4px',
                                                backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '16px', flexShrink: 0
                                              }}>
                                                {getFileIcon(file.name)}
                                              </div>
                                            )}

                                            {/* File info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'right' }}>
                                                {file.name}
                                              </div>
                                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px', direction: 'ltr', textAlign: 'right' }}>
                                                {ext?.toUpperCase()} • {formatBytes(file.metadata?.size || 0)}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                                      <FileText size={24} style={{ marginBottom: '6px', opacity: 0.5 }} />
                                      <p>لا توجد مرفقات متاحة. ارفع ملفات أولاً من تبويب "الميديا" بعد التبديل لحاوية المرفقات.</p>
                                    </div>
                                  )}
                                </div>
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
                      <th>الإجراءات</th>
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
                        <td>
                          {student.phone ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{student.phone}</span>
                              <a 
                                href={getWhatsAppUrl(student.phone)}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="whatsapp-icon-btn"
                                title="تواصل عبر واتساب"
                              >
                                <WhatsAppIcon size={14} />
                              </a>
                            </div>
                          ) : (
                            'غير محدد'
                          )}
                        </td>
                        <td>
                          <span className="badge badge-success" style={{ padding: '2px 8px' }}>
                            {getStudentEnrollmentCount(student.id)} كورس
                          </span>
                        </td>
                        <td>{new Date(student.created_at).toLocaleDateString('ar-EG')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
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
                            {student.phone && (
                              <a 
                                href={getWhatsAppUrl(student.phone)}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-whatsapp btn-sm"
                                title="تواصل عبر واتساب مباشرة"
                              >
                                <WhatsAppIcon size={14} />
                                <span>واتساب</span>
                              </a>
                            )}
                          </div>
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
                  value={currentAnalyticsCourseId}
                  onChange={(e) => setAnalyticsSelectedCourseId(e.target.value)}
                  style={{ minWidth: '220px' }}
                >
                  {currentCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              {getLessonsForCourse(currentAnalyticsCourseId).length > 0 ? (
                <div>
                  <div className="dropoff-chart-container">
                    {getAnalyticsDropoffs(currentAnalyticsCourseId).map((lesson, idx) => {
                      const maxCompleted = Math.max(...getAnalyticsDropoffs(currentAnalyticsCourseId).map(l => l.completedCount), 1);
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

        {/* --- PAGE 7: WARNINGS --- */}
        {activeTab === 'warnings' && (
          <EarlyWarningSystem 
            onViewProfile={(studentId) => {
              if (typeof studentId === 'string') {
                setSelectedStudentId(studentId);
                setStudentDetailOpen(true);
              }
            }}
          />
        )}

        {/* --- PAGE 8: COMPLAINTS --- */}
        {activeTab === 'complaints' && (
          <div className="tab-pane active animate-fade-in" style={{ direction: 'rtl' }}>
            {/* Header Toolbar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div className="search-bar" style={{ flex: 1, maxWidth: '450px', marginBottom: 0 }}>
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="البحث باسم الطالب، البريد الإلكتروني، أو محتوى الشكوى..." 
                  value={complaintSearchTerm}
                  onChange={(e) => setComplaintSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    direction: 'rtl'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="stat-badge" style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#3B82F6',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  إجمالي الشكاوى: {filteredComplaints.length}
                </div>
                <div className="stat-badge" style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#EF4444',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  شكاوى اليوم: {
                    filteredComplaints.filter(c => {
                      const today = new Date().toDateString();
                      const date = new Date(c.created_at).toDateString();
                      return date === today;
                    }).length
                  }
                </div>
              </div>
            </div>

            {/* Complaints list */}
            {filteredComplaints.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '20px'
              }}>
                {filteredComplaints.map((complaint) => {
                  const student = liveStudents.find(s => s.id === complaint.user_id);
                  return (
                    <div 
                      key={complaint.id} 
                      className="dashboard-card" 
                      style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-card)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                      }}
                    >
                      <div>
                        {/* Student Details Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '16px',
                          borderBottom: '1px solid var(--border-color)',
                          paddingBottom: '12px'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3B82F6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }}>
                            {student?.full_name ? student.full_name.charAt(0) : 'ط'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {student?.full_name || 'طالب غير معروف'}
                            </h4>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {student?.email || 'لا يوجد بريد'}
                            </div>
                          </div>
                        </div>

                        {/* Complaint Content */}
                        <div 
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-main)',
                            lineHeight: '1.6',
                            marginBottom: '20px',
                            maxHeight: '120px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 5,
                            WebkitBoxOrient: 'vertical',
                            whiteSpace: 'pre-wrap',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setIsComplaintModalOpen(true);
                          }}
                          title="انقر لقراءة الشكوى كاملة"
                        >
                          {complaint.complaint_text}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '12px',
                        marginTop: 'auto'
                      }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(complaint.created_at).toLocaleString('ar-EG', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {student?.phone && (
                            <a 
                              href={`${getWhatsAppUrl(student.phone)}?text=${encodeURIComponent('تم حل مشكلتك تقدر تشوف حسابك الان')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-whatsapp btn-sm"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                textDecoration: 'none'
                              }}
                            >
                              <WhatsAppIcon size={12} />
                              <span>تواصل</span>
                            </a>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setIsComplaintModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={12} />
                            <span>عرض</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteComplaint(complaint.id)}
                            className="btn btn-danger btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={12} />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '60px 0' }}>
                <MessageSquare size={48} style={{ color: 'var(--text-muted)' }} />
                <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '500' }}>
                  {complaintSearchTerm ? 'لا توجد نتائج مطابقة لخيارات البحث.' : 'لا توجد شكاوى أو اقتراحات حالياً في النظام.'}
                </p>
              </div>
            )}

            {/* Complaint Detail Modal */}
            {isComplaintModalOpen && selectedComplaint && (() => {
              const student = liveStudents.find(s => s.id === selectedComplaint.user_id);
              return (
                <div className="modal-overlay" onClick={() => setIsComplaintModalOpen(false)}>
                  <div className="modal-container" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3 className="modal-title">تفاصيل الشكوى والاقتراح</h3>
                      <button className="modal-close-btn" onClick={() => setIsComplaintModalOpen(false)}>
                        <X size={20} />
                      </button>
                    </div>
                    <div className="modal-body" style={{ padding: '20px 0', direction: 'rtl' }}>
                      {/* Student info */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: '8px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          width: '45px',
                          height: '45px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: '#3B82F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '18px'
                        }}>
                          {student?.full_name ? student.full_name.charAt(0) : 'ط'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>
                            {student?.full_name || 'طالب غير معروف'}
                          </h4>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px', marginTop: '4px' }}>
                            <span>{student?.email || 'لا يوجد بريد'}</span>
                            {student?.phone && <span>{student.phone}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Complaint Text */}
                      <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'right' }}>نص الشكوى / الاقتراح:</h5>
                      <div style={{
                        padding: '16px',
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        color: 'var(--text-main)',
                        maxHeight: '250px',
                        overflowY: 'auto',
                        border: '1px solid var(--border-color)',
                        textAlign: 'right'
                      }}>
                        {selectedComplaint.complaint_text}
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'left' }}>
                        تاريخ الإرسال: {new Date(selectedComplaint.created_at).toLocaleString('ar-EG', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      {student?.phone && (
                        <a 
                          href={`${getWhatsAppUrl(student.phone)}?text=${encodeURIComponent('تم حل مشكلتك تقدر تشوف حسابك الان')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-whatsapp"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none'
                          }}
                        >
                          <WhatsAppIcon size={16} />
                          <span>تواصل عبر الواتساب</span>
                        </a>
                      )}
                      <button 
                        onClick={() => {
                          handleDeleteComplaint(selectedComplaint.id);
                          setIsComplaintModalOpen(false);
                        }}
                        className="btn btn-danger"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Trash2 size={16} />
                        <span>حذف الشكوى</span>
                      </button>
                      <button className="btn btn-secondary" onClick={() => setIsComplaintModalOpen(false)}>
                        إغلاق
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* --- PAGE 9: MEDIA --- */}
        {activeTab === 'media' && (
          <div 
            className="tab-pane active animate-fade-in" 
            style={{ 
              direction: 'rtl',
              position: 'relative',
              minHeight: '450px'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleUploadFile(e);
            }}
          >
            {/* Drag & Drop Overlay */}
            {isDragging && (
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '3px dashed var(--primary)',
                borderRadius: '12px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                pointerEvents: 'none'
              }}>
                <Upload size={48} style={{ marginBottom: '16px', animation: 'bounce 1s infinite' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {isAttachmentBucket ? 'أفلت الملف هنا لرفعه مباشرة' : 'أفلت الصورة هنا لرفعها مباشرة'}
                </h3>
              </div>
            )}

            {/* === BUCKET SWITCHER === */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'inline-flex',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '4px',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <button
                  onClick={() => handleBucketSwitch('course-images')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '9px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: mediaBucket === 'course-images' ? '700' : '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.25s ease',
                    backgroundColor: mediaBucket === 'course-images' ? 'var(--primary)' : 'transparent',
                    color: mediaBucket === 'course-images' ? '#fff' : 'var(--text-muted)',
                    boxShadow: mediaBucket === 'course-images' ? '0 2px 8px rgba(59,130,246,0.3)' : 'none'
                  }}
                >
                  <Image size={16} />
                  <span>صور الكورسات</span>
                </button>
                <button
                  onClick={() => handleBucketSwitch('attachment')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '9px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: mediaBucket === 'attachment' ? '700' : '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.25s ease',
                    backgroundColor: mediaBucket === 'attachment' ? 'var(--primary)' : 'transparent',
                    color: mediaBucket === 'attachment' ? '#fff' : 'var(--text-muted)',
                    boxShadow: mediaBucket === 'attachment' ? '0 2px 8px rgba(59,130,246,0.3)' : 'none'
                  }}
                >
                  <FileText size={16} />
                  <span>المرفقات</span>
                </button>
              </div>
            </div>

            {mediaBucketError === 'bucket_not_found' ? (
              <div className="dashboard-card" style={{ padding: '40px 32px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <AlertTriangle size={54} style={{ color: '#EF4444', marginBottom: '20px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-main)' }}>حاوية التخزين (Storage Bucket) غير موجودة</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                  لم يتم العثور على حاوية تخزين باسم <strong style={{ color: 'var(--primary)', direction: 'ltr', display: 'inline-block' }}>'media'</strong> في حساب Supabase الخاص بك. 
                  لتتمكن من رفع الصور وعرضها، يرجى القيام بإنشائها عبر الخطوات التالية:
                </p>
                <div style={{ textAlign: 'right', fontSize: '13px', backgroundColor: 'var(--bg-app)', padding: '20px', borderRadius: '8px', marginBottom: '24px', lineHeight: '2.0', border: '1px solid var(--border-color)' }}>
                  <ol style={{ margin: 0, paddingRight: '20px', color: 'var(--text-main)' }}>
                    <li>افتح لوحة تحكم <strong>Supabase Console</strong> لمشروعك.</li>
                    <li>اذهب إلى قسم <strong>Storage</strong> من القائمة الجانبية اليسرى.</li>
                    <li>اضغط على زر <strong>New Bucket</strong> وقم بتسميته <strong style={{ color: 'var(--primary)' }}>media</strong> بالظبط.</li>
                    <li>تأكد من تفعيل خيار <strong>Public bucket</strong> لتكون الصور متاحة بروابط مباشرة.</li>
                    <li>اذهب لتبويب <strong>Policies</strong> في الـ Storage وقم بإضافة سياسة RLS تمنح صلاحيات القراءة والرفع والحذف للمستخدمين.</li>
                  </ol>
                </div>
                <button 
                  onClick={() => fetchMedia('media')} 
                  className="btn btn-primary" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '6px' }}
                >
                  <RefreshCw size={16} />
                  <span>لقد قمت بإنشائها، تحقق الآن</span>
                </button>
              </div>
            ) : mediaBucketError ? (
              <div className="dashboard-card" style={{ padding: '32px', textAlign: 'center', maxWidth: '500px', margin: '40px auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <AlertTriangle size={48} style={{ color: '#F59E0B', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>حدث خطأ أثناء تحميل الملفات</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>{mediaBucketError}</p>
                <button onClick={() => fetchMedia()} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            ) : (
              <>
                {/* Header Toolbar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  {/* Search Bar */}
                  <div className="search-bar" style={{ flex: 1, maxWidth: '400px', marginBottom: 0 }}>
                    <Search size={18} />
                    <input 
                      type="text" 
                      placeholder={isAttachmentBucket ? 'البحث باسم المرفق...' : 'البحث باسم الصورة...'}
                      value={mediaSearchTerm}
                      onChange={(e) => setMediaSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 36px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontSize: '14px',
                        direction: 'rtl'
                      }}
                    />
                  </div>

                  {/* Actions & Drop zone trigger */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Bucket Info */}
                    <div style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                      <span>الحاوية النشطة: <strong>{mediaBucket}</strong></span>
                    </div>

                    {/* Upload Button */}
                    <label 
                      className="btn btn-primary" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        cursor: 'pointer',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      {mediaUploadLoading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                      <span>{mediaUploadLoading ? 'جاري الرفع...' : (isAttachmentBucket ? 'رفع مرفق جديد' : 'رفع صورة جديدة')}</span>
                      <input 
                        type="file" 
                        accept={isAttachmentBucket ? '*/*' : 'image/*'}
                        onChange={handleUploadFile} 
                        style={{ display: 'none' }} 
                        disabled={mediaUploadLoading}
                      />
                    </label>

                    <button 
                      onClick={() => fetchMedia()} 
                      className="btn btn-secondary" 
                      style={{ padding: '9px', borderRadius: '8px' }}
                      title="تحديث القائمة"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>

                {/* Media grid */}
                {mediaLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>جاري تحميل مكتبة الصور...</span>
                    </div>
                  </div>
                ) : filteredMediaFiles.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                    gap: '20px'
                  }}>
                    {filteredMediaFiles.map((file) => (
                      <div 
                        key={file.id} 
                        className="dashboard-card" 
                        style={{
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-card)',
                          overflow: 'hidden',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.03)';
                        }}
                      >
                        {/* File Preview Container */}
                        <div style={{
                          width: '100%',
                          height: '140px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: 'var(--bg-app)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          marginBottom: '12px',
                          border: '1px solid var(--border-color)'
                        }}>
                          {isImageFile(file.name) ? (
                            <img 
                              src={file.url} 
                              alt={file.name} 
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                            />
                          ) : (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span style={{ fontSize: '42px' }}>{getFileIcon(file.name)}</span>
                              <span style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                fontWeight: '700',
                                letterSpacing: '0.5px',
                                backgroundColor: 'var(--bg-card)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)'
                              }}>
                                {file.name?.split('.').pop()?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Image Meta Info */}
                        <div style={{ flex: 1, minWidth: 0, marginBottom: '12px' }}>
                          <div 
                            style={{ 
                              fontSize: '13px', 
                              fontWeight: '600', 
                              color: 'var(--text-main)', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              direction: 'ltr',
                              textAlign: 'right'
                            }}
                            title={file.name}
                          >
                            {file.name}
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '11px', 
                            color: 'var(--text-muted)',
                            marginTop: '6px'
                          }}>
                            <span>{formatBytes(file.metadata?.size || 0)}</span>
                            <span>
                              {file.created_at ? new Date(file.created_at).toLocaleDateString('ar-EG', {
                                day: 'numeric',
                                month: 'short'
                              }) : ''}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                          display: 'flex',
                          gap: '6px',
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: '10px',
                          marginTop: 'auto'
                        }}>
                          <button 
                            onClick={() => handleCopyUrl(file.url)}
                            className="btn btn-primary btn-sm"
                            style={{ 
                              flex: 1, 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              gap: '4px',
                              padding: '6px 0',
                              fontSize: '12px'
                            }}
                            title="نسخ الرابط المباشر للعمل به في المناهج"
                          >
                            <Copy size={12} />
                            <span>نسخ الرابط</span>
                          </button>
                          
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ 
                              padding: '6px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="عرض في علامة تبويب جديدة"
                          >
                            <ExternalLink size={12} />
                          </a>

                          <button 
                            onClick={() => handleDeleteFile(file.name)}
                            className="btn btn-danger btn-sm"
                            style={{ 
                              padding: '6px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="حذف الملف"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '80px 0', border: '2px dashed var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-card)' }}>
                    <Upload size={54} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                      {mediaSearchTerm ? 'لا توجد نتائج مطابقة لاسم الملف.' : (isAttachmentBucket ? 'مكتبة المرفقات فارغة' : 'مكتبة الصور فارغة')}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '320px', margin: '0 auto 20px' }}>
                      {mediaSearchTerm ? 'يرجى التحقق من الاسم أو تجربة كلمة أخرى.' : (isAttachmentBucket ? 'اسحب الملفات وأفلتها هنا مباشرة، أو اضغط على الزر في الأعلى لرفع أول مرفق.' : 'اسحب الصور وأفلتها هنا مباشرة، أو اضغط على الزر في الأعلى لرفع أول صورة.')}
                    </p>
                    {!mediaSearchTerm && (
                      <label 
                        className="btn btn-primary" 
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Upload size={14} />
                        <span>{isAttachmentBucket ? 'اختر مرفق لرفعه' : 'اختر صورة لرفعها'}</span>
                        <input 
                          type="file" 
                          accept={isAttachmentBucket ? '*/*' : 'image/*'}
                          onChange={handleUploadFile} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    )}
                  </div>
                )}
              </>
            )}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Phone size={16} style={{ color: 'var(--accent-gold)' }} />
                      <span>{selectedStudent.phone || 'رقم الهاتف غير مسجل'}</span>
                    </div>
                    {selectedStudent.phone && (
                      <a 
                        href={getWhatsAppUrl(selectedStudent.phone)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        style={{ 
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '500',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <WhatsAppIcon size={12} />
                        <span>مراسلة واتساب</span>
                      </a>
                    )}
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
                  <label className="form-label">رابط الصورة المصغرة (Thumbnail URL)</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="رابط الصورة المصغرة للكورس (مثال: https://...)"
                    value={newCourseForm.thumbnail_url}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, thumbnail_url: e.target.value }))}
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

        {/* --- PAGE 10: EXAMS --- */}
        {activeTab === 'exams' && (
          <div className="tab-pane active animate-fade-in" style={{ direction: 'rtl' }}>
            <div className="content-card">
              <div className="card-header-area">
                <div>
                  <h3 className="card-title">إضافة امتحان جديد</h3>
                  <span className="card-subtitle">اختر ملف الامتحان من المرفقات وحدد الصف الدراسي</span>
                </div>
                <FileText style={{ color: 'var(--primary)' }} />
              </div>

              <div style={{ padding: '24px' }}>
                <form 
                  onSubmit={handleAddExam}
                  style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}
                >
                  <div className="form-group">
                    <label className="form-label">عنوان الامتحان</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="اكتب عنوان أو اسم الامتحان هنا..."
                      value={examForm.title}
                      onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">الصف الدراسي المستهدف</label>
                    <select 
                      className="form-select"
                      value={examForm.year_id}
                      onChange={(e) => setExamForm(prev => ({ ...prev, year_id: e.target.value }))}
                      required
                    >
                      <option value="" disabled>-- اختر الصف الدراسي --</option>
                      {currentYears.map(year => (
                        <option key={year.id} value={year.id}>{year.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">ملف الامتحان (من المرفقات)</label>
                    <select 
                      className="form-select"
                      value={examForm.exam_url}
                      onChange={(e) => setExamForm(prev => ({ ...prev, exam_url: e.target.value }))}
                      required
                    >
                      <option value="" disabled>-- اختر ملف الامتحان --</option>
                      {attachmentFilesList && attachmentFilesList.length > 0 ? (
                        attachmentFilesList.map((file, idx) => (
                          <option key={idx} value={file.url}>{decodeURIComponent(file.name)}</option>
                        ))
                      ) : (
                        <option value="" disabled>لا توجد ملفات مرفقة، الرجاء رفعها في قسم الميديا أولاً</option>
                      )}
                    </select>
                    {examForm.exam_url && (
                      <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        الملف المختار: <a href={examForm.exam_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>معاينة الملف</a>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
                    حفظ الامتحان
                  </button>
                </form>
              </div>
            </div>

            {/* Exams List */}
            <div className="content-card" style={{ marginTop: '24px' }}>
              <div className="card-header-area">
                <div>
                  <h3 className="card-title">الامتحانات المضافة</h3>
                  <span className="card-subtitle">قائمة بجميع الامتحانات المضافة للطلاب</span>
                </div>
              </div>
              <div className="table-container">
                {allExams && allExams.length > 0 ? (
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>عنوان الامتحان</th>
                        <th>الصف الدراسي</th>
                        <th>تاريخ الإضافة</th>
                        <th>العمليات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allExams.map(exam => (
                        <tr key={exam.id}>
                          <td>
                            <a href={exam.exam_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-main)', fontWeight: '600', textDecoration: 'none' }}>
                              {exam.title}
                            </a>
                          </td>
                          <td>{currentYears.find(y => y.id === exam.year_id)?.title || 'غير محدد'}</td>
                          <td>{new Date(exam.created_at).toLocaleDateString('ar-EG')}</td>
                          <td>
                            <div className="actions-cell">
                              <button 
                                className="action-btn delete-btn" 
                                onClick={() => handleDeleteExam(exam.id)}
                                title="حذف الامتحان"
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
                    <FileText size={48} />
                    <p style={{ marginTop: '16px', fontSize: '15px' }}>لا توجد امتحانات مضافة حتى الآن.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Exam Submissions List */}
            <div className="content-card" style={{ marginTop: '24px' }}>
              <div className="card-header-area">
                <div>
                  <h3 className="card-title">تسليمات الامتحانات</h3>
                  <span className="card-subtitle">الطلاب الذين قاموا بالرد وإرسال الامتحانات</span>
                </div>
              </div>
              <div className="table-container">
                {allExamSubmissions && allExamSubmissions.length > 0 ? (
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>اسم الطالب</th>
                        <th>الامتحان</th>
                        <th>وقت التسليم</th>
                        <th>التواصل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allExamSubmissions.map(sub => {
                        const student = liveStudents.find(s => s.id === sub.user_id);
                        const exam = allExams.find(e => e.id === sub.exam_id);
                        
                        // Format phone number for WhatsApp (assuming Egypt +2)
                        let waLink = '#';
                        if (student?.phone) {
                          const cleanPhone = student.phone.replace(/\D/g, '');
                          const finalPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
                          waLink = `https://wa.me/${finalPhone}`;
                        }

                        return (
                          <tr key={sub.id}>
                            <td>
                              <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                {student ? student.full_name : 'غير متوفر'}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {student?.phone || ''}
                              </div>
                            </td>
                            <td>{exam ? exam.title : 'غير متوفر'}</td>
                            <td>{new Date(sub.submitted_at).toLocaleString('ar-EG')}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {student?.phone ? (
                                  <a 
                                    href={waLink}
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-primary" 
                                    style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff', textDecoration: 'none', display: 'inline-block' }}
                                  >
                                    مراسلة واتساب
                                  </a>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>لا يوجد رقم</span>
                                )}
                                <button 
                                  className="action-btn delete-btn" 
                                  onClick={() => handleDeleteSubmission(sub.id)}
                                  title="إلغاء تسليم الطالب"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <FileText size={48} />
                    <p style={{ marginTop: '16px', fontSize: '15px' }}>لا توجد تسليمات للامتحانات حتى الآن.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
