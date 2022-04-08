const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const multer = require('multer');
const sharp = require('sharp')

const auth = require("../middleware/auth")

//POST
//SIGN UP(New User)
router.post("/users", async (req, res) => {
  // console.log(req.body)
  const user = new User(req.body); //lấy data json dc POST và dc parse sang object và gán vào new
  //instance User
  try {
    const token = await user.generateAuthToken()
    //sendWelcomeEmail(user.email, user.name)
    await user.save();
    res.status(201).send({user, token});
  } catch (err) {
    res.status(400).send(err);
  }
  // user.save().then(() => {//lưu vào database
  //     res.status(201).send(user)//trả về data nếu thành công vì phương thức POST cũng có trả về là chính
  //                   //  cái nó gửi vào backend
  // }).catch((err) => {
  //     res.status(400)
  //     res.send(err)
  // })
});
//LOGIN with credentials
//We use post here because we need to send body(What user input to check in db)
router.post('/users/login', async (req, res) => {
  try {
      const user = await User.findByCredentials(req.body.email,req.body.passwords)
      const token  = await user.generateAuthToken()
      // res.send({user: user.getPublicProfile(), token})
      res.send({user: user, token})//use toJSON func in models, the above line use getPublicProfile 
  } catch (err) {
    res.status(400).send()
  }
})
//LOGOUT
router.post('/users/logout', auth, async (req, res) => {
  try {//req.user.tokens(all tokens avaliable in a user)!= req.token(bearer token)
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token//token.token vi 1 token also has id
    })
    await req.user.save()//save user after update token state(remove)
    res.send()
  } catch (err) {//req.user dc la ra tu auth.js = User.findOne(...)
    res.status(500).send()
  }
})
//LOGOUT ALL(wipe all all tokens for user)
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save()//save user after udpate token state(remove)
    res.send()
  } catch (err) {
    res.status(500).send()
  }
})



//GET
router.get("/users/me", auth ,async (req, res) => {
  res.send(req.user)
  // try {
  //   const users = await User.find({});
  //   res.send(users);
  // } catch (err) {
  //   res.status(500).send();
  // }
  // User.find({}).then((users) => {
  //     res.send(users)
  // }).catch((err) => {
  //     res.status(500).send()
  // })
});

//K can thiet
router.get("/users/:id", async (req, res) => {
  const _id = req.params.id; //Lấy custom id mà user gửi qua khi vào link users/gì đó
  //để lấy ra chính th đó trong db
  try {
    const user = await User.findById(_id);
    console.log("sdfsdf");

    if (!user) {
      //có cái này là vì khi READ thì lúc nào mongoDB cũng trả về kết quả cho dù là null
      return res.status(404).send(); //lỗi 4xx là do bên user nhập sai id với điều kiện là id sai này phải có cùng số ký tự
      //so với id đúng nếu không thì nó sẽ resolve ra error và nhảy vào catch chứ k tiếp tục ở đây
    }
    res.send(user);
  } catch (err) {
    res.status(500).send(); //lỗi 500 là do server bị mất kết
  }
  // User.findById(_id).then((user) => {
  //     if (!user) {
  //         return res.status(404).send()
  //     }
  //     res.send(user)
  // }).catch((err) => {
  //     res.status(500).send()
  // })
});

//UPDATE
// router.patch("/users/:id", async (req, res) => {
//   const updates = Object.keys(req.body);
//   const allowUpdates = ["name", "email", "passwords", "age"];
//   const isValidOperation = updates.every((update) => {
//     return allowUpdates.includes(update);
//   });

//   if (!isValidOperation) {
//     return res.status(400).send({ error: "Invalid updates!" });
//   }
//   try {
//     const user = await User.findById(req.params.id)
//     updates.forEach((update) => {
//       return user[update] = req.body[update];
//     })
//     await user.save();//day la noi ma middleware se dc thuc thi tủy thuôc nếu pre la trước còn post là ngay sau
//                       //Neu viet kieu o duoi thi co khi no se bypass mất cái middleware vì nó thực hiện thay đổi trưc tiếp vao db
//                       //nên mới phải viết kiểu này(để ý ở dưới mình phải nhắc phương thức như là runValidator: true vì nó cũng bypass)
//     // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
//     //   new: true, //de nhan ve th da update
//     //   runValidators: true,
//     // });
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.status(200).send(user);
//   } catch (err) {
//     res.status(400).send(err);
//   }
router.patch("/users/me",auth , async (req, res) => {
  const updates = Object.keys(req.body);
  const allowUpdates = ["name", "email", "passwords", "age"];
  const isValidOperation = updates.every((update) => {
    return allowUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    // const user = await User.findById(req.params.id)
    updates.forEach((update) => {
      return req.user[update] = req.body[update];
    })
    await req.user.save();//day la noi ma middleware se dc thuc thi tủy thuôc nếu pre la trước còn post là ngay sau
                      //Neu viet kieu o duoi thi co khi no se bypass mất cái middleware vì nó thực hiện thay đổi trưc tiếp vao db
                      //nên mới phải viết kiểu này(để ý ở dưới mình phải nhắc phương thức như là runValidator: true vì nó cũng bypass)
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true, //de nhan ve th da update
    //   runValidators: true,
    // });
    // if (!user) {
    //   return res.status(404).send();
    // }
    res.status(200).send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }
});

//DELETE
// router.delete("/users/:id",auth, async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);

//     if (!user) {
//       return res.status(404).send();
//     }
//     res.status(200).send(user);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });
router.delete("/users/me",auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);

    // if (!user) {
    //   return res.status(404).send();
    // }
    await req.user.remove()
    //sendCancelationEmail(req.user.email, req.user.name)
    res.status(200).send(req.user);
  } catch (err) {
    res.status(400).send(err);
  }
});
/////////////////////FILESSSSSS UPLOADING....
//UPLOAD files
const upload = multer({
  // dest: 'avatars',//if we keep this multer will save the uploaded files to avatar directories not db
                    //we remove this so that multer will pass uploaded files to our endpoint below
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return cb(new Error('Please upload a picture file'))
    }
    cb(undefined, true)
  }
})

router.post('/users/me/avatar',auth , upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
  req.user.avatar = buffer//the avatar field must be of type buffer
  await req.user.save()
  res.send()
}, (error, req, res,next) => {//we pass this function with same set of para to 
                            //handle the error(print the error message not the whole html thing)
  res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar',auth, upload.single('avatar'), async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
}, (error, req, res,next) => {//we pass this function with same set of para to 
  //handle the error(print the error message not the whole html thing)
res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})


module.exports = router;
