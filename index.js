const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('dotenv').config()

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_URI);


//
const accountSchema = new mongoose.Schema({
  username: {required: true, type: String}
});

const Account = new mongoose.model("Account", accountSchema);
//

//
const exerciseSchema = new mongoose.Schema({
  description: {type: String, required: true},
  duration: {type: Number, required: true},
  userID: {type: String, required: true},
  date: String
});

const Exercise = new mongoose.model("Exercise", exerciseSchema);
//

app.get('/api/users', (req, res) => {
  Account.find().then((accounts) => {

    res.json(accounts);
  
  }).catch((err) => {console.log(err)});
});

Account.deleteMany({}).then((result) => console.log(result)).catch((err) => console.error(err));
Exercise.deleteMany({}).then((result) => console.log(result)).catch((err) => console.error(err));

app.post('/api/users', (req, res) => {
  let submittedUser = new Account({username: req.body.username});
  submittedUser.save().then((user) => {

    console.log(user)
    res.json({username: user.username, _id: user._id});
  
  }).catch((err) => console.log(err));
});

app.post('/api/users/:_id/exercises', (req, res) => {
  let exerciseDuration = req.body.duration;
  let exerciseDescription = req.body.description;
  let exerciseUserID = req.params._id;

  let exerciseDate = new Date(req.body.date).toUTCString().slice(0,16);
  if (exerciseDate == "Invalid Date") {
    exerciseDate = new Date().toUTCString().slice(0,16);
  }

  exerciseDate = exerciseDate.slice(0,3) + exerciseDate.slice(4, exerciseDate.length);
  exerciseDate = exerciseDate.slice(0,4) + exerciseDate.slice(7, 11) + exerciseDate.slice(4, 6) + exerciseDate.slice(10,exerciseDate.length);

  // let exerciseDate = new Date(req.body.date).toDateString();
  // if (exerciseDate == "Invalid Date") {
  //   exerciseDate = new Date().toDateString();
  // }

  let submittedExercise = new Exercise({
    duration: exerciseDuration,
    description: exerciseDescription,
    userID: exerciseUserID,
    date: exerciseDate
  });

  submittedExercise.save();
  console.log(submittedExercise);

  Account.findOne({_id: exerciseUserID}).then((user) => {
    res.json({_id: user._id, username: user.username, 
      date: submittedExercise.date, 
      duration: submittedExercise.duration, 
      description: submittedExercise.description});
  }).catch((err) => console.log(err));

});

app.get('/api/users/:_id/logs', (req, res) => {
  console.log('=====================================');
  console.log(req.query);
  console.log('=====================================');

  let lim = undefined;
  if (req.query.limit) {
    lim = parseInt(req.query.limit);
  }


  Account.findOne({_id: req.params._id}).then((user) => {

    Exercise.find({userID: req.params._id}).select('-__v -userID -_id').limit(lim).then((exercises) => {
      res.json({
        _id: user._id,
        username: user.username,
        count: exercises.length,
        log: exercises
      });
    }).catch((err) => console.log(err));
    
  }).catch((err) => console.error(err));

});






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
