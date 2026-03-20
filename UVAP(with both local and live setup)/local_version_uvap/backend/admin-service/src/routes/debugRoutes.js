const express = require('express');
const router = express.Router();
const CourseAllocation = require('../models/CourseAllocation');
const FacultyProfile = require('../models/FacultyProfile');
const Course = require('../models/Course');
const allocationService = require('../services/allocationService');

router.get('/assignment', async (req, res) => {
  try {
    const logs = [];
    const log = (msg) => logs.push(msg);

    log('Starting Debug via Endpoint...');

    // Analyze specific unassigned allocation found in previous step
    const targetId = '6927280649b9e240bc0135bf';
    const unassigned = await CourseAllocation.findById(targetId).populate('course');

    if (!unassigned) return res.json({ error: 'Target allocation not found', logs });

    log(`Analyzing Target: ${unassigned.course.title} (${unassigned.section})`);

    log(`Analyzing: ${unassigned.course.title} (${unassigned.section})`);

    // 2. Fetch Faculty
    const faculty = await FacultyProfile.find({ status: 'Active' }).populate('user');
    log(`Active Faculty: ${faculty.length}`);

    // 3. Load Map
    const allAllocations = await CourseAllocation.find({ batch: unassigned.batch });
    const teacherLoadMap = {};
    allAllocations.forEach(a => {
        if (a.teacher) {
            const tid = a.teacher.toString();
            teacherLoadMap[tid] = (teacherLoadMap[tid] || 0) + 1;
        }
    });

    // 4. Score
    const candidates = [];
    for (const f of faculty) {
        const currentLoad = teacherLoadMap[f.user._id.toString()] || 0;
        
        // Replicate logic for transparency
        let score = 0;
        const maxLoad = 6;
        
        const keywords = [
            f.specialization, 
            f.department, 
            ...(f.qualifications?.map(q => q.degree) || [])
        ].join(' ').toLowerCase();
        
        const title = unassigned.course.title.toLowerCase();
        
        if (title.split(' ').some(word => keywords.includes(word) && word.length > 3)) score += 30;
        if (f.department === unassigned.course.department) score += 50;

        let loadScore = 0;
        if (currentLoad >= maxLoad) loadScore = -1000;
        else loadScore = (maxLoad - currentLoad) * 10;
        
        const totalScore = score + loadScore;

        candidates.push({
            name: f.user.name,
            dept: f.department,
            load: `${currentLoad}/${maxLoad}`,
            score: totalScore,
            breakdown: { base: score, load: loadScore }
        });
    }

    res.json({ success: true, unassigned, candidates, logs });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
