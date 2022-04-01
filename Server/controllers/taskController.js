const { Task } = require('../models/task');

const mongoose = require('mongoose');

// Add New Task
module.exports.addTask = (req, res, next) => {
    var task = req.body;
    var user = req.user
    task.reporter = {
        'name': user.name,
        'id': user._id
    }
    task.createdOn = new Date();
    var obj = new Task(task)
    obj.save().then(() => {
        res.status(200).json({ 'message': "Task Added Successfully." })
    })
}

// Add Comment
module.exports.addComment = (req, res, next) => {
    var comment = {
        taskId: mongoose.Types.ObjectId(req.body.tId),
        userId: req.user._id,
        message: req.body.messafe
    }
    Task.find({ _id: req.body.tId }).then(task => {

        task.comments.push(comment);

        task.save().then(() => {
            res.json({ 'message': 'Comment Added Successfully.' });
        }, () => {
            let er = new Error("No Data Found.")
            er.message = 'Not a Valid Request.'
            er.statusCode = 404
            throw (er);
        });
    }).catch(err => {
        next(err);
    });
}


// Assign or Update Worker to Task
module.exports.assignWorker = (req, res, next) => {
    const assignee = req.body.assignee;
    const taskId = req.body.id ? mongoose.Types.ObjectId(req.body.id) : null;
    if (!assignee || !taskId) {
        let er = new Error("No Data Found.")
        er.message = 'Not a Valid Request.'
        er.statusCode = 404
        next(er)
    }
    else {
        Task.updateOne({ _id: taskId },
            {
                assignee: assignee
            })
            .then((ret) => {
                if (ret.modifiedCount === 0) {
                    let err = Error("No Modification Done")
                    err.statusCode = 200
                    throw (err)
                }
                else
                    res.status(200)
                        .json({ "message": "Assignee Added." })
            }, (err) => {
                let er = new Error("Could Not Add Assignee");
                er.data = err;
                throw (er)
            })
            .catch(err => {
                next(err)
            })
    }
}

// Add Deadline
module.exports.deadline = (req, res, next) => {
    if (req.user.desig != 'Admin') {
        let error = new Error("Admin Required")
        error.message = "Not Enough Access Rights. This Incident shall be Reported.";
        error.statusCode = 403
        next(error)
    }
    else {
        const taskId = mongoose.Types.ObjectId(req.body.id);
        deadline = req.body.deadline
        if (!taskId || !deadline) {
            let er = new Error("No Data Found.")
            er.message = 'Not a Valid Request.'
            er.statusCode = 404
            next(er)
        }
        else {
            Task.updateOne({ _id: taskId },
                {
                    deadline: deadline
                })
                .then(() => {
                    res.status(200)
                        .json({ "message": "Deadline Added." })
                }, (err) => {
                    let er = new Error("Could Not Add Deadline");
                    er.data = err;
                    throw (er)
                })
                .catch(err => {
                    next(err)
                })
        }
    }
}

// Delete Task
module.exports.delete = (req, res, next) => {
    let id = mongoose.Types.ObjectId(req.params['id'])
    Task.deleteOne({ _id: id }).then((result) => {
        if (result.deletedCount === 0) {
            let error = new Error("Error Not Found")
            error.message = "Task Not Found"
            error.statusCode = 404
            throw error
        }
        else {
            res.status(200).json({ 'message': "Task Removed." })
        }
    })
        .catch(err => {
            next(err)
        })
}

// Get All Tasks
module.exports.getAllTasks = (req, res, next) => {

    // if (req.user.desig !== 'Admin') {
    //     let error = new Error("Admin Required")
    //     error.message = "Not Enough Access Rights. This Incident shall be Reported.";
    //     error.statusCode = 403
    //     next(error)
    // }
    // else {
    Task.find().then((obj) => {
        if (obj.length === 0) {
            let error = new Error("No Tasks")
            error.message = "No Tasks Found";
            error.statusCode = 404
            throw error;
        }
        res.status(200).json(obj);
    })
        .catch(err => {
            next(err)
        })
    // }
}
// Get Tasks created by a certain User
module.exports.getUserTasks = (req, res, next) => {
    Task.find({ '$or': [{ 'assignee.id': req.user._id }, { 'reporter.id': req.user._id }] }).then((tasks) => {
        res.send(tasks)
    }, (err) => {
        console.log(err)
        let error = new Error("User Not Found")
        error.message = "Requested User Not Found"
        error.statusCode = 404
        error.data = err;
        throw error;
    }).catch(err => {
        next(err);
    })
}
// Change Description, Title, Location 
module.exports.updateDescTitle = (req, res, next) => {
    const id = req.body.id ? mongoose.Types.ObjectId(req.body.id) : null;
    const description = req.body.description;
    const location = req.body.location;
    const title = req.body.title;
    if (!id || !description || !title || !location) {
        let er = new Error("No ID Found.")
        er.message = 'Not a Valid Request.'
        er.statusCode = 404
        next(er)
    }
    else {
        Task.updateOne({ _id: id }, {
            title: title,
            description: description,
            location: location
        })
            .then((ret) => {
                if (ret.modifiedCount === 0) {
                    let err = Error("No Modification Done.")
                    err.statusCode = 200
                    throw (err)
                }
                else
                    res.json({ 'message': 'Task Description, Title and Location Information Updated' });
            }, (err) => {
                let er = new Error("Could Not Update Priority.");
                er.data = err;
                throw (er)
            })
            .catch(err => {
                next(err)
            })
    }
}
// Change Priority
module.exports.updatePriority = (req, res, next) => {
    const id = req.body.id ? mongoose.Types.ObjectId(req.body.id) : null;
    const priority = (req.body.priority) === 'High' ? 2 : 1;
    if (!id || !priority) {
        let er = new Error("No ID Found.")
        er.message = 'Not a Valid Request.'
        er.statusCode = 404
        next(er)
    }
    else {
        Task.updateOne({ _id: id }, {
            priority: priority
        })
            .then((ret) => {
                if (ret.modifiedCount === 0) {
                    let err = Error("No Modification Done")
                    err.statusCode = 200
                    throw (err)
                }
                else
                    res.json({ 'message': 'Task Priority Updated' });
            }, (err) => {
                let er = new Error("Could Not Update Priority.");
                er.data = err;
                throw (er)
            })
            .catch(err => {
                next(err)
            })
    }
}


// Assign or Update Reporter
module.exports.updateReporter = (req, res, next) => {
    const id = req.body.id ? mongoose.Types.ObjectId(req.body.id) : null;
    const reporter = req.body.reporter
    if (!id || !reporter) {
        let er = new Error("No ID Found.")
        er.message = 'Not a Valid Request.'
        er.statusCode = 404
        next(er)
    }
    else {
        Task.updateOne({ _id: id }, {
            reporter: reporter
        })
            .then((ret) => {
                if (ret.modifiedCount === 0) {
                    let err = Error("No Modification Done")
                    err.statusCode = 200
                    throw (err)
                }
                else
                    res.json({ 'message': 'Reporter Updated' });
            }, (err) => {
                let er = new Error("Could Not Update Reporter.");
                er.data = err;
                throw (er)
            })
            .catch(err => {
                next(err)
            })
    }
}
// Change Status
module.exports.updateStatus = (req, res, next) => {
    const id = req.body.id ? mongoose.Types.ObjectId(req.body.id) : null;
    const status = req.body.status;
    if (!id || !status) {
        let er = new Error("No ID Found.")
        er.message = 'Not a Valid Request.'
        er.statusCode = 404
        next(er)
    }
    else {
        Task.updateOne({ _id: id }, {
            status: status
        })
            .then((ret) => {
                if (ret.modifiedCount === 0) {
                    let err = Error("No Modification Done")
                    err.statusCode = 200
                    throw (err)
                }
                else
                    res.json({ 'message': 'Task Status Updated' });
            }, (err) => {
                let er = new Error("Could Not Update Staus");
                er.data = err;
                throw (er)
            })
            .catch(err => {
                next(err)
            })
    }
}

