const Project = require('../models/Project');
const User = require('../models/User');

// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  const { name, description, color } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name is required' });

  try {
    const project = await Project.create({
      name,
      description,
      color: color || '#7c6bef',
      createdBy: req.user._id,
      // Creator is automatically added as Admin member
      members: [{ user: req.user._id, role: 'Admin' }],
    });

    await project.populate('members.user', 'name email');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    // Only return projects where the logged-in user is a member
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('members.user', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if user is a member
    const isMember = project.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/projects/:id/members
// @access  Private (Admin only)
const addMember = async (req, res) => {
  const { email, role } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if requester is Admin
    const requester = project.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!requester || requester.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    // Find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    // Check if already a member
    const alreadyMember = project.members.some((m) => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({ user: userToAdd._id, role: role || 'Member' });
    await project.save();
    await project.populate('members.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin only)
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if requester is Admin
    const requester = project.members.find((m) => m.user.toString() === req.user._id.toString());
    if (!requester || requester.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Cannot remove yourself if you're the only admin
    project.members = project.members.filter((m) => m.user.toString() !== req.params.userId);
    await project.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, addMember, removeMember };
