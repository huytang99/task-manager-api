const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task')

const userSchema = new mongoose.Schema({//allow middleware
    name: {
        type: String,
        required: true,
        trim: true,

    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    passwords: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('passwords')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar: {
        type: Buffer//to save uploaded file binary
    }
}, {
    timestamps: true
})

//set up connection to task like in task model but diffrent way because 
//we follow the idea each task contains its onwer not vice versa
// so here we connect to Task model using virtual so it will not save it db
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'//connection feild on the other side(Task)
})

//access on instances like a new user from User model
userSchema.methods.generateAuthToken = async function () {
    const user = this
    console.log(process.env.JWT_SECRET)
    const token = jwt.sign({ _id : user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}
userSchema.methods.getPublicProfile = async function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.passwords
    delete userObject.tokens
    return userObject
}
userSchema.methods.toJSON = function () {//thay the cho th ben tren
    const user = this
    const userObject = user.toObject()

    delete userObject.passwords
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}



//access on Model like User.findByCredentials
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email })
    if(!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.passwords)
    if(!isMatch) {
        throw new Error('Unable to login')
    }
    console.log('asdfsfd')
    
    return user
} 

// Hash the plain text password
userSchema.pre('save', async function (next){//phai dung function vi co binding this
    const user = this
    // console.log('just before saving')
    if (user.isModified('passwords')) {
        user.passwords = await bcrypt.hash(user.passwords, 8)
    }
    next()//run the next step like save()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next){//phai dung function vi co binding this
    const user = this
    await Task.deleteMany({ owner: user._id})

    next()
})

const User = mongoose.model('User',userSchema)
//trước đây tất cả thuộc tính của model(nam trở xuống) nằm ở chỗ userSchema

module.exports = User