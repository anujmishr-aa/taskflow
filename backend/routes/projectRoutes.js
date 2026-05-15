const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, addMember, removeMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// All project routes are protected
router.use(protect);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
