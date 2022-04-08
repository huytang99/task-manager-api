const mongoose = require('mongoose');;
const express = require('express');


// mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', {
//     useNewUrlParser: true,
//     useCreateIndex: true,//dễ truy xuất
//     useFindAndModify: false,
// })
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,//dễ truy xuất
    useFindAndModify: false,
})


//CREATE
// const me = new User({
//     name: "  Huy   ",
//     email: 'huy@ADSDSD.io     ',
//     password: '21121999Huy'
//     // age: 23
// })

// me.save().then(() => {
//     console.log(me)
// }).catch((err) => {
//     console.log('Error:', err)
// })



// const newT = new Task({
//     description: 'easy',
//     completed: false,
// })

// newT.save().then(() => {
//     console.log(newT)
// }).catch((err) => {
//     console.log('Error: ',err)
// })