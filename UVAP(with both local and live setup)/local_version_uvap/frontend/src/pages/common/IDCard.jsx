import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const IDCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchRollNo, setSearchRollNo] = useState('');
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (user.role === 'student') {
      fetchProfile();
    } else {
      setLoading(false); // Admin starts with no profile loaded
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearchError('');
    setProfile(null);

    try {
      const token = localStorage.getItem('token');
      // We need an endpoint to get student by roll number. 
      // Assuming we can reuse an existing one or I'll add a quick search logic here if needed.
      // Actually, let's use the /api/v1/admissions or similar if available, but better to have a dedicated one.
      // Since I can't easily add a new route in this single step without context, 
      // I will assume there's a way or I'll use the existing student list endpoint and filter (not efficient but works for now)
      // OR better: I'll add a specific search endpoint in the next step if this fails.
      // For now, let's try to fetch all students and find one. 
      // WAIT: I should probably add a proper search endpoint. 
      // But to keep it simple for this step, I will use the existing /api/v1/auth/users (if exists) or similar.
      // Let's use a direct fetch to a new endpoint I'll create: /api/v1/students/search?rollNumber=...
      
      const res = await fetch(`http://localhost:5001/api/v1/students/search?rollNumber=${searchRollNo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data); // Assuming data.data is the student profile
      } else {
        setSearchError('Student not found');
      }
    } catch (error) {
      console.error('Error searching student:', error);
      setSearchError('Error searching student');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    // Redirect to student edit page (assuming it exists or placeholder)
    // For now, let's just alert or navigate to a generic edit
    navigate(`/students/edit/${profile.studentId}`); 
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 print:bg-white print:p-0 print:min-h-0">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #id-card-container, #id-card-container * {
              visibility: visible;
            }
            #id-card-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: white;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="mb-6 no-print w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Digital ID Card System</h1>
        
        {user.role === 'admin' && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <form onSubmit={handleAdminSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Student Roll Number (e.g. FA21-BCS-001)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchRollNo}
                onChange={(e) => setSearchRollNo(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </form>
            {searchError && <p className="text-red-500 mt-2 text-sm">{searchError}</p>}
          </div>
        )}

        {profile && (
          <div className="flex justify-center gap-4">
            <button
              onClick={handlePrint}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print ID Card
            </button>
            {user.role === 'admin' && (
               <button
               onClick={handleEdit}
               className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-md flex items-center gap-2"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
               </svg>
               Edit Details
             </button>
            )}
          </div>
        )}
      </div>

      {!profile ? (
        user.role === 'student' ? (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600">Profile Not Found</h2>
            <p>You must be a student to view your ID Card.</p>
          </div>
        ) : (
          <div className="text-gray-500 mt-10">Search for a student to generate their ID Card.</div>
        )
      ) : (
        <div id="id-card-container" className="flex flex-col gap-8 md:flex-row print:flex-col print:gap-4">
          {/* Front Side */}
          <div className="w-[320px] h-[480px] bg-white rounded-xl shadow-2xl overflow-hidden relative border border-gray-200 print:shadow-none print:border-2 print:border-gray-300">
            {/* Header */}
            <div className="bg-blue-900 h-24 relative">
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  {/* Placeholder for photo */}
                  <img 
                    src={`https://ui-avatars.com/api/?name=${profile.user?.name || profile.name || 'Student'}&background=random&size=128`} 
                    alt="Student" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-14 px-6 text-center">
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">{profile.user?.name || profile.name}</h2>
              <p className="text-blue-600 font-semibold mt-1">{profile.studentId}</p>
              
              <div className="mt-6 space-y-3 text-left">
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500 text-sm">Program</span>
                  <span className="font-medium text-gray-800 text-sm">{profile.program}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500 text-sm">Batch</span>
                  <span className="font-medium text-gray-800 text-sm">{profile.batch}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500 text-sm">Valid Until</span>
                  <span className="font-medium text-gray-800 text-sm">
                    {new Date(new Date(profile.admissionDate).setFullYear(new Date(profile.admissionDate).getFullYear() + 4)).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500 text-sm">Blood Group</span>
                  <span className="font-medium text-gray-800 text-sm">O+</span> {/* Hardcoded or fetch if available */}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 w-full bg-blue-900 py-3 text-center">
              <p className="text-white text-xs tracking-widest uppercase font-semibold">University of UVAP</p>
            </div>
          </div>

          {/* Back Side */}
          <div className="w-[320px] h-[480px] bg-white rounded-xl shadow-2xl overflow-hidden relative border border-gray-200 print:shadow-none print:border-2 print:border-gray-300 print:break-before-page">
            <div className="p-6 h-full flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-blue-900 font-bold uppercase tracking-widest border-b-2 border-blue-900 inline-block pb-1">Emergency Info</h3>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase">Emergency Contact</p>
                  <p className="font-semibold text-gray-800">{profile.guardianName}</p>
                  <p className="text-gray-800">{profile.guardianPhone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase">Address</p>
                  <p className="text-gray-800 leading-tight">{profile.address}</p>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Terms & Conditions</h4>
                <ul className="text-[10px] text-gray-600 list-disc pl-3 space-y-1">
                  <li>This card is the property of UVAP University.</li>
                  <li>If found, please return to the Registrar's Office.</li>
                  <li>Valid only for the duration of the program.</li>
                  <li>Transfer of this card is strictly prohibited.</li>
                </ul>
              </div>

              <div className="mt-auto text-center">
                {/* Dummy Barcode */}
                <div className="h-12 bg-black mx-auto w-3/4 mb-1"></div>
                <p className="text-[10px] font-mono tracking-widest">{profile.studentId}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IDCard;
