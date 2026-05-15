const Task = require('../models/Task');
const Project = require('../models/Project');

// @route   GET /api/dashboard/:projectId
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check membership
    const isMember = project.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const now = new Date();

    // All tasks for this project
    const allTasks = await Task.find({ project: req.params.projectId });

    const total = allTasks.length;
    const done = allTasks.filter((t) => t.status === 'Done').length;
    const inProgress = allTasks.filter((t) => t.status === 'In Progress').length;
    const todo = allTasks.filter((t) => t.status === 'To Do').length;
    // Overdue: not done AND due date is in the past
    const overdue = allTasks.filter((t) => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < now).length;

    // Tasks per member (for the team panel)
    const taskCountPerMember = await Promise.all(
      project.members.map(async (m) => {
        const count = await Task.countDocuments({
          project: req.params.projectId,
          assignedTo: m.user._id,
        });
        return {
          userId: m.user._id,
          name: m.user.name,
          email: m.user.email,
          role: m.role,
          taskCount: count,
        };
      })
    );

    res.json({
      total,
      done,
      inProgress,
      todo,
      overdue,
      members: taskCountPerMember,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboardStats };
