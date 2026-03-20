import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ChangePassword from './pages/common/ChangePassword';
import Dashboard from './pages/Dashboard';
import Admissions from './pages/Admissions';
import Courses from './pages/Courses';
import Exams from './pages/admin/Exams';
import TeacherReviews from './pages/TeacherReviews';
import Faculty from './pages/admin/Faculty';
import FacultyAttendance from './pages/faculty/Attendance';
import Attendance from './pages/Attendance';
import Library from './pages/admin/Library';
import Hostel from './pages/admin/Hostel';
import Transport from './pages/admin/Transport';
import Inventory from './pages/admin/Inventory';
import Finance from './pages/admin/Finance';
import HR from './pages/admin/HR';
import Alumni from './pages/admin/Alumni';
import IDCard from './pages/common/IDCard';
import Students from './pages/admin/Students';
import Promotion from './pages/admin/Promotion';
import Settings from './pages/admin/Settings';
import Departments from './pages/admin/Departments';
import FeeVouchers from './pages/student/FeeVouchers';
import LibraryBooks from './pages/student/LibraryBooks';
import Layout from './components/Layout';
import RateTeacher from './pages/RateTeacher';
import Placeholder from './pages/Placeholder';
import Grading from './pages/faculty/Grading';
import Results from './pages/student/Results';
import UploadMaterial from './pages/faculty/UploadMaterial';
import CourseMaterials from './pages/student/CourseMaterials';
import Timetable from './pages/common/Timetable';
import StudentComplaints from './pages/student/Complaints';
import AdminComplaints from './pages/admin/Complaints';
import Events from './pages/common/Events';
import FacultyProfile from './pages/faculty/Profile';
import CourseRegistration from './pages/student/CourseRegistration';
import Sectioning from './pages/admin/Sectioning';
import SectionsView from './pages/admin/SectionsView';
import AssignTeachers from './pages/admin/AssignTeachers';
import Rooms from './pages/admin/Rooms';
import ResourcePlanner from './pages/admin/ResourcePlanner';
import FacultyMyCourses from './pages/faculty/MyCourses';
import StudentMyCourses from './pages/student/MyCourses';
import AllocationView from './pages/admin/AllocationView';
import TimetableGenerator from './pages/admin/TimetableGenerator';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/admissions" element={<PrivateRoute><Layout><Admissions /></Layout></PrivateRoute>} />
          <Route path="/courses" element={<PrivateRoute><Layout><Courses /></Layout></PrivateRoute>} />
          <Route path="/exams" element={<PrivateRoute><Layout><Exams /></Layout></PrivateRoute>} />
          <Route path="/admin/departments" element={<PrivateRoute><Layout><Departments /></Layout></PrivateRoute>} />
          <Route path="/reviews" element={<PrivateRoute><Layout><TeacherReviews /></Layout></PrivateRoute>} />
          <Route path="/faculty" element={<PrivateRoute><Layout><Faculty /></Layout></PrivateRoute>} />
          <Route path="/faculty/profile" element={<PrivateRoute><Layout><FacultyProfile /></Layout></PrivateRoute>} />
          <Route path="/faculty/attendance" element={<PrivateRoute><Layout><FacultyAttendance /></Layout></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><Layout><Attendance /></Layout></PrivateRoute>} />
          <Route path="/library" element={<PrivateRoute><Layout><Library /></Layout></PrivateRoute>} />
          <Route path="/hostel" element={<PrivateRoute><Layout><Hostel /></Layout></PrivateRoute>} />
          <Route path="/transport" element={<PrivateRoute><Layout><Transport /></Layout></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Layout><Inventory /></Layout></PrivateRoute>} />
          <Route path="/finance" element={<PrivateRoute><Layout><Finance /></Layout></PrivateRoute>} />
          <Route path="/hr" element={<PrivateRoute><Layout><HR /></Layout></PrivateRoute>} />
          <Route path="/alumni" element={<PrivateRoute><Layout><Alumni /></Layout></PrivateRoute>} />
          <Route path="/id-card" element={<PrivateRoute><Layout><IDCard /></Layout></PrivateRoute>} />
          <Route path="/students" element={<PrivateRoute><Layout><Students /></Layout></PrivateRoute>} />
          <Route path="/admin/promotion" element={<PrivateRoute><Layout><Promotion /></Layout></PrivateRoute>} />

          <Route path="/admin/sectioning" element={<PrivateRoute><Layout><Sectioning /></Layout></PrivateRoute>} />
          <Route path="/admin/sections-view" element={<PrivateRoute><Layout><SectionsView /></Layout></PrivateRoute>} />
          <Route path="/admin/assign-teachers" element={<PrivateRoute><Layout><AssignTeachers /></Layout></PrivateRoute>} />
          <Route path="/admin/allocations" element={<PrivateRoute><Layout><AllocationView /></Layout></PrivateRoute>} />
          <Route path="/admin/rooms" element={<PrivateRoute><Layout><Rooms /></Layout></PrivateRoute>} />
          <Route path="/admin/resource-planner" element={<PrivateRoute><Layout><ResourcePlanner /></Layout></PrivateRoute>} />
          <Route path="/admin/timetable-generator" element={<PrivateRoute><Layout><TimetableGenerator /></Layout></PrivateRoute>} />

          {/* New Routes for RBAC items */}
          <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
          <Route path="/grading" element={<PrivateRoute><Layout><Grading /></Layout></PrivateRoute>} />
          <Route path="/timetable" element={<PrivateRoute><Layout><Timetable /></Layout></PrivateRoute>} />
          <Route path="/results" element={<PrivateRoute><Layout><Results /></Layout></PrivateRoute>} />
          <Route path="/lms/upload" element={<PrivateRoute><Layout><UploadMaterial /></Layout></PrivateRoute>} />
          <Route path="/lms/materials" element={<PrivateRoute><Layout><CourseMaterials /></Layout></PrivateRoute>} />
          <Route path="/rate-teacher" element={<PrivateRoute><Layout><RateTeacher /></Layout></PrivateRoute>} />
          <Route path="/complaints" element={<PrivateRoute><Layout><StudentComplaints /></Layout></PrivateRoute>} />
          <Route path="/admin/complaints" element={<PrivateRoute><Layout><AdminComplaints /></Layout></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><Layout><Events /></Layout></PrivateRoute>} />
          
          <Route path="/course-materials" element={<PrivateRoute><Layout><CourseMaterials /></Layout></PrivateRoute>} />
          <Route path="/course-registration" element={<PrivateRoute><Layout><CourseRegistration /></Layout></PrivateRoute>} />
          <Route path="/fee-vouchers" element={<PrivateRoute><Layout><FeeVouchers /></Layout></PrivateRoute>} />
          <Route path="/library-books" element={<PrivateRoute><Layout><LibraryBooks /></Layout></PrivateRoute>} />
          
          {/* My Courses Routes */}
          <Route path="/faculty/my-courses" element={<PrivateRoute><Layout><FacultyMyCourses /></Layout></PrivateRoute>} />
          <Route path="/student/my-courses" element={<PrivateRoute><Layout><StudentMyCourses /></Layout></PrivateRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
