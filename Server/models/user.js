const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs');
const _ = require('lodash')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 10,
        validator: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email.'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 10
    },
    contact: {
        type: String,
        required: true,
        minlength: 10
    },
    desig: {
        type: String,
        requried: true
    },
    Branch: {
        name: {
            type: String
        },
        category: [{
            name: {
                type: String,
            },
            subCategory: [{
                name: { type: String },

            }]
        }]
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true,
        },
    }]
});

// Methods
// Save Hashed Password
UserSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    }
    else {
        next();
    }
});

// Returnable content for user
UserSchema.methods.toJson = function () {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email', 'name', 'desig', 'contact', 'Branch']);
}


var User = mongoose.model('User', UserSchema);

module.exports = { User };
