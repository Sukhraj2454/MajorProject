const { User } = require('../models/user');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

// To genereate Authentication Token
module.exports.generateAuthToken = function (user) {
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

    user.tokens.push({ access, token });

    return user.save().then(() => {
        return token;
    });
}

// To find a user by the Authentication token
module.exports.findByToken = function (token) {
    var decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return Promise.reject();
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

// To Login using Credentials
module.exports.findByCredentials = function (email, password) {
    return User.findOne({ email }).then((user) => {
        if (!user)
            return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res)
                    resolve(user);
                else reject();
            });
        });
    });
};

// To remove the token when LoggedOut
module.exports.removeToken = function (token) {
    var user = this;
    return user.updateOne({
        $pull: {
            tokens: { token }
        }
    });
};

module.exports.signUp = (req, res, next) => {
    var user = new User(req.body);
    user.save().then((obj) => {
        res.status(200).json({ 'message': "Signed Up Successfully" });
    }, (err) => {
        if (err)
            throw err
    }).catch(error => {
        var err = new Error("Signup Error")
        if (error.code === 11000) {
            err.statusCode = 409
            err.message = "Email Already Used."
            err.data = error
        }
        next(err);
    })
}

module.exports.login = (req, res, next) => {
    var user = req.body;
    this.findByCredentials(user.email, user.password).then((obj) => {

        this.generateAuthToken(obj).then((token) => {
            res.header('x-auth', token)
            res.status(200).json({ "message": "Login Successful." })
        })
    }, () => {
        const error = new Error("Not Found")
        error.statusCode = 404
        error.message = "Either Email or Password is Incorrect."
        throw error;
    }).catch((err) => {
        next(err)
    })
}

module.exports.getUser = (req, res, next) => {
    // User.findOne({ 'Branch.category.subCategory.name': 'Carpentary' }).then(r => console.log(r ? r.Branch : r));
    if (req.params['id'] !== '1') {
        const uId = mongoose.Types.ObjectId(req.params['id']);
        User.findOne({ _id: uId }).then(user => res.send(user.toJson()));
    }
    else
        res.send(req.user.toJson());
}

module.exports.updateUser = (req, res, next) => {
    const body = req.body;
    // console.log(body.Branch.category[0])
    const user = req.user;
    user.Branch = body.Branch || user.Branch;
    user.name = body.name || user.name;
    user.contact = body.contact || user.contact;
    user.save()
        .then((r) => { res.json({ message: 'Update Successful.' }); })
        .catch(err => next(err))

}

module.exports.getCategories = (req, res, next) => {

    User.find({ desig: 'EE' }).then((users) => {

        let cats = users.map(user => user.Branch);
        res.send(cats);
    })
        .catch((err) => {
            next(err);
        })
}
module.exports.getBranch = (req, res, next) => {
    if (req.params['id'] !== '3') {
        const uId = mongoose.Types.ObjectId(req.params['id']);
        User.findOne({ _id: uId }).then(user => res.send(user.Branch))
            .catch(err => next(err));
    }
    else
        res.json(req.user.Branch);
}
module.exports.updateBranchData = (req, res, next) => {
    let user = req.user;
    console.log(req.body);
    user.Branch = req.body.branch;
    console.log(req.body);
    user.save().then(() => {
        res.json({ 'message': 'Branch Data Update Successfully.' });
    })
        .catch(er => next(er));
}
module.exports.logout = (req, res, next) => {
    var token = req.token;
    this.findByToken(token).then((obj) => {

        obj.updateOne({
            $pull: {
                tokens: { token }
            }
        }).then(() => {
            res.status(200).send({ 'message': 'Logged Out.' })
        }).catch(err => {
            next(err);
        })

    }, () => {
        res.status(400).json({ 'message': "Session doesnot exist." })
    })

}

// Get User Summary
module.exports.getSummary = (req, res, next) => {
    const user = req.user;
    if (user.desig !== 'EE' && user.desig !== 'AE' && user.desig !== 'JE') {
        const er = new Error('Admin Access Needed.');
        er.statusCode = 401;
        next(er);
    }
    else {
        User.count({ 'Branch.name': user.Branch.name }).then(count => {
            res.json({ 'count': count });

        }).catch(er => next(er));
    }
}

// Get All Workers
module.exports.getUsers = (req, res, next) => {
    User.find().then((users) => {
        if (!users) {
            const error = new Error("No Workers Data Found.")
            error.statusCode = 404
            throw error;
        }
        res.send(users.map(user => { return { id: user._id, name: user.name } }));
    })
        .catch(err => {
            next(err);
        })
}