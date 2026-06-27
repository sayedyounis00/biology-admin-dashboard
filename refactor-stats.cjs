const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Replace the state declarations with useMemo
code = code.replace(
  `  const [liveEnrollmentCounts, setLiveEnrollmentCounts] = useState({});`,
  `  const liveEnrollmentCounts = useMemo(() => {
    const counts = {};
    liveEnrollments.forEach(e => {
      counts[e.course_id] = (counts[e.course_id] || 0) + 1;
    });
    return counts;
  }, [liveEnrollments]);`
);

code = code.replace(
  `  const [liveStats, setLiveStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
    recentSignups: [],
    recentEnrollments: [],
    chartData: []
  });`,
  `  const liveStats = useMemo(() => {
    const studentCount = liveStudents.length;
    const courseCount = liveCourses.length;

    const profileMap = {};
    liveStudents.forEach(p => { profileMap[p.id] = p; });

    const courseMap = {};
    liveCourses.forEach(c => { courseMap[c.id] = c; });

    const enrichedEnrollments = liveEnrollments.map(e => ({
      ...e,
      profile: profileMap[e.user_id] || { full_name: 'طالب غير معروف', email: 'N/A' },
      course: courseMap[e.course_id] || { title: 'كورس غير معروف', price: 0 }
    }));

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

    return {
      totalStudents: studentCount,
      totalCourses: courseCount,
      totalRevenue: totalRev,
      activeEnrollments: activeThisMonth,
      recentSignups: liveStudents.slice(0, 5),
      recentEnrollments: enrichedEnrollments.slice(0, 5),
      chartData: finalChart
    };
  }, [liveStudents, liveCourses, liveEnrollments]);`
);

// 2. Remove the calculation inside fetchData
// It is between "      // Enrollment counts per course" and "    } catch (err) {"
const startStr = "      // Enrollment counts per course";
const endStr = "    } catch (err) {";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
}

fs.writeFileSync('src/App.jsx', code);
console.log('Refactoring stats complete.');
