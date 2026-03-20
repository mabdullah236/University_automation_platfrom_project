import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaFilter, FaSearch, FaFileExcel, FaChalkboardTeacher, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AllocationView = () => {
  const [filters, setFilters] = useState({
    program: '',
    batch: '',
    semester: '',
    shift: ''
  });
  
  // Dropdown Data
  // Dropdown Data
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  
  // Main Data
  const [loading, setLoading] = useState(false);
  const [groupedData, setGroupedData] = useState([]); // Array of { section, items: [] }
  const [expandedSections, setExpandedSections] = useState({}); // { sectionName: boolean }

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (filters.program && filters.batch && filters.semester) {
      fetchReport();
    }
  }, [filters.program, filters.batch, filters.semester, filters.shift, filters.section]);

  const fetchFilters = async () => {
    try {
      const res = await api.get('/students/filters');
      if (res.data.success) {
        setBatches(res.data.data.batches);
        setPrograms(res.data.data.programs);
        setSemesters(res.data.data.semesters || [1,2,3,4,5,6,7,8]);
        setSections(res.data.data.sections || []);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses/allocations/report', { params: filters });
      if (res.data.success) {
        processData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    const { allocations, sections, courses } = data;
    
    // Create a map of allocations for quick lookup: key = section_courseId
    const allocMap = {};
    allocations.forEach(a => {
      const key = `${a.section}_${a.course._id}`;
      allocMap[key] = a;
    });

    // Build the grouped data structure
    const processed = sections.map(section => {
      // For each section, we want to show ALL courses
      const items = courses.map(course => {
        const key = `${section}_${course._id}`;
        const allocation = allocMap[key];
        
        return {
          _id: key, // Unique key for list
          course: course,
          teacher: allocation ? allocation.teacher : null,
          allocationId: allocation ? allocation._id : null
        };
      });

      return {
        section,
        items
      };
    });

    setGroupedData(processed);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleExportCSV = () => {
    if (groupedData.length === 0) {
      return toast.error('No data to export');
    }

    const headers = ['Program', 'Batch', 'Semester', 'Section', 'Course Code', 'Course Title', 'Assigned Teacher', 'Teacher Email'];
    const rows = [];

    groupedData.forEach(({ section, items }) => {
      items.forEach(item => {
        rows.push([
          filters.program,
          filters.batch,
          filters.semester,
          section,
          item.course.code,
          item.course.title,
          item.teacher ? item.teacher.name : 'Unassigned',
          item.teacher ? item.teacher.uniEmail : '-'
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Allocation_Report_${filters.program}_${filters.batch}_Sem${filters.semester}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaChalkboardTeacher className="mr-3 text-blue-600" />
            Course Allocation Master Sheet
          </h1>
          <p className="text-gray-500 mt-1">Overview of teacher assignments per section</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <FaFileExcel className="mr-2" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
            <select name="program" value={filters.program} onChange={handleFilterChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select Program</option>
              {programs.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Batch</label>
            <select name="batch" value={filters.batch} onChange={handleFilterChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select Batch</option>
              {batches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
            <select name="semester" value={filters.semester} onChange={handleFilterChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Select Semester</option>
              {semesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Shift (Optional)</label>
            <select name="shift" value={filters.shift} onChange={handleFilterChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">All Shifts</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Section (Optional)</label>
            <select name="section" value={filters.section} onChange={handleFilterChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">All Sections</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">Loading allocations...</div>
      ) : groupedData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">Select filters to view allocations or no data found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {groupedData.map(({ section, items }) => {
            const isExpanded = expandedSections[section];
            const assignedCount = items.filter(i => i.teacher).length;
            const totalCount = items.length;
            
            return (
              <div key={section} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Accordion Header */}
                <div 
                  onClick={() => toggleSection(section)}
                  className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-blue-800 flex items-center">
                      <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded mr-3">SECTION</span>
                      {section}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {assignedCount} / {totalCount} Courses Assigned
                    </span>
                  </div>
                  <div className="text-blue-600">
                    {isExpanded ? '▲' : '▼'}
                  </div>
                </div>
                
                {/* Accordion Body */}
                {isExpanded && (
                  <div className="overflow-x-auto animate-fadeIn">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                          <th className="px-6 py-3 font-semibold border-b">Course Code</th>
                          <th className="px-6 py-3 font-semibold border-b">Course Title</th>
                          <th className="px-6 py-3 font-semibold border-b">Assigned Teacher</th>
                          <th className="px-6 py-3 font-semibold border-b">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.course.code}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{item.course.title}</td>
                            <td className="px-6 py-4 text-sm">
                              {item.teacher ? (
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 font-bold text-xs">
                                    {item.teacher.name.charAt(0)}
                                  </div>
                                  <span className="font-medium text-gray-900">{item.teacher.name}</span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center text-red-500 font-medium bg-red-50 px-2 py-1 rounded">
                                  <FaExclamationCircle className="mr-1" /> Unassigned
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {item.teacher ? item.teacher.uniEmail : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllocationView;
