const router = require('express').Router();
const {checkUserAuth}=require('../middleware/auth-middleWare');
const {login,register,logout,test,sendUserPasswordResetEmail,userPasswordReset,changeUserPassword,loggedUser} = require('../controllers/userControler');
// router.get('/test',test);
router.use('/changepassword',checkUserAuth)
router.use('/loggeduser',checkUserAuth)

router.post('/register',register);
router.post('/login',login);
router.post('/send-reset-password',sendUserPasswordResetEmail);
router.post('/reset-password/:id/:token',userPasswordReset);

router.get('/logout',logout);


// Protected Routes
router.post('/changepassword', changeUserPassword)
router.get('/loggeduser',loggedUser)


module.exports=router;