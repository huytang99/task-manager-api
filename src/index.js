const express = require("express");
require("./db/mongoose");
// const User = require("./models/user");
// const Task = require("./models/task");
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task');

const app = express();
// const port = process.env.PORT || 3000;
const port = process.env.PORT //mình sử dụng environment variable với thư viện env-cmd

const multer = require('multer');
const upload = multer({
  dest: 'images',
  limits: {
    fileSize: 1000000//bytes = 1MB
  },
  fileFilter(req, file , cb) {
    if (!file.originalname.match(/\.(doc|docx)$/)) {
      return cb(new Error('Please upload a word document'))//sent an error back

    }
    cb(undefined, true)//return undefined to error and accept the upload 
    // cb(undefined, false)//silently reject the upload req(seldomly used)
  }
})
// const errorMiddleware = (req, res, next) => {
//   throw new Error('From my middleware')
// }
//key trong form data minh gui phai giong cai minh define trong single(upload)
app.post('/upload',upload.single('upload'), (req, res) => {
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({
    error: error.message
  })
})

// app.use((req, res, next) => {//function run in middleware
//   // console.log(req.method, req.path)
//   if(req.method === 'GET'){
//     res.send('GET requests are disabled');
//   } else {
//     next(); //run route handler and exit middleware
//   }
// })

// app.use((req, res, next) => {//function run in middleware
//   if( req.method === 'GET' || req.method === 'POST' || req.method === 'PATCH' || req.method === "DELETE") {
//     res.status(503).send('Server is in maintainance')
//   } else {
//     next();
//   }

// })

app.use(express.json()); //This line is to make express parse JSON to object
//from a body of a htttp request to do sth
app.use(userRouter);//dùng router User
app.use(taskRouter);//dùng router Task

// 
// Without middleware: new request -> run route handler
// 
// With middleware: new request -> do sth -> run route handler
// 

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

// const Task = require('./models/task')
// const User = require('./models/user')

// const main = async () => {
//   //Find the owner of the task by its id
//   // const task = await Task.findById('6231faf3ac92893af02a181c')
//   // await task.populate('owner').execPopulate()
//   // console.log(task.owner)

//   //Find the task from the user with userId
//   const user = await User.findById('6231f9dccc10992fe83f17f9')
//   await user.populate('tasks').execPopulate()
//   console.log(user.tasks)

// }

// main()

// const bcrypt = require('bcryptjs')
// const myFunction = async () => {
//   const password = 'Red12345!'
//   const hashedPassword = await bcrypt.hash(password, 8)

//   console.log(password)
//   console.log(hashedPassword)

//   const isMatch = await bcrypt.compare('Red12345!', hashedPassword)
//   console.log(isMatch)
// }

// myFunction()

// const jwt = require('jsonwebtoken')

// const myFunction = async () => { 
//   const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days'})//thoi han ton tai cua token
//   console.log(token)//header.payload(body:our encoded data).signature
//                     //chi khi co dc th signature thi minh moi the extract dc payload ra khoi token
//   const data = jwt.verify(token, 'thisismynewcourse')//se tra ve payload neu dung
//   console.log(data)
// }

// myFunction()