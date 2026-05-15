const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper: check if user is member of a project, returns their role
const getUserRole = (project, userId) => {
  const member = project.members.find((m) => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

// @route   POST /api/tasks
// @access  Private (Admin only)
const createTask = async (req, res) => {
  const { title, description, projectId, assignedTo, priority, dueDate } = req.body;

  if (!title || !projectId) {
    return res.status(400).json({ message: 'Title and project are required' });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const role = getUserRole(project, req.user._id);
    if (!role) return res.status(403).json({ message: 'Not a member of this project' });
    if (role !== 'Admin') return res.status(403).json({ message: 'Only admins can create tasks' });

    const task = await Task.create({
      title,
      description,
      project: projectId,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      priority: priority || 'Medium',
      dueDate: dueDate || null,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const role = getUserRole(project, req.user._id);
    if (!role) return res.status(403).json({ message: 'Access denied' });

    let tasks;
    if (role === 'Admin') {
      // Admin sees all tasks
      tasks = await Task.find({ project: req.params.projectId })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Member only sees their assigned tasks
      tasks = await Task.find({ project: req.params.projectId, assignedTo: req.user._id })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const role = getUserRole(project, req.user._id);
    if (!role) return res.status(403).json({ message: 'Access denied' });

    if (role === 'Member') {
      // Members can only update status of their own tasks
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update your own tasks' });
      }
      // Members can only change status
      const { status } = req.body;
      if (status) task.status = status;
    } else {
      // Admin can update everything
      const { title, description, assignedTo, priority, dueDate, status } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (status) task.status = status;
    }

    const updatedTask = await task.save();
    await updatedTask.populate('assignedTo', 'name email');
    await updatedTask.populate('createdBy', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const role = getUserRole(project, req.user._id);
    if (role !== 'Admin') return res.status(403).json({ message: 'Only admins can delete tasks' });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createTask, getTasksByProject, updateTask, deleteTask };
