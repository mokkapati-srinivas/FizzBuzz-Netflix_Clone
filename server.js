
const express = require('express');
// const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt=require("bcryptjs");

const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

const { ensureAuthenticated, forwardAuthenticated, checkNotAuthenticated, checkAuthenticated } = require('./config/auth');

// Load User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
// app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'))


// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
// app.use('/', require('./routes/index.js'));
// app.use('/users', require('./routes/users.js'));


app.get('/',checkNotAuthenticated,(req,res)=>{
    res.render('getstarted.ejs');
})

app.get('/signup',checkNotAuthenticated,(req,res)=>{
    res.render('signupform.ejs')
})
app.get('/signin',checkNotAuthenticated,(req,res)=>{
    res.render('signinform.ejs')
})

app.get('/index',checkAuthenticated,(req,res)=>{
    res.render('Index.ejs', {username: req.user.name})
})
app.get('/movies',checkAuthenticated,(req,res)=>{
    res.render('Movies.ejs', {username: req.user.name})
})
app.get('/tv',checkAuthenticated,(req,res)=>{
    res.render('TV.ejs', {username: req.user.name})
})


app.post('/signup',checkNotAuthenticated,async (req,res)=>{ 
    const {firstName, lastName, email, password, password2}=req.body;

    errors = []

    var name = firstName+" "+lastName;

    User.findOne({email: email})
    .then(user => {
        if(user)
        {
            errors.push({ msg: 'Email already exists. Please Sign In!' });
                res.render('signupform.ejs', {
                  errors,
                  name,
                  email,
                  password,
                  password2
            });     
        }
        else
        {
            const newUser = new User({
                name,
                email,
                password
              });
      
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser
                    .save()
                    .then(user => {
                      req.flash(
                        'success_msg',
                        'You are now successfully signed up. Please Sign In!'
                      );
                      res.redirect("/signin");
                    })
                    .catch(err => console.log(err));
                });
              });
        }
    })

});

// Login
app.post('/signin',checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/index',
      failureRedirect: '/signin',
      failureFlash: true
    })(req, res, next);
});


app.get('/signout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/signin');
});


app.listen(process.env.PORT || 3000, ()=> {
    console.log("listening at port number 3000")
});

