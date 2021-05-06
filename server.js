/* if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const express = require('express'); //includes express

const app = express(); //creates server

const bcrypt=require("bcrypt");

const passport=require("passport");

const flash=require('express-flash')

const session=require('express-session')

const initializePassport=require("./passport-config");
initializePassport(passport,
    email=>db.collection("users").find({email: email}),
    _id=> db.collection("users").find({_id: _id})
);

const bodyParser = require('body-parser')

const MongoClient = require('mongodb').MongoClient;

var db;
var s;

MongoClient.connect('mongodb://localhost:27017/FizzBuzz', (err,database) => 
{
    if(err) return console.log(err);
    db=database.db('fizzbuzz')
    app.listen(3000, ()=> 
    {
        console.log("listening at port number 3000")
    })
} )

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


app.get('/',(req,res)=>{
    res.render('getstarted.html');
})

app.get('/signup',(req,res)=>{
    res.render('signupform.ejs',{flag:"true"})
})
app.get('/signin',(req,res)=>{
    res.render('signinform.ejs')
})
app.get('/index',(req,res)=>{
    res.render('Index.html')
})
app.get('/movies',(req,res)=>{
    res.render('Movies.html')
})
app.get('/tv',(req,res)=>{
    res.render('TV.html')
})


app.post('/signup',async (req,res)=>{
    // db.collection("users").find({"email":req.body.email}).toArray((err,result)=>{
    //     if(err) 
    //     {
    //         return console.log(err);
    //     }
    //     console.log(result);
    //     if(result.length==0) 
    //     {
    //         db.collection("users").insertOne(req.body,(err)=>{
    //             if(err)
    //             {
    //                 return console.log(err);
    //             }
    //             else
    //             {
    //                 res.redirect("/index");
    //             } 
    //         });
    //     }
    //     else
    //     { 
    //         console.log("hi");
    //         res.render('signupform.ejs',{flag: "false"})
    //     }
    // })
    // //db.collection("users").insert(req.body) 
    db.collection("users").find({email:req.body.email}).toArray(async (err,result)=>{
        if(err) return console.log(err);
        if(result.length==0){
            try{
                const hashedPassword=await bcrypt.hash(req.body.password,10);
                var data={email:req.body.email,password:hashedPassword,
                firstname:req.body.firstName,lastname:req.body.lastName};
                db.collection("users").insertOne(data,(error)=>{
                    if(error) return console.log(error);
                    res.redirect("/signin");
                });
                
            }
            catch{
                res.render("signupform.ejs",{flag:"false"});
            }
        }
    });
})

app.post('/signin', passport.authenticate('local',{
    
    successRedirect: '/index',
    failureRedirect: '/signin',
    failureFlash: true
    // db.collection("users").find({"email":req.body.email}).toArray((err,result)=>{
    //     if(err) 
    //     {
    //         return console.log(err);
    //     }
    //     //console.log(result);
    //     if(result.length==0) 
    //     {
    //         res.render("signinform.ejs",{flag:"false"})
    //     }
    //     else
    //     { 
    //         console.log("hi"+req.body);
    //         //res.render('signupform.ejs',{flag: "false"})
    //     }
    // })
    //db.collection("users").insert(req.body) 

}))



*/

  
const express = require('express');
// const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt=require("bcrypt");

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


app.listen(3000, ()=> {
    console.log("listening at port number 3000")
});

