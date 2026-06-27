const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. handleTogglePublish
code = code.replace(
  `    if (!error) {
      await fetchData();
    } else {`,
  `    if (!error) {
      setLiveCourses(prev => prev.map(c => c.id === courseId ? { ...c, is_published: !currentStatus } : c));
    } else {`
);

// 2. handleDeleteCourse
code = code.replace(
  `    if (!error) {
      await fetchData();
      if (editingCourseId === courseId) setEditingCourseId(null);
    } else {`,
  `    if (!error) {
      setLiveCourses(prev => prev.filter(c => c.id !== courseId));
      if (editingCourseId === courseId) setEditingCourseId(null);
    } else {`
);

// 3. handleCreateCourse
code = code.replace(
  `    if (!error && data) {
      await fetchData();
      setIsNewCourseModalOpen(false);`,
  `    if (!error && data) {
      setLiveCourses(prev => [data, ...prev]);
      setIsNewCourseModalOpen(false);`
);

// 4. handleUpdateCourseDetails
code = code.replace(
  `    if (!error) {
      alert("تم تعديل الكورس بنجاح!");
      await fetchData();
    } else {`,
  `    if (!error) {
      alert("تم تعديل الكورس بنجاح!");
      setLiveCourses(prev => prev.map(c => c.id === editingCourseId ? { ...c, 
        title: editorCourseForm.title,
        description: editorCourseForm.description,
        price: Number(editorCourseForm.price) || 0,
        year_id: editorCourseForm.year_id,
        thumbnail_url: editorCourseForm.thumbnail_url || null,
        is_published: editorCourseForm.is_published
      } : c));
    } else {`
);

// 5. handleAddLesson
code = code.replace(
  `    if (!error && data) {
      setEditorLessons(prev => [...prev, data]);
      await fetchData();
      handleOpenLessonEdit(data);`,
  `    if (!error && data) {
      setEditorLessons(prev => [...prev, data]);
      setLiveLessons(prev => [...prev, data]);
      handleOpenLessonEdit(data);`
);

// 6. handleDeleteLesson
code = code.replace(
  `      }
      await fetchData();
      setEditorLessons(remaining);`,
  `      }
      setLiveLessons(prev => prev.filter(l => l.id !== lessonId));
      setEditorLessons(remaining);`
);

// 7. handleMoveLesson
code = code.replace(
  `    ]);
    await fetchData();
    setIsLoading(false);`,
  `    ]);
    // Optionally update liveLessons but editorLessons is already updated
    setLiveLessons(prev => {
      const newList = [...prev];
      const idx1 = newList.findIndex(l => l.id === list[index].id);
      const idx2 = newList.findIndex(l => l.id === list[targetIndex].id);
      if (idx1 !== -1 && idx2 !== -1) {
        const temp = newList[idx1].order_index;
        newList[idx1].order_index = newList[idx2].order_index;
        newList[idx2].order_index = temp;
      }
      return newList;
    });
    setIsLoading(false);`
);

// 8. handleSaveLessonEdit
code = code.replace(
  `    if (!error) {
      setEditorLessons(prev => prev.map(l => l.id === lessonId ? { ...l, ...fields } : l));
      await fetchData();
      setActiveLessonEditId(null);`,
  `    if (!error) {
      setEditorLessons(prev => prev.map(l => l.id === lessonId ? { ...l, ...fields } : l));
      setLiveLessons(prev => prev.map(l => l.id === lessonId ? { ...l, ...fields } : l));
      setActiveLessonEditId(null);`
);

// 9. handleCreateEnrollment
code = code.replace(
  `    if (!error) {
      await fetchData();
      setIsNewEnrollModalOpen(false);`,
  `    if (!error) {
      setLiveEnrollments(prev => [{ user_id: newEnrollForm.user_id, course_id: newEnrollForm.course_id, enrolled_at: new Date().toISOString() }, ...prev]);
      setIsNewEnrollModalOpen(false);`
);

// 10. handleRevokeEnrollment
code = code.replace(
  `        }
      }
      await fetchData();
    } else {`,
  `        }
      }
      setLiveEnrollments(prev => prev.filter(e => e.id !== enrollId));
    } else {`
);

// 11. handleApproveRequest
code = code.replace(
  `      console.error("Error updating course request status:", reqError);
    }
    await fetchData();
    setIsLoading(false);`,
  `      console.error("Error updating course request status:", reqError);
    }
    setLiveEnrollments(prev => [{ user_id: userId, course_id: courseId, enrolled_at: new Date().toISOString() }, ...prev]);
    setLiveCourseRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
    setIsLoading(false);`
);

// 12. handleRejectRequest
code = code.replace(
  `    if (!error) {
      await fetchData();
      alert("تم رفض الطلب بنجاح!");`,
  `    if (!error) {
      setLiveCourseRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
      alert("تم رفض الطلب بنجاح!");`
);

// 13. handleDeleteComplaint
code = code.replace(
  `    if (!error) {
      await fetchData();
      alert("تم حذف الشكوى بنجاح!");`,
  `    if (!error) {
      setLiveComplaints(prev => prev.filter(c => c.id !== complaintId));
      alert("تم حذف الشكوى بنجاح!");`
);

// 14. handleAddExam
code = code.replace(
  `    } else {
      alert("تمت إضافة الامتحان بنجاح");
      setExamForm({ title: '', year_id: '', exam_url: '' });
      await fetchData();
    }`,
  `    } else {
      alert("تمت إضافة الامتحان بنجاح");
      setExamForm({ title: '', year_id: '', exam_url: '' });
      setAllExams(prev => [{ title: examForm.title, year_id: examForm.year_id, exam_url: examForm.exam_url, created_at: new Date().toISOString() }, ...prev]);
    }`
);

// 15. handleDeleteExam
code = code.replace(
  `    } else {
      alert("تم حذف الامتحان بنجاح");
      await fetchData();
    }`,
  `    } else {
      alert("تم حذف الامتحان بنجاح");
      setAllExams(prev => prev.filter(e => e.id !== examId));
    }`
);

// 16. handleDeleteSubmission
code = code.replace(
  `    } else {
      alert("تم حذف التسليم بنجاح");
      await fetchData();
    }`,
  `    } else {
      alert("تم حذف التسليم بنجاح");
      setAllExamSubmissions(prev => prev.filter(s => s.id !== submissionId));
    }`
);

fs.writeFileSync('src/App.jsx', code);
console.log('Refactoring complete.');
