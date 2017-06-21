var express = require('express');
var router = express.Router();
//var csurf = require('csurf') ;
//var scrfprotection = csurf();
var passport = require('passport');
var User = require('../database/userSchema.js');
var Cours = require('../database/coursShema.js');
var Comments = require('../database/commentShema.js');

//router.use(scrfprotection);
//Upload my files
var multer  = require('multer');
//var upload = multer({ dest: 'public/uploads/' });

// PRofile users
router.get('/userpro' , isLoggedIn , function(req, res , next) {
  res.render('userpro', {
     user : req.user // get the user out of session and pass to template
  });
  console.log(" --- Profile Page ---");
});

/* LoogOut function */
  router.get('/logout' ,isLoggedIn ,function(req , res , next){
    req.logout();
    res.redirect('/');
    console.log('Exit user');
  });

//protect routes
//not loged in
/*
router.use('/',notLoggedIn,function(req, res, next){
  next();
});
*/

// GET home page.
router.get('/', function(req, res, next) {
  res.render('index');
});
//About and Contact
router.get('/about', function(req, res, next) {
  res.render('about');
});
router.get('/contact', function(req, res, next) {
  res.render('contact');
});

//Admin and Contact
router.get('/admin' , isAdmin , function(req, res , next) {
  res.render('admin', {
     user : req.user // get the user out of session and pass to template
  });
  console.log(" --- Admin Page ---");
});
//update Cours
router.post('/update', function(req, res, next) {
      var username = req.body.username;
      User.findOne({ 'username' :  username }, function(err, user) {
          if (err) throw err;
          console.log("username");
           user.role = req.body.role;
            user.save();
            console.log(user.role);
      });
  res.redirect('/admin');
});
//delete a user *_*
router.post('/delete', function(req, res, next) {
var username = req.body.username;
  User.findOneAndRemove({ 'username' :  username }, function(err) {
    if (err) throw err;
    // we have deleted the user
    console.log('User deleted!');
  });
  res.redirect('/admin');
});

//---------------------------------------------------------
// GET cours page.
router.get('/cours', function(req, res, next) {
  Cours.find({}, function(err, docs){
		if(err) res.json(err);
		else    res.render('cours', {Cours  : docs});
	});
});

//show comments
router.get('/dispcours', function(req, res, next) {
  console.log("The is the FileName used in the coments",fname);
  Comments.find({filename:fname}, function(err, lines){
		if(err) res.json(err);
		else    res.render('/dispcours', {Comments : lines});
	});
});
/*OR */
router.post('/dispcours', function(req, res, next) {
        var fname = req.body.fname;
        console.log("req.body from cours :",fname);
        Comments.find({ filename : fname }, function(err, lines){
          console.log("Coments **------> :",lines);
          res.render("dispcours",{fname : fname , Comments : lines , user : req.user ,}) ; //{fname : fname.fname}
      	});
  });

//comment Form GEt data
  router.get('/comment', function(req, res, next) {
    res.render('comment', {
       user : req.user ,
       fname : fname
    });
});
//comment Form Post data

  router.post('/comment', function(req, res, next) {
    var fname = req.body.fname;
    console.log("req.body from dispcours :",fname);
      res.render("comment",{user : req.user ,fname : fname}) ;
    });
//thanks page && insert into collection comment
    router.post('/thanks', function(req, res, next) {
        console.log("req.body.ur :",req.body.fname);
      if(req.body.comment === undefined || req.body.comment === "" ){
      console.log("*** Comment Erreur - undefined or null ***");
      res.redirect('/cours');
        }else{
              console.log(" ------Comment Filename--------  ",req.body.fname);
              console.log(" ------Comment Body--------  ",req.body.comment);
                  var com = {
                    filename : req.body.fname,
                    body : req.body.comment,
                    author : req.body.author,
                    role_author : req.body.role_author ,
                  }
                     var mycomment = new Comments(com);
                     console.log(" ###### mycomment COM #### waiting for saving: ",com);

                     mycomment.save((function(err, result) {
                         console.log('******************Comment Created');
                     }));

                      res.render("thanks") ;

            }
      });


router.get('/Upload',isATeacher, function(req, res, next) {
  res.render('Upload', {
     user : req.user // get the user out of session and pass to template
  });
});

var nameOfMyFile ;
/* multer object creation */
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'database/uploads/');
    },
    filename: function (req, file, cb) {
     nameOfMyFile =  'MyCours'+file.originalname;
      //var date = Date.now();
        console.log("WAk WAAAAAAAAAAAAAAAAAK "+nameOfMyFile);
        cb(null, 'MyCours'+file.originalname);
  }
})

var upload = multer({ storage: storage });

/* GET home page. */
router.get('/Upload', function(req, res, next) {
  res.render('Upload');
});

router.post('/Upload', upload.any(), function(req, res, next) {
      console.log(req.body, 'Body');
      console.log(req.files, 'files');
          if(req.file){
                res.send("Erreur In Your Uploading Process -_~");
          }
      console.log(" ------------------- "+nameOfMyFile);
          var item = {
           title: req.body.title,
           filename: nameOfMyFile,
           author: req.body.author
          }
          var mycour = new Cours(item);
          mycour.save();

          res.redirect("/cours");
});
//---------------------------------------------------------

/* GET signin page. */
router.get('/signin',notLoggedIn, function(req, res, next) {
  res.render('signin');
//  res.render('signin',{ csrfToken: req.csrfToken() });
});

// process the login form

router.post('/signin', passport.authenticate('local-login', {
    successRedirect : '/userpro', // redirect to the secure profile section
    failureRedirect : '/signin', // redirect back to the signin page if there is an error
    failureFlash : true // allow flash messages
}));

/* GET signup page. */
router.get('/signup' ,notLoggedIn,function(req, res, next) {
  var messages = req.flash('error');
  res.render('signup', { messages : messages});
//  res.render('signup',{ csrfToken: req.csrfToken() });
});
router.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/userpro', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

  //route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated()){
            return next();
        }else{
          // if they aren't redirect them to the home page
         res.redirect('/');
        }

    }

module.exports = router;

function notLoggedIn(req, res, next) {
  // if user is not authenticated in the session, carry on
     if(!(req.isAuthenticated())){
        return next();
      }
     res.redirect('/cours');
    }

function isAdmin(req, res, next) {
    if (req.isAuthenticated()) {
      if (req.user.email == 'admin@mycours.fr') {
        console.log("is An Admin ");
        return next();
      }else{
        res.redirect('/userpro');
      }
    }
}
function isATeacher(req, res, next) {
    if (req.isAuthenticated()) {
      if (req.user.role == 'Teacher') {
        console.log("is A Teacher ");
        return next();
      }else{
        res.redirect('/cours');
      }
    }
}
