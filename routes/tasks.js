const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const { Op } = require('sequelize');
const Task = require('../models/Task');

const router = express.Router();

// ✅ Create a Task
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, dueDate, priority } = req.body;
        const newTask = await Task.create({ title, description, dueDate, priority, userId: req.user.id });
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const { priority, dueDate, sortBy, order, page, limit } = req.query;
        const whereClause = { userId: req.user.id };

        // ✅ Filtering by priority (low, medium, high)
        if (priority) {
            whereClause.priority = priority;
        }

        // ✅ Filtering by due date (tasks due on a specific date)
        if (dueDate) {
            whereClause.dueDate = { 
                [Op.eq]: new Date(dueDate) // ✅ Convert string to Date object
            };
        }

        // ✅ Sorting (default: newest first)
        let orderClause = [['createdAt', 'DESC']]; // Default sorting: newest first
        if (sortBy) {
            orderClause = [[sortBy, order === 'ASC' ? 'ASC' : 'DESC']];
        }

        // ✅ Pagination (default: 10 results per page)
        const pageNumber = page ? parseInt(page, 10) : 1;
        const pageSize = limit ? parseInt(limit, 10) : 10;
        const offset = (pageNumber - 1) * pageSize;

        // ✅ Fetch filtered, sorted, paginated tasks
        const tasks = await Task.findAll({
            where: whereClause,
            order: orderClause,
            limit: pageSize,
            offset: offset
        });

        res.json(tasks);
    } catch (error) {
        console.error('❌ Server Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Update a Task
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await task.update(req.body);
        res.json({ message: 'Task updated successfully', task });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Delete a Task
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await task.destroy();
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
