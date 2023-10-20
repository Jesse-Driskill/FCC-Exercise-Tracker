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

const accountSchema = new mongoose.Schema({
  username: {required: true, type: String}
});

const Account = new mongoose.model("Account", accountSchema);

app.get('/api/users', (req, res) => {
  Account.find().then((accounts) => {

    res.json({users: accounts});
  
  }).catch((err) => {console.log(err)});
});

app.post('/api/users', (req, res) => {
  let submittedUser = new Account({username: req.body.username});
  submittedUser.save().then((user) => {console.log(user)}).catch((err) => console.log(err));
  res.json({status: "User submitted successfully"});
});






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
