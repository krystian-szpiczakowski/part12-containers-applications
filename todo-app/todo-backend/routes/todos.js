const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();
const {getAsync, setAsync} = require('../redis');

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});


router.get('/statistics', async(_, res) => {
  let todoCount = await getAsync('todo_count');
  if (!todoCount) {
    todoCount = 0
  }

  console.log(`Todo count is ${todoCount}`)
  res.json({"added_todos": todoCount});
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })

  const value = await getAsync('todo_count')
  const counter = isNaN(value) ? 0 : parseInt(value, 10)
  await setAsync('todo_count', (counter + 1))

  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.send(req.todo);
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  const id = req.todo._id;
  const updatedBody = req.body;

  const todoAfterUpdate = await Todo.findOneAndReplace({_id: id}, updatedBody, {new: true});
  res.send(todoAfterUpdate);
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
