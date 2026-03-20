import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import {
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaPrint,
  FaCog,
  FaEdit,
  FaTrash,
  FaRobot,
  FaEnvelope,
  FaExclamationTriangle
} from 'react-icons/fa';

const TimetableGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const [viewMode, setViewMode] = useState('section'); // 'section' or 'teacher'
  
  // Filters
  const [batches, setBatches] = useState([]); // If we have a batch API, otherwise manual input?
  // Let's stick to Program/Semester/Section for now as per backend
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const componentRef = useRef();

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const TIME_SLOTS = [
    { id: 1, label: '08:00 - 09:00', start: '8:00', end: '9:00' },
    { id: 2, label: '09:00 - 10:00', start: '9:00', end: '10:00' },
    { id: 3, label: '10:00 - 11:00', start: '10:00', end: '11:00' },
    { id: 4, label: '11:00 - 12:00', start: '11:00', end: '12:00' },
    { id: 5, label: '12:00 - 13:00', start: '12:00', end: '13:00' },
    { id: 6, label: '13:00 - 14:00', start: '13:00', end: '14:00' },
    { id: 7, label: '14:00 - 15:00', start: '14:00', end: '15:00' },
    { id: 8, label: '15:00 - 16:00', start: '15:00', end: '16:00' },
    { id: 9, label: '16:00 - 17:00', start: '16:00', end: '17:00' },
    { id: 10, label: '17:00 - 18:00', start: '17:00', end: '18:00' },
    { id: 11, label: '18:00 - 19:00', start: '18:00', end: '19:00' },
    { id: 12, label: '19:00 - 20:00', start: '19:00', end: '20:00' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
        // In a real app, we'd fetch metadata for this department
        // For now, let's just show 1-8 semesters
        setSemesters([1, 2, 3, 4, 5, 6, 7, 8]);
    }
  }, [selectedDepartment]);

  useEffect(() => {
      // Mock sections for now, or fetch if API exists
      if (selectedSemester) {
          setSections(['M1', 'M2', 'M3', 'E1', 'E2', 'E3']);
      }
  }, [selectedSemester]);

  useEffect(() => {
    if (viewMode === 'section' && selectedSection && selectedSemester && selectedDepartment) {
        fetchTimetable();
    } else if (viewMode === 'teacher' && selectedTeacher) {
        fetchTimetable();
    }
  }, [viewMode, selectedSection, selectedSemester, selectedTeacher, selectedDepartment]);

  const fetchInitialData = async () => {
    try {
      const deptRes = await api.get('/departments');
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : deptRes.data.data || []);
      
      const teacherRes = await api.get('/faculty');
      setTeachers(teacherRes.data.data || []);

      const roomRes = await api.get('/rooms');
      setRooms(roomRes.data.data || []);
    } catch (error) {
      toast.error("Failed to load initial data");
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      let params = {};
      if (viewMode === 'section') {
        const dept = departments.find(d => d._id === selectedDepartment);
        const program = dept?.programCode || dept?.shortName || 'BSSE'; // Fallback
        params = { 
            section: selectedSection, 
            semester: selectedSemester,
            program: program 
        };
      } else {
        params = { teacher: selectedTeacher };
      }

      const res = await api.get('/timetable', { params });
      setTimetable(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!selectedDepartment || !selectedSemester || !selectedSection) {
        toast.error("Please select Department, Semester, and Section");
        return;
    }
    setShowConfirmModal(true);
  };

  const confirmGenerate = async () => {
    setShowConfirmModal(false);
    setGenerating(true);
    try {
      const selectedDeptObj = departments.find(d => d._id === selectedDepartment);
      const programCode = selectedDeptObj ? (selectedDeptObj.programCode || selectedDeptObj.shortName) : '';

      const payload = {
          program: programCode,
          semester: selectedSemester,
          section: selectedSection
      };

      const res = await api.post('/timetable/generate', payload);
      toast.success(res.data.message);
      if (res.data.conflicts && res.data.conflicts.length > 0) {
        toast.error(`Generated with ${res.data.conflicts.length} conflicts.`);
      }
      fetchTimetable();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleClear = async () => {
      if (!window.confirm("Are you sure you want to clear the timetable for this section?")) return;
      
      try {
        const selectedDeptObj = departments.find(d => d._id === selectedDepartment);
        const programCode = selectedDeptObj ? (selectedDeptObj.programCode || selectedDeptObj.shortName) : '';

        await api.delete('/timetable', {
            data: {
                program: programCode,
                semester: selectedSemester,
                section: selectedSection
            }
        });
        toast.success("Timetable cleared");
        fetchTimetable();
      } catch (error) {
          toast.error("Failed to clear timetable");
      }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Timetable',
  });

  const getSlotContent = (day, startTime) => {
    // startTime is "8:00", but DB might have "8:00" or "08:00". 
    // Let's normalize or just find loosely.
    return timetable.find(t => t.day === day && parseInt(t.startTime) === parseInt(startTime));
  };

  const openEditModal = (slot) => {
    if (!slot) return;
    setSelectedSlot(slot);
    setShowEditModal(true);
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            day: selectedSlot.day,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
            roomNumber: selectedSlot.roomNumber
        };
        
        // Auto-calc end time if start time changes
        const slotObj = TIME_SLOTS.find(s => parseInt(s.start) === parseInt(selectedSlot.startTime));
        if (slotObj) {
            payload.endTime = slotObj.end;
        }

        await api.put(`/timetable/${selectedSlot._id}`, payload);
        toast.success('Slot updated & Teacher notified via Email');
        setShowEditModal(false);
        fetchTimetable();
    } catch (error) {
        toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <FaCalendarAlt className="text-blue-600" /> Timetable Generator
            </h1>
            <p className="text-gray-500 mt-1">Automated scheduling with conflict detection & email notifications.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setViewMode('section')}
              className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'section' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              Section View
            </button>
            <button 
              onClick={() => setViewMode('teacher')}
              className={`px-4 py-2 rounded-lg font-medium transition ${viewMode === 'teacher' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              Teacher View
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {viewMode === 'section' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                  <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                  <select 
                    value={selectedSemester} 
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={!selectedDepartment}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
                  <select 
                    value={selectedSection} 
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={!selectedSemester}
                  >
                    <option value="">Select Section</option>
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                    <button 
                        onClick={handleGenerate}
                        disabled={generating || !selectedSection}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {generating ? <FaCog className="animate-spin" /> : <FaRobot />} Generate
                    </button>
                    <button 
                        onClick={handleClear}
                        disabled={generating || !selectedSection}
                        className="px-4 py-2.5 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition disabled:opacity-50"
                        title="Clear Timetable"
                    >
                        <FaTrash />
                    </button>
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Teacher</label>
                <select 
                  value={selectedTeacher} 
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Faculty Member</option>
                  {teachers.map(t => (
                    <option key={t.user._id} value={t.user._id}>{t.user.name} - {t.department}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200" ref={componentRef}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">
                    {viewMode === 'section' 
                        ? `Timetable: ${selectedSection ? `Semester ${selectedSemester} - Section ${selectedSection}` : 'Select Section'}`
                        : `Faculty Timetable: ${teachers.find(t => t.user._id === selectedTeacher)?.user.name || 'Select Teacher'}`
                    }
                </h2>
                <button onClick={handlePrint} className="text-gray-600 hover:text-blue-600 transition flex items-center gap-2">
                    <FaPrint /> Print
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 bg-gray-100 border-b border-gray-200 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
                                Day / Time
                            </th>
                            {TIME_SLOTS.map(slot => (
                                <th key={slot.id} className="p-4 bg-gray-100 border-b border-gray-200 text-center text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[120px]">
                                    {slot.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {DAYS.map(day => (
                            <tr key={day} className="hover:bg-gray-50 transition">
                                <td className="p-4 border-b border-r border-gray-100 font-bold text-gray-700 bg-gray-50">
                                    {day}
                                </td>
                                {TIME_SLOTS.map(slot => {
                                    const content = getSlotContent(day, slot.start);
                                    return (
                                        <td key={slot.id} className="p-2 border-b border-r border-gray-100 relative h-24 align-top">
                                            {content ? (
                                                <div 
                                                    onClick={() => openEditModal(content)}
                                                    className="w-full h-full bg-blue-50 border border-blue-100 rounded-lg p-2 cursor-pointer hover:bg-blue-100 transition group shadow-sm"
                                                >
                                                    <div className="font-bold text-blue-800 text-xs mb-1 line-clamp-2">
                                                        {content.course?.title || 'Unknown Course'}
                                                    </div>
                                                    <div className="text-xs text-blue-600 flex items-center gap-1">
                                                        <FaChalkboardTeacher /> {content.teacher?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1 font-mono bg-white inline-block px-1 rounded border border-gray-200">
                                                        {content.roomNumber}
                                                    </div>
                                                    {viewMode === 'teacher' && (
                                                        <div className="text-[10px] text-gray-400 mt-1">
                                                            {content.section}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs">
                                                    -
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>

      {/* Edit Modal */}
      {showEditModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                <FaEdit className="text-blue-600" /> Edit Slot
            </h3>
            
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4 flex items-start gap-3">
                <FaEnvelope className="text-yellow-600 mt-1" />
                <p className="text-xs text-yellow-800">
                    Updating this slot will automatically send an email notification to <strong>{selectedSlot.teacher?.name}</strong>.
                </p>
            </div>

            <form onSubmit={handleUpdateSlot} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                    <select 
                        value={selectedSlot.day}
                        onChange={e => setSelectedSlot({...selectedSlot, day: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                    >
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <select 
                        value={selectedSlot.startTime} // Ensure format matches
                        onChange={e => setSelectedSlot({...selectedSlot, startTime: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                    >
                        {TIME_SLOTS.map(s => <option key={s.id} value={s.start}>{s.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <select 
                        value={selectedSlot.roomNumber}
                        onChange={e => setSelectedSlot({...selectedSlot, roomNumber: e.target.value})}
                        className="w-full p-2 border rounded-lg"
                    >
                        {rooms.map(r => <option key={r._id} value={r.roomNumber}>{r.roomNumber} ({r.type})</option>)}
                    </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button 
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
                    >
                        Update & Notify
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Generate Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <FaExclamationTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Timetable?</h3>
            <p className="text-sm text-gray-500 mb-6">
                This will <strong>DELETE</strong> the existing timetable for {selectedSection} and generate a new one. 
                <br/><br/>
                Teachers will be automatically assigned if missing.
            </p>
            <div className="flex gap-4 justify-center">
                <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={confirmGenerate}
                    className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg transition-transform transform hover:scale-105"
                >
                    Yes, Generate
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TimetableGenerator;
