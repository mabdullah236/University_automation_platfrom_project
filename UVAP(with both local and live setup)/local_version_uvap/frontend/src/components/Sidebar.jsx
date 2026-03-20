import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaUserGraduate, FaChalkboardTeacher, FaBook, 
  FaMoneyBillWave, FaClipboardList, FaStar, FaSignOutAlt, FaUniversity, FaBed, FaBus,
  FaUserTie, FaCalendarAlt, FaIdCard, FaBuilding, FaCalculator
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    // Admin Only
    { name: 'Dashboard', path: '/dashboard', icon: <FaHome />, roles: ['admin'] },
    { name: 'Admissions', path: '/admissions', icon: <FaUserGraduate />, roles: ['admin'] },
    { name: 'Departments', path: '/admin/departments', icon: <FaBuilding />, roles: ['admin'] },
    { name: 'Students', path: '/students', icon: <FaUserGraduate />, roles: ['admin'] },
    { name: 'Faculty', path: '/faculty', icon: <FaChalkboardTeacher />, roles: ['admin'] },
    { name: 'Courses', path: '/courses', icon: <FaBook />, roles: ['admin'] },
    { name: 'Assign Teachers', path: '/admin/assign-teachers', icon: <FaChalkboardTeacher />, roles: ['admin'] },
    { name: 'Exams', path: '/exams', icon: <FaClipboardList />, roles: ['admin'] },
    { name: 'Timetable', path: '/timetable', icon: <FaCalendarAlt />, roles: ['admin'] },
    { name: 'Auto Generator', path: '/admin/timetable-generator', icon: <FaCalendarAlt />, roles: ['admin'] },
    { name: 'Finance', path: '/finance', icon: <FaMoneyBillWave />, roles: ['admin'] },
    { name: 'HR', path: '/hr', icon: <FaUserTie />, roles: ['admin'] },
    { name: 'Hostel', path: '/hostel', icon: <FaBed />, roles: ['admin'] },
    { name: 'Transport', path: '/transport', icon: <FaBus />, roles: ['admin'] },
    { name: 'Library', path: '/library', icon: <FaBook />, roles: ['admin'] },
    { name: 'Inventory', path: '/inventory', icon: <FaClipboardList />, roles: ['admin'] },
    { name: 'Rooms', path: '/admin/rooms', icon: <FaBuilding />, roles: ['admin'] },
    { name: 'Complaints', path: '/admin/complaints', icon: <FaClipboardList />, roles: ['admin'] },
    { name: 'Events', path: '/events', icon: <FaCalendarAlt />, roles: ['admin'] },
    // { name: 'Alumni', path: '/alumni', icon: <FaUserGraduate />, roles: ['admin'] }, // Removed
    { name: 'ID Cards', path: '/id-card', icon: <FaIdCard />, roles: ['admin'] },
    { name: 'Settings', path: '/settings', icon: <FaClipboardList />, roles: ['admin'] },
    { name: 'Promotion', path: '/admin/promotion', icon: <FaUserGraduate />, roles: ['admin'] },
    { name: 'Sectioning', path: '/admin/sectioning', icon: <FaUserGraduate />, roles: ['admin'] },
    { name: 'Section Analytics', path: '/admin/sections-view', icon: <FaClipboardList />, roles: ['admin'] },
    { name: 'Allocation View', path: '/admin/allocations', icon: <FaChalkboardTeacher />, roles: ['admin'] },
    { name: 'Resource Planner', path: '/admin/resource-planner', icon: <FaCalculator />, roles: ['admin'] },

    // Faculty Only
    { name: 'Dashboard', path: '/dashboard', icon: <FaHome />, roles: ['faculty'] },
    { name: 'My Courses', path: '/faculty/my-courses', icon: <FaBook />, roles: ['faculty'] },
    { name: 'My Timetable', path: '/timetable', icon: <FaCalendarAlt />, roles: ['faculty'] },
    { name: 'Mark Attendance', path: '/faculty/attendance', icon: <FaClipboardList />, roles: ['faculty'] },
    { name: 'Grading', path: '/grading', icon: <FaStar />, roles: ['faculty'] },
    { name: 'Upload Materials', path: '/lms/upload', icon: <FaBook />, roles: ['faculty'] },
    { name: 'Profile', path: '/faculty/profile', icon: <FaUserTie />, roles: ['faculty'] },

    // Student Only
    { name: 'Dashboard', path: '/dashboard', icon: <FaHome />, roles: ['student'] },
    { name: 'My Courses', path: '/student/my-courses', icon: <FaBook />, roles: ['student'] },
    { name: 'My Timetable', path: '/timetable', icon: <FaCalendarAlt />, roles: ['student'] },
    { name: 'My Attendance', path: '/attendance', icon: <FaClipboardList />, roles: ['student'] },
    { name: 'My Results', path: '/results', icon: <FaClipboardList />, roles: ['student'] },
    { name: 'Course Materials', path: '/lms/materials', icon: <FaBook />, roles: ['student'] },
    { name: 'Fee Vouchers', path: '/fee-vouchers', icon: <FaMoneyBillWave />, roles: ['student'] },
    { name: 'Complaints', path: '/complaints', icon: <FaClipboardList />, roles: ['student'] },
    { name: 'Rate My Teacher', path: '/rate-teacher', icon: <FaStar />, roles: ['student'] },
    { name: 'Library Books', path: '/library-books', icon: <FaBook />, roles: ['student'] },
    { name: 'Course Registration', path: '/course-registration', icon: <FaBook />, roles: ['student'] },
    { name: 'ID Card', path: '/id-card', icon: <FaIdCard />, roles: ['student'] },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <FaUniversity className="text-2xl mr-2" />
        <h1 className="text-2xl font-bold">UVAP</h1>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            item.roles.includes(user?.role) && (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                      isActive ? 'bg-primary text-white border-r-4 border-blue-500' : ''
                    }`
                  }
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            )
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex flex-col overflow-hidden mr-2">
              <span className="text-sm font-semibold text-white truncate">
                {user.name || 'User'}
              </span>
              <span className="text-xs text-gray-400 truncate">
                {user.email || 'user@uvap.com'}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-red-400 hover:text-red-300 transition-colors p-2 rounded hover:bg-gray-800"
              title="Logout"
            >
              <FaSignOutAlt size={18} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
