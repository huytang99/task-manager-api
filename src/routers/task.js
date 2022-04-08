const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

//POST
//CREATE Task
router.post("/tasks", auth, async (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
  // task.save().then(() => {
  //     res.status(201).send(task)
  // }).catch((err) => {
  //     res.status(400)
  //     res.send(err)
  // })
});

//GET /tasks?completed=false
//Pagination: GET /tasks?limit=10&skip=0
//ascending = 1, desc = -1
//Sorting:  GET   /takss?sortBy=createdAt_asc//createdAt:desc
//Sorting:  GET   /takss?sortBy=completed_-1//createdAt:desc
router.get("/tasks", auth, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if(req.query.sortBy) {
    const parts = req.query.sortBy.split('_')
    if (parts[0] == 'createdAt') {
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort[parts[0]] = parts[1] === '1' ? 1 : -1
    }
  }

  try {
    // const tasks = await Task.find({ owner: req.user._id, completed: false }); //co the dung cach nay
    // res.status(200).send(tasks);

    // await req.user.populate('tasks').execPopulate();
    await req.user.populate({
      path: 'tasks',
      match: match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        // sort: {
        //   // createdAt: -1
        //   completed: -1//true first then false(desc)
        // }
        sort: sort
      } 
    }).execPopulate();
    res.send(req.user.tasks)
  } catch (err) {
    res.status(500).send();
  }
  // Task.find({}).then((tasks) => {
  //     res.status(200).send(tasks);
  // }).catch((err) => {
  //     res.status(500).send();
  // })
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
  } catch (err) {
    res.status(500).send();
  }
  // Task.findById(req.params.id).then((task) => {
  //     if (!task) {
  //         return res.status(404).send()
  //     }
  //     res.status(200).send(task);
  // }).catch((err) => {
  //     res.status(500).send();
  // })
});

//UPDATE
router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const validUpdates = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!validUpdates) {
    //lay ve loi sai operator
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    // const task = await Task.findById(req.params.id)
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //     new: true,
    //     runValidators: true
    // })
    if (!task) {
      return res.status(404).send(); //lay ve loi sai id
    }
    allowedUpdates.forEach((update) => {
      return (task[update] = req.body[update]);
    });
    await task.save();
    res.status(200).send(task);
  } catch (err) {
    res.status(400).send(err); //lay ve loi validate
  }
});

//DELETE
router.delete("/tasks/:id", auth, async function (req, res) {
  try {
    const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});

    if (!task) {
      return res.status(404).send(); //lay ve loi
    }
    res.status(200).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
