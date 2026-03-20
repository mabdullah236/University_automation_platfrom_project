const Timetable = require('../models/Timetable');
const CourseAllocation = require('../models/CourseAllocation');
const Room = require('../models/Room');
const Course = require('../models/Course');
const User = require('../models/User');
const allocationService = require('../services/allocationService');
const sendEmail = require('../utils/emailService');

// Helper to generate time slots
const generateTimeSlots = () => {
  const slots = [];
  // Morning Shift: 08:00 - 14:00
  for (let i = 8; i < 14; i++) {
    slots.push({ start: `${i}:00`, end: `${i + 1}:00` });
  }
  // Evening Shift: 14:00 - 20:00
  for (let i = 14; i < 20; i++) {
    slots.push({ start: `${i}:00`, end: `${i + 1}:00` });
  }
  return slots;
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = generateTimeSlots();

// Helper: Fisher-Yates Shuffle
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Helper: Determine Room Type based on Course Title
const getRoomType = (title) => {
  const lowerTitle = title.toLowerCase();
  if (
    lowerTitle.includes('lab') || 
    lowerTitle.includes('ict') || 
    lowerTitle.includes('programming') || 
    lowerTitle.includes('computing') || 
    lowerTitle.includes('database') ||
    lowerTitle.includes('graphic')
  ) {
    return 'Lab';
  }
  return 'Room'; // Default to Lecture Hall/Room
};

// @desc    Get Timetable (Filtered)
// @route   GET /api/v1/timetable
// @access  Private
exports.getTimetable = async (req, res, next) => {
    try {
        const { program, semester, section, teacher } = req.query;
        let query = {};
        
        if (teacher) {
            query.teacher = teacher;
        } else {
            if (program) query.program = { $regex: new RegExp(`^${program}$`, 'i') };
            if (semester) query.semester = semester;
            if (section) query.section = section;
        }

        const timetable = await Timetable.find(query)
            .populate('course', 'title code credits')
            .populate('teacher', 'name email')
            .sort({ day: 1, startTime: 1 });

        res.status(200).json({
            success: true,
            count: timetable.length,
            data: timetable
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Generate Timetable
// @route   POST /api/v1/timetable/generate
// @access  Private (Admin)
exports.generateTimetable = async (req, res, next) => {
  try {
    const { program, semester, section } = req.body;

    if (!program || !semester || !section) {
        return res.status(400).json({ success: false, message: 'Program, Semester, and Section are required' });
    }

    // 1. Build Query for Allocations & Deletion
    let query = {
        program: { $regex: new RegExp(`^${program}$`, 'i') },
        semester: semester.toString(),
        section: section
    };

    console.log("Generating Timetable with Query:", query);

    // 2. AUTO-ASSIGN TEACHERS IF UNASSIGNED
    // Find the batch associated with this request to trigger auto-assign
    // We need to find ONE allocation to get the batch, or infer it?
    // Better to find any allocation for this section first.
    let sampleAllocation = await CourseAllocation.findOne(query);
    
    // If no allocation exists yet, we might need to create them? 
    // But autoAssignAll usually needs a batch. 
    // If sampleAllocation exists, use its batch.
    if (sampleAllocation && sampleAllocation.batch) {
      console.log(`[Auto-Assign] Triggering for Batch: ${sampleAllocation.batch} before generation...`);
      await allocationService.autoAssignAll(sampleAllocation.batch, program, parseInt(semester), section);
    } else {
        // If no allocations exist at all, we can't really auto-assign without knowing the batch.
        // But maybe the user provided batch in body? (Not currently).
        // Let's proceed, if allocations are missing, we will fail gracefully below.
        console.log("[Auto-Assign] No existing allocations found to infer batch. Skipping auto-assign pre-check.");
    }

    // 3. Clear existing timetable ONLY for this scope (Clean Slate)
    await Timetable.deleteMany(query);
    console.log(`Cleared existing timetable for ${program} ${semester} ${section}`);

    // 4. Fetch allocations matching the query (Refetch after auto-assign)
    let allocations = await CourseAllocation.find(query).populate('course teacher');
    const allRooms = await Room.find();

    if (allocations.length === 0) {
      return res.status(404).json({ 
          success: false, 
          message: `No course allocations found for ${program} ${semester} ${section}. Please ensure courses are allocated.` 
      });
    }
    if (allRooms.length === 0) {
      return res.status(400).json({ success: false, message: 'No rooms found in the system.' });
    }

    // SHUFFLE ALLOCATIONS to prevent alphabetical stacking
    allocations = shuffleArray(allocations);

    const createdSlots = [];
    const conflicts = [];

    // 5. Initialize 'occupied' with EXISTING timetable (Global Awareness)
    // We must respect slots taken by OTHER sections/teachers
    const existingSlots = await Timetable.find({
        $nor: [ query ] // Everything EXCEPT what we just deleted
    });

    const occupied = {};
    DAYS.forEach(day => {
      occupied[day] = {};
      TIME_SLOTS.forEach(slot => {
        occupied[day][slot.start] = {
          rooms: new Set(),
          teachers: new Set(),
          sections: new Set()
        };
      });
    });

    // Populate occupied with existing data
    existingSlots.forEach(slot => {
        if (occupied[slot.day] && occupied[slot.day][slot.startTime]) {
            const block = occupied[slot.day][slot.startTime];
            if (slot.roomNumber) block.rooms.add(slot.roomNumber);
            if (slot.teacher) block.teachers.add(slot.teacher.toString());
            // Section conflict is less relevant for *other* sections, but we track it
            if (slot.section) block.sections.add(`${slot.program}-${slot.semester}-${slot.section}`);
        }
    });

    for (const allocation of allocations) {
      const { course, teacher, section, semester, program, batch } = allocation;
      
      if (!course) continue;
      // If no teacher assigned even after auto-assign, we skip (or could assign a placeholder?)
      // For now, skip and report conflict.
      if (!teacher) {
          conflicts.push({
              course: course.title,
              section: section,
              message: 'No teacher assigned. Please assign a teacher manually.'
          });
          continue;
      }

      const sectionKey = `${program}-${semester}-${section}`;
      
      let slotsNeeded = 3; 
      const credits = parseInt(course.credits);
      if (!isNaN(credits)) {
          if (credits >= 3) slotsNeeded = 3;
          else if (credits <= 2) slotsNeeded = 2; // Usually 2 slots for 2 credits? Or 1? Let's say 2.
          if (credits === 1) slotsNeeded = 1;
      } 

      // Shift Constraints
      let validSlots = [];
      const isEvening = section.toUpperCase().startsWith('E') || section.toUpperCase().includes('EVENING');
      if (isEvening) {
        validSlots = TIME_SLOTS.filter(s => parseInt(s.start.split(':')[0]) >= 14);
      } else {
        validSlots = TIME_SLOTS.filter(s => parseInt(s.start.split(':')[0]) < 14);
      }

      // Room Constraints
      const requiredRoomType = getRoomType(course.title);
      let strictRooms = allRooms.filter(r => r.type === requiredRoomType);
      let fallbackRooms = allRooms; // All rooms

      // RETRY STRATEGY
      let success = false;
      let assignedSlotsForCourse = []; 

      const strategies = [
          { name: 'Strict', relaxDay: false, useFallbackRooms: false },
          { name: 'RelaxedDay', relaxDay: true, useFallbackRooms: false },
          { name: 'RelaxedAll', relaxDay: true, useFallbackRooms: true }
      ];

      for (const strategy of strategies) {
          if (success) break;

          assignedSlotsForCourse = [];
          let slotsAssignedCount = 0;
          let daysAssigned = new Set();
          
          let candidateRooms = strategy.useFallbackRooms ? fallbackRooms : strictRooms;
          if (candidateRooms.length === 0) candidateRooms = fallbackRooms; 
          candidateRooms = shuffleArray([...candidateRooms]);

          // Try to assign N slots
          for (let i = 0; i < slotsNeeded; i++) {
              let slotFound = false;
              const shuffledDays = shuffleArray([...DAYS]);

              for (const day of shuffledDays) {
                  if (slotFound) break;
                  if (!strategy.relaxDay && daysAssigned.has(day)) continue;

                  const shuffledTimes = shuffleArray([...validSlots]);

                  for (const slot of shuffledTimes) {
                      const timeBlock = occupied[day][slot.start];

                      // 1. Teacher Conflict
                      if (timeBlock.teachers.has(teacher._id.toString())) continue;

                      // 2. Section Conflict (Self-conflict check)
                      // We are generating for THIS section, so we must ensure we don't double book it
                      // But 'occupied' only has OTHER sections initially.
                      // We need to check 'assignedSlotsForCourse' for self-conflict in this loop.
                      const selfConflict = assignedSlotsForCourse.some(s => s.day === day && s.startTime === slot.start);
                      if (selfConflict) continue;

                      // 3. Room Availability
                      const availableRoom = candidateRooms.find(r => !timeBlock.rooms.has(r.roomNumber));

                      if (availableRoom) {
                          assignedSlotsForCourse.push({
                              day,
                              startTime: slot.start,
                              endTime: slot.end,
                              roomNumber: availableRoom.roomNumber
                          });
                          
                          daysAssigned.add(day);
                          slotsAssignedCount++;
                          slotFound = true;
                          break;
                      }
                  }
              }
          }

          if (slotsAssignedCount === slotsNeeded) {
              success = true;
              // Commit to 'occupied' and 'createdSlots'
              assignedSlotsForCourse.forEach(s => {
                  const block = occupied[s.day][s.startTime];
                  block.rooms.add(s.roomNumber);
                  block.teachers.add(teacher._id.toString());
                  block.sections.add(sectionKey);

                  createdSlots.push({
                      course: course._id,
                      section,
                      teacher: teacher._id,
                      allocationId: allocation._id,
                      day: s.day,
                      startTime: s.startTime,
                      endTime: s.endTime,
                      roomNumber: s.roomNumber,
                      semester,
                      program,
                      batch
                  });
              });
          }
      }

      if (!success) {
        conflicts.push({
          course: course.title,
          section: sectionKey,
          message: `Failed to assign ${slotsNeeded} slots. Resources exhausted.`
        });
      }
    }

    // Bulk insert
    if (createdSlots.length > 0) {
      await Timetable.insertMany(createdSlots);
    }

    res.status(200).json({
      success: true,
      count: createdSlots.length,
      conflicts,
      message: `Generated ${createdSlots.length} timetable slots.`
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update Timetable Slot
// @route   PUT /api/v1/timetable/:id
// @access  Private (Admin)
exports.updateTimetableSlot = async (req, res, next) => {
    try {
        const { day, startTime, endTime, roomNumber } = req.body;
        
        const slot = await Timetable.findById(req.params.id).populate('course teacher');
        if (!slot) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
        }

        const oldDay = slot.day;
        const oldTime = slot.startTime;
        const oldRoom = slot.roomNumber;

        // Update fields
        slot.day = day || slot.day;
        slot.startTime = startTime || slot.startTime;
        slot.endTime = endTime || slot.endTime;
        slot.roomNumber = roomNumber || slot.roomNumber;

        await slot.save();

        // 1. Send Email Notification (Multi-Channel)
        if (slot.teacher) {
            const FacultyProfile = require('../models/FacultyProfile');
            const teacherProfile = await FacultyProfile.findOne({ user: slot.teacher._id });
            
            const emailsToSend = [];
            if (slot.teacher.email) emailsToSend.push(slot.teacher.email);
            if (teacherProfile && teacherProfile.personalEmail) emailsToSend.push(teacherProfile.personalEmail);

            if (emailsToSend.length > 0) {
                const emailSubject = `Timetable Update: ${slot.course.title}`;
                const emailMessage = `
                    <h3>Timetable Change Notification</h3>
                    <p>Dear ${slot.teacher.name},</p>
                    <p>Your timetable for <strong>${slot.course.title}</strong> (${slot.section}) has been updated.</p>
                    
                    <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
                        <tr style="background-color: #f2f2f2;">
                            <th style="border: 1px solid #ddd; padding: 8px;">Detail</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">Old Value</th>
                            <th style="border: 1px solid #ddd; padding: 8px;">New Value</th>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Day</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${oldDay}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${slot.day}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Time</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${oldTime}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${slot.startTime}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Room</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${oldRoom}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${slot.roomNumber}</td>
                        </tr>
                    </table>
                    
                    <p>Please check your dashboard for the full schedule.</p>
                `;

                // Send to all emails
                for (const email of emailsToSend) {
                    try {
                        await sendEmail({
                            to: email,
                            subject: emailSubject,
                            html: emailMessage,
                            name: slot.teacher.name
                        });
                        console.log(`Email sent to ${email}`);
                    } catch (emailErr) {
                        console.error(`Failed to send email to ${email}:`, emailErr);
                    }
                }
            }
        }

        // 2. Create Admin Notification
        const Notification = require('../models/Notification');
        // Notify the admin who made the change (or all admins? For now, just log it as a system event)
        // Since we don't have the admin's ID easily here without req.user (which we have), let's notify the req.user
        if (req.user) {
             await Notification.create({
                 title: 'Timetable Updated',
                 message: `Slot for ${slot.course.code} (${slot.section}) updated. Teacher notified.`,
                 type: 'success',
                 recipient: req.user._id
             });
        }

        res.status(200).json({
            success: true,
            data: slot,
            message: 'Slot updated and teacher notified via multiple channels.'
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get Metadata (Semesters, Sections)
// @route   GET /api/v1/timetable/metadata
exports.getTimetableMetadata = async (req, res, next) => {
    try {
        const { departmentId } = req.query;
        // Logic to fetch available semesters/sections for a department
        // This usually involves querying allocations or student profiles
        // For simplicity, let's aggregate from CourseAllocations
        
        let match = {};
        // If departmentId provided, filter by program? 
        // We need to map Department -> Program Code. 
        // This is complex without looking up Department model.
        // Let's assume the frontend passes the program code or we just return all.
        
        const metadata = await CourseAllocation.aggregate([
            {
                $group: {
                    _id: { semester: "$semester" },
                    sections: { $addToSet: "$section" }
                }
            },
            { $sort: { "_id.semester": 1 } },
            {
                $project: {
                    semester: "$_id.semester",
                    sections: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: metadata
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Clear Timetable
// @route   DELETE /api/v1/timetable
exports.clearTimetable = async (req, res, next) => {
    try {
        const { program, semester, section } = req.body;
        if (!program || !semester || !section) {
             return res.status(400).json({ success: false, message: 'Missing parameters' });
        }
        
        await Timetable.deleteMany({ 
            program: { $regex: new RegExp(`^${program}$`, 'i') },
            semester: semester.toString(),
            section: section
        });
        
        res.status(200).json({ success: true, message: 'Timetable cleared.' });
    } catch (err) {
        next(err);
    }
};
