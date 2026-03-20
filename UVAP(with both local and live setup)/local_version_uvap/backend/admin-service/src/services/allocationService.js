const CourseAllocation = require('../models/CourseAllocation');
const FacultyProfile = require('../models/FacultyProfile');
const Course = require('../models/Course');


/**
 * Calculate match score for a teacher and a course
 */
const calculateScore = (teacher, course, currentLoad, maxLoad = 6) => {
  let score = 0;

  // 1. Specialization/Keyword Match
  const keywords = [
    teacher.specialization || '', 
    teacher.department || '', 
    ...(teacher.qualifications?.map(q => q.degree) || [])
  ].join(' ').toLowerCase();
  
  const title = course.title.toLowerCase();
  const code = course.code.toLowerCase();
  
  const isCsCourse = title.includes('computer') || title.includes('programming') || title.includes('software') || title.includes('data') || code.startsWith('cs') || code.startsWith('se');
  const hasCsSpec = keywords.includes('computer') || keywords.includes('software') || keywords.includes('ai') || keywords.includes('data') || keywords.includes('web');

  if (title.split(' ').some(word => keywords.includes(word) && word.length > 3)) {
    score += 30;
  }

  if (isCsCourse && hasCsSpec) score += 50;

  // 2. Department Match (+100) -> Massive boost to ensure dept teachers are picked
  if (teacher.department === course.department) {
    score += 100;
  }

  // 3. Load Balancing
  if (currentLoad >= maxLoad) {
    score -= 1000; // Heavy penalty for overload
  } else {
    score += (maxLoad - currentLoad) * 10;
  }

  return score;
};

/**
 * Find the best teacher for a course
 */
exports.findBestTeacher = async (course, batch, excludeTeacherId = null) => {
  // 1. Fetch Active Faculty
  const faculty = await FacultyProfile.find({ status: 'Active' }).populate('user', 'name');
  
  // 2. Calculate Current Global Load
  const allAllocations = await CourseAllocation.find({ batch }); 
  const teacherLoadMap = {};
  allAllocations.forEach(a => {
    if (a.teacher) {
      const tid = a.teacher.toString();
      teacherLoadMap[tid] = (teacherLoadMap[tid] || 0) + 1;
    }
  });

  let bestTeacher = null;
  let bestScore = -Infinity;

  // First Pass: Score based logic
  for (const teacher of faculty) {
    // Skip excluded teacher (e.g., the one being deleted)
    if (excludeTeacherId && teacher.user._id.toString() === excludeTeacherId.toString()) {
      continue;
    }

    // Use User ID for load lookup
    const currentLoad = teacherLoadMap[teacher.user._id.toString()] || 0;
    const score = calculateScore(teacher, course, currentLoad);

    // Must have at least a positive score to be considered
    if (score > bestScore && score > 0) {
      bestScore = score;
      bestTeacher = teacher;
    }
  }

  // Fallback: If no one found, pick ANYONE in the same department with load < 6
  if (!bestTeacher) {
    for (const teacher of faculty) {
        if (excludeTeacherId && teacher.user._id.toString() === excludeTeacherId.toString()) continue;
        if (teacher.department === course.department) {
            const currentLoad = teacherLoadMap[teacher.user._id.toString()] || 0;
            if (currentLoad < 6) {
                bestTeacher = teacher;
                break; // Just pick the first available one
            }
        }
    }
  }

  // LAST RESORT: Pick ANY active teacher with load < 6 (ignoring department)
  if (!bestTeacher) {
    for (const teacher of faculty) {
        if (excludeTeacherId && teacher.user._id.toString() === excludeTeacherId.toString()) continue;
        const currentLoad = teacherLoadMap[teacher.user._id.toString()] || 0;
        if (currentLoad < 6) {
            bestTeacher = teacher;
            break;
        }
    }
  }

  return bestTeacher;
};

exports.assignUnassignedCoursesToTeacher = async (teacherProfile, batch) => {
  // 1. Find all unassigned courses for this batch
  const unassignedAllocations = await CourseAllocation.find({ 
    batch, 
    teacher: null 
  }).populate('course');

  const assigned = [];

  // 2. Check if this teacher is a good match for any of them
  // We need to calculate load dynamically as we assign
  let currentLoad = 0; 
  const maxLoad = 6;

  for (const allocation of unassignedAllocations) {
    if (currentLoad >= maxLoad) break;

    const score = calculateScore(teacherProfile, allocation.course, currentLoad, maxLoad);

    // If score is good (e.g. > 50, meaning at least Dept match or Specialization match)
    if (score >= 50) {
      allocation.teacher = teacherProfile.user;
      await allocation.save();
      assigned.push(allocation);
      currentLoad++;
    }
  }

  return assigned;
};

/**
 * Auto-assign ALL unassigned courses to the best available teachers
 */
/**
 * Helper to identify active scopes (Program/Semester) for a batch
 */
exports.getActiveScopes = async (batch) => {
  const activeScopes = new Set();
  const logs = [];

  // 1. Try to infer from existing allocations
  const existingAllocations = await CourseAllocation.find({ batch });
  logs.push(`Found ${existingAllocations.length} existing allocations for batch inference`);
  
  existingAllocations.forEach(a => {
    if (a.program && a.semester) {
      activeScopes.add(`${a.program}|${a.semester}`);
    }
  });

  // 2. FALLBACK: If no existing allocations, check StudentProfiles for this batch
  if (activeScopes.size === 0) {
    logs.push('No scopes from allocations. Checking StudentProfiles...');
    const StudentProfile = require('../models/StudentProfile');
    const students = await StudentProfile.find({ batch });
    logs.push(`Found ${students.length} students in batch`);
    
    students.forEach(s => {
      if (s.program && s.currentSemester) {
        activeScopes.add(`${s.program}|${s.currentSemester}`);
      }
    });
  }

  return { scopes: Array.from(activeScopes), logs };
};
/**
 * Auto-assign ALL unassigned courses to the best available teachers
 */
exports.autoAssignAll = async (batch = null, program = null, semester = null, section = null) => {
  const logs = [];
  try {
    logs.push(`Starting Auto-Assign. Batch: ${batch || 'ALL'}, Program: ${program || 'ALL'}, Semester: ${semester || 'ALL'}, Section: ${section || 'ALL'}`);

    // 0. If no batch provided, find ALL active batches from CourseAllocation or StudentProfile
    let batchesToProcess = [];
    if (batch) {
        batchesToProcess.push(batch);
    } else {
        // Find all unique batches from allocations
        const distinctBatches = await CourseAllocation.distinct('batch');
        batchesToProcess = distinctBatches;
        logs.push(`No batch provided. Found ${distinctBatches.length} batches to process: ${distinctBatches.join(', ')}`);
        
        if (batchesToProcess.length === 0) {
            const StudentProfile = require('../models/StudentProfile');
            const studentBatches = await StudentProfile.distinct('batch');
            batchesToProcess = studentBatches;
            logs.push(`Found ${studentBatches.length} batches from students: ${studentBatches.join(', ')}`);
        }
    }

    const allResults = [];

    for (const currentBatch of batchesToProcess) {
        logs.push(`--- Processing Batch: ${currentBatch} ---`);
        
        // 1. Identify active scopes (Program/Semester)
        let activeScopes = [];
        
        // If Program/Semester explicitly provided, use them
        if (program && semester) {
          activeScopes.push(`${program}|${semester}`);
          logs.push(`Using explicit scope: ${program}|${semester}`);
        } else {
          const scopeResult = await exports.getActiveScopes(currentBatch);
          activeScopes = scopeResult.scopes;
          logs.push(...scopeResult.logs);
        }
    
        logs.push(`Active Scopes: ${activeScopes.join(', ')}`);

        // 2. For each active scope, find ALL courses and ensure allocations exist
        const results = [];
        
        const allAllocations = await CourseAllocation.find({ batch: currentBatch }).populate('course');

        for (const scope of activeScopes) {
          const [prog, semStr] = scope.split('|');
          const sem = parseInt(semStr);
          
          const courses = await Course.find({ program: prog, semester: sem });
          logs.push(`Scope ${scope}: Found ${courses.length} courses`);
          
          for (const course of courses) {
            if (!course || !course.code || !course.title) {
                logs.push(`[WARNING] Skipping malformed course: ${course ? course._id : 'Unknown'}`);
                continue;
            }
            const sectionsInScope = new Set();
            
            // If explicit section provided, use ONLY that (or add it?)
            // Let's ADD it to ensure it's covered.
            if (section) {
                sectionsInScope.add(section);
            } else {
                // Otherwise infer from existing data
                allAllocations
                  .filter(a => a.program === prog && a.semester === sem)
                  .forEach(a => sectionsInScope.add(a.section));

                if (sectionsInScope.size === 0) {
                  const StudentProfile = require('../models/StudentProfile');
                  const students = await StudentProfile.find({ batch: currentBatch, program: prog, currentSemester: sem });
                  students.forEach(s => {
                    if (s.section) sectionsInScope.add(s.section);
                  });
                }
            }
            
            logs.push(`Course ${course.code}: Sections [${Array.from(sectionsInScope).join(', ')}]`);
              
            for (const sec of sectionsInScope) {
              let allocation = await CourseAllocation.findOne({
                batch: currentBatch,
                course: course._id,
                section: sec
              });
              
              if (!allocation) {
                allocation = new CourseAllocation({
                  course: course._id,
                  teacher: null,
                  program: prog,
                  semester: sem,
                  section: sec,
                  batch: currentBatch
                });
                logs.push(`Created new allocation for ${course.code} Section ${sec}`);
              }
              
              if (!allocation.teacher) {
                 const bestTeacher = await exports.findBestTeacher(course, currentBatch);
                 if (bestTeacher) {
                   allocation.teacher = bestTeacher.user;
                   await allocation.save();
                   
                   // --- INTELLIGENT SYNC: Update Timetable if slots exist ---
                   try {
                       const Timetable = require('../models/Timetable');
                       const updatedSlots = await Timetable.updateMany(
                           { 
                               course: course._id, 
                               section: sec,
                               semester: sem.toString(),
                               program: prog
                           },
                           { $set: { teacher: bestTeacher.user._id } } // Use _id explicitly
                       );
                       
                       if (updatedSlots.modifiedCount > 0) {
                           logs.push(`[Sync] Updated ${updatedSlots.modifiedCount} timetable slots for ${course.code} ${sec}`);
                       }
                   } catch (syncErr) {
                       logs.push(`[Sync Error] Failed to update timetable: ${syncErr.message}`);
                   }
                   // ---------------------------------------------------------

                   results.push({
                      course: course.title,
                      teacher: bestTeacher.user.name,
                      section: sec,
                      batch: currentBatch
                   });
                   logs.push(`Assigned ${bestTeacher.user.name} to ${course.code} Section ${sec}`);
                 } else {
                   logs.push(`FAILED to find teacher for ${course.code} Section ${sec}`);
                 }
              } else {
                  // logs.push(`Skipping: ${course.code} Section ${sec} already assigned to ${allocation.teacher}`);
              }
            }
          }
        }
        allResults.push(...results);
    } // End Batch Loop

    return { results: allResults, logs };
  } catch (err) {
    console.error("Auto-Assign Error:", err);
    logs.push(`CRITICAL ERROR: ${err.message}`);
    return { results: [], logs };
  }
};

