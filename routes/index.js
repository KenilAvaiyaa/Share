var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const upload = require('./multer')

const localstrategy = require('passport-local');
passport.use(new localstrategy(userModel.authenticate()))

// login page 
router.get('/', function(req, res, next) {
  res.render('index',{nav:false});
});

// ragister page
router.get('/ragister',(req,res,next)=>{
  res.render('signup',{nav:false})
})

//profile page
router.get('/profile',isLoggedIn,async (req,res,next)=>{
  const user = await userModel
          .findOne({username : req.session.passport.user})
          .populate("posts")
  res.render('profile',{user,nav:true})
})

// all post
router.get('/show/post',isLoggedIn,async (req,res,next)=>{
  const user = await userModel
          .findOne({username : req.session.passport.user})
          .populate("posts")
  res.render('show',{user,nav:true})
})

//feed page
router.get('/feed',isLoggedIn,async (req,res,next)=>{
  const user = await userModel.findOne({username : req.session.passport.user})
  const posts = await postModel.find()
  .populate("user")
  res.render('feed',{user,posts,nav:true})
})

//add post
router.get('/add',isLoggedIn,async (req,res,next)=>{
  const user = await userModel.findOne({
    username : req.session.passport.user
  })
  res.render('add',{user,nav:true})
})

router.post('/createpost',isLoggedIn,upload.single('postimage'),async (req,res,next)=>{
  const user = await userModel.findOne({
    username : req.session.passport.user
  })
  const post = await postModel.create({
    user: user._id,
    photo: req.file.filename,
    title: req.body.title,
    postinfo: req.body.postinfo,
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect('/profile')
})

// make ufile to uplode
router.post('/fileuplode',isLoggedIn, upload.single('image') , async(req,res,next)=>{
  const user = await userModel.findOne({
    username : req.session.passport.user
  })
  user.profileImage = req.file.filename
  await user.save()
  res.redirect('/profile')
})


//make user using data to send database
router.post('/ragister',(req,res,next)=>{
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
  })

  userModel.register(data,req.body.password)
  .then(function(ragistereduser){
    passport.authenticate("local",(req,res,()=>{
      res.redirect('/profile')
    }))
  })
})

//login page
router.post('/login', passport.authenticate("local",{
  failureRedirect:'/',
  successRedirect:'/profile',
}) ,(req,res,next)=>{
})

//logout page
router.get('/logout',(req,res)=>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

//function islogin
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect ('/login')
}


module.exports = router;
