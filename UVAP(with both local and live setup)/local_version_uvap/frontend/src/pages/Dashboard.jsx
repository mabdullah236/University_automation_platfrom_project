import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FaUserGraduate, FaChalkboardTeacher, FaBook, FaMoneyBillWave, 
  FaClipboardList, FaCalendarAlt, FaStar, FaClock, FaExclamationTriangle, FaBell 
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    courses: 0,
    revenue: 0,
    // Mock data for other roles
    cgpa: 3.5,
    attendance: 85,
    pendingAssignments: 3,
    nextClass: 'CS101 - 10:00 AM',
    myCourses: 4,
    todayClasses: 2,
    pendingGrading: 15
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unassignedCourses, setUnassignedCourses] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch admin stats if admin
        if (user.role === 'admin') {
          const res = await api.get('/stats/counts');
          setStats(prev => ({ ...prev, ...res.data.data }));

          // Check for unassigned courses
          const unassignedRes = await api.get('/courses/allocations?unassigned=true');
          setUnassignedCourses(unassignedRes.data.count);

          // Fetch Notifications
          const notifRes = await api.get('/notifications');
          setNotifications(notifRes.data.data);
        }
        
        // Fetch events for everyone
        const eventsRes = await api.get('/events');
        setEvents(eventsRes.data.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.role]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  const Widget = ({ icon, title, value, color, onClick }) => (
    <div 
        className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        onClick={onClick}
    >
      <div className={`p-4 bg-${color}-100 rounded-lg text-${color}-600 mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );

  const AdminWidgets = () => (
    <>
      <Widget icon={<FaUserGraduate size={24} />} title="Total Students" value={stats.students} color="blue" />
      <Widget icon={<FaChalkboardTeacher size={24} />} title="Total Faculty" value={stats.faculty} color="green" />
      <Widget icon={<FaMoneyBillWave size={24} />} title="Revenue" value={`$${stats.revenue.toLocaleString()}`} color="yellow" />
      {unassignedCourses > 0 ? (
          <Widget 
            icon={<FaExclamationTriangle size={24} />} 
            title="Unassigned Courses" 
            value={unassignedCourses} 
            color="red" 
            onClick={() => window.location.href = '/admin/assign-teachers'}
          />
      ) : (
          <Widget icon={<FaClipboardList size={24} />} title="Pending Tasks" value={stats.pendingAdmissions || 5} color="purple" />
      )}
    </>
  );

  const FacultyWidgets = () => (
    <>
      <Widget icon={<FaBook size={24} />} title="My Courses Count" value={stats.myCourses} color="blue" />
      <Widget icon={<FaCalendarAlt size={24} />} title="Today's Classes" value={stats.todayClasses} color="green" />
      <Widget icon={<FaClipboardList size={24} />} title="Pending Grading" value={stats.pendingGrading} color="red" />
    </>
  );

  const StudentWidgets = () => (
    <>
      <Widget icon={<FaStar size={24} />} title="Current CGPA" value={stats.cgpa} color="yellow" />
      <Widget icon={<FaClipboardList size={24} />} title="Attendance %" value={`${stats.attendance}%`} color="blue" />
      <Widget icon={<FaBook size={24} />} title="Pending Assignments" value={stats.pendingAssignments} color="red" />
      <Widget icon={<FaClock size={24} />} title="Next Class" value={stats.nextClass} color="green" />
    </>
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard - {user.role.charAt(0).toUpperCase() + user.role.slice(1)} View</h1>
        
        {/* Notification Bell (Admin Only) */}
        {user.role === 'admin' && (
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition relative"
            >
              <FaBell className="text-gray-600" size={20} />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">
                  Notifications
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div 
                        key={n._id} 
                        className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                        onClick={() => markAsRead(n._id)}
                      >
                        <h4 className="text-sm font-bold text-gray-800">{n.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                        <span className="text-[10px] text-gray-400 mt-2 block">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-sm">No notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === 'admin' && <AdminWidgets />}
        {user.role === 'faculty' && <FacultyWidgets />}
        {user.role === 'student' && <StudentWidgets />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
          {user.role === 'admin' ? 'System Overview Chart' : user.role === 'faculty' ? 'Class Performance Chart' : 'Semester Progress Chart'}
        </div>

        {/* Upcoming Events Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <FaCalendarAlt className="mr-2 text-purple-500" /> Upcoming Events
          </h2>
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map(event => (
                <div key={event._id} className="bg-gray-50 p-4 rounded flex justify-between items-center hover:bg-gray-100 transition-colors border border-gray-200">
                  <div>
                    <h4 className="font-bold text-gray-800">{event.title}</h4>
                    <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()} @ {event.time}</p>
                  </div>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">{event.venue}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No upcoming events.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
