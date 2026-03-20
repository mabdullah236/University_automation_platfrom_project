import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import AddCourseModal from '../components/AddCourseModal';
import { FaChevronDown, FaBook, FaTrash, FaEdit } from 'react-icons/fa';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  // Collapsible State
  const [expandedDepts, setExpandedDepts] = useState({});
  const [expandedSemesters, setExpandedSemesters] = useState({});

  // Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [user.role]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let res;
      if (user.role === 'admin') {
        res = await api.get('/courses');
      } else if (user.role === 'faculty') {
        res = await api.get('/faculty/my-courses');
      } else if (user.role === 'student') {
        res = await api.get('/courses/my-courses');
      }
      setCourses(res.data.data);
      
      // Initialize expanded state for all departments if admin
      // Default: All closed (User requested to remove default opening)
      /* 
      if (user.role === 'admin' && res.data.data.length > 0) {
        const depts = [...new Set(res.data.data.map(c => c.department))];
        const initialExpanded = {};
        depts.forEach(d => initialExpanded[d] = true);
        setExpandedDepts(initialExpanded);
      }
      */

    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  // Admin Functions
  const handleEdit = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setCourseToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/courses/${courseToDelete}`);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error(error);
      toast.error('Error deleting course');
    }
    setIsDeleteModalOpen(false);
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const toggleDept = (dept) => {
    setExpandedDepts(prev => ({
      ...prev,
      [dept]: !prev[dept]
    }));
  };

  const toggleSemester = (dept, sem) => {
    const key = `${dept}-${sem}`;
    setExpandedSemesters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper to organize courses
  const organizeCourses = (courseList) => {
    const grouped = courseList.reduce((acc, course) => {
      const dept = course.department || 'Unassigned';
      if (!acc[dept]) acc[dept] = {};
      
      const sem = course.semester || 'Other';
      if (!acc[dept][sem]) acc[dept][sem] = [];
      
      acc[dept][sem].push(course);
      return acc;
    }, {});
    return grouped;
  };

  // Render Views
  if (user.role === 'admin') {
    const groupedCourses = organizeCourses(courses);
    
    // Custom Priority Sorting
    const priorityOrder = ['Software Engineering', 'Computer Science', 'Information Security', 'Information Technology'];
    
    const sortedDepartments = Object.keys(groupedCourses).sort((a, b) => {
      const indexA = priorityOrder.indexOf(a);
      const indexB = priorityOrder.indexOf(b);

      // Both in priority list -> Sort by index
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      
      // Only A is in priority list -> A comes first
      if (indexA !== -1) return -1;
      
      // Only B is in priority list -> B comes first
      if (indexB !== -1) return 1;
      
      // Neither in list -> Sort Alphabetically
      return a.localeCompare(b);
    });

    return (
      <div className="space-y-8 min-h-screen bg-gray-50/50 p-2">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Course Management</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage curriculum, subjects, and allocations</p>
          </div>
          <button 
            onClick={handleAddCourse}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200 flex items-center font-semibold"
          >
            <span className="mr-2 text-xl">+</span> Add New Subject
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDepartments.length === 0 && (
               <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                 <div className="text-gray-300 text-6xl mb-4">📚</div>
                 <h3 className="text-xl font-bold text-gray-700">No courses found</h3>
                 <p className="text-gray-400 mt-2">Get started by adding a new subject to the curriculum.</p>
               </div>
            )}

            {/* Hierarchical View */}
            {sortedDepartments.map(dept => (
              <div key={dept} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Department Header - Dark & Bold */}
                <div 
                  onClick={() => toggleDept(dept)}
                  className="bg-slate-800 px-6 py-5 cursor-pointer flex justify-between items-center hover:bg-slate-700 transition select-none group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`transform transition-transform duration-300 ${expandedDepts[dept] ? 'rotate-180' : ''} text-indigo-400 bg-slate-700 p-2 rounded-full group-hover:bg-slate-600`}>
                      <FaChevronDown />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-wide">{dept}</h2>
                  </div>
                  <span className="bg-slate-700 text-indigo-300 text-xs px-3 py-1 rounded-full border border-slate-600 font-bold uppercase tracking-wider">
                    {Object.values(groupedCourses[dept]).flat().length} Subjects
                  </span>
                </div>

                {/* Collapsible Content */}
                {expandedDepts[dept] && (
                  <div className="p-6 space-y-4 bg-gray-50/30 animate-fadeIn">
                    {Object.keys(groupedCourses[dept])
                      .sort((a, b) => Number(a) - Number(b))
                      .map(sem => {
                        const semKey = `${dept}-${sem}`;
                        const isExpanded = expandedSemesters[semKey];
                        const semesterCourses = groupedCourses[dept][sem];
                        const totalCredits = semesterCourses.reduce((sum, c) => sum + (c.credits || 0), 0);

                        return (
                          <div key={sem} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {/* Semester Header - Clickable */}
                            <div 
                              onClick={() => toggleSemester(dept, sem)}
                              className="px-6 py-4 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center transition select-none border-b border-gray-100"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="font-bold text-gray-700">Semester {sem}</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                  {semesterCourses.length} Subjects • {totalCredits} Credits
                                </span>
                                <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-gray-400`}>
                                  <FaChevronDown size={14} />
                                </div>
                              </div>
                            </div>

                            {/* Semester Content - Course Grid */}
                            {isExpanded && (
                              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn bg-white">
                                {semesterCourses.map(course => (
                                  <div key={course._id} className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default relative overflow-hidden border-t-4 border-t-indigo-500">
                                    
                                    {/* Floating Actions */}
                                    <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleEdit(course); }} 
                                        className="p-2 bg-white text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full shadow-sm border border-gray-100 transition"
                                        title="Edit"
                                      >
                                        <FaEdit size={14} />
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); openDeleteModal(course._id); }} 
                                        className="p-2 bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full shadow-sm border border-gray-100 transition"
                                        title="Delete"
                                      >
                                        <FaTrash size={14} />
                                      </button>
                                    </div>

                                    <div className="flex items-start space-x-4 mb-4">
                                      {/* Gradient Icon Box */}
                                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white shadow-md transform group-hover:scale-110 transition-transform duration-300">
                                        <FaBook size={20} />
                                      </div>
                                      
                                      <div className="flex-1 min-w-0 pt-1">
                                        <h4 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                          {course.title}
                                        </h4>
                                        {course.code && (
                                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                            {course.code}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Badges Row */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium truncate max-w-[60%]">
                                        {course.program}
                                      </span>
                                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                                        {course.credits} Cr
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Course Modal */}
        <AddCourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchCourses}
          initialData={editingCourse}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone."
          isDanger={true}
        />
      </div>
    );
  }

  // Faculty/Student View
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {user.role === 'faculty' ? 'My Assigned Courses' : 'My Enrolled Courses'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((allocation) => (
          <div key={allocation._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{allocation.course.title}</h3>
                <p className="text-sm text-gray-500">{allocation.course.code}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {allocation.course.credits} Credits
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600 text-sm">
                <span className="font-medium mr-2">Section:</span>
                {allocation.section}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <span className="font-medium mr-2">Semester:</span>
                {allocation.semester}
              </div>
              {user.role === 'student' && (
                <div className="flex items-center text-gray-600 text-sm">
                  <span className="font-medium mr-2">Instructor:</span>
                  {allocation.teacher?.name || 'Not Assigned'}
                </div>
              )}
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <p className="text-gray-500 col-span-3 text-center py-10">
            {user.role === 'faculty' ? 'You have not been assigned any courses yet.' : 'No courses found for your current semester/section.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Courses;
