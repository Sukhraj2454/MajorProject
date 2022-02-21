const express = require('express');
const taskRouter = express.Router();

const { authenticate } = require('../middleware/authenticate');
const taskController = require('../controllers/taskController');

taskRouter.post('/add', authenticate, taskController.addTask);
taskRouter.get('/all', authenticate, taskController.getAllTasks);
taskRouter.get('/usertasks', authenticate, taskController.getUserTasks);
taskRouter.patch('/updatestatus', authenticate, taskController.updateStatus);
taskRouter.patch('/assignworker', authenticate, taskController.assignWorker);
taskRouter.patch('/deadline', authenticate, taskController.deadline);
taskRouter.delete('/delete/:tId', authenticate, taskController.delete);

module.exports = { taskRouter };