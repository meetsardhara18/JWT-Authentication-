import express from 'express';
import User from "../controllers/accountController.js";
import authenticate_user from '../middlewares/authenticate-middleware.js';

const router = express.Router();

router.use('/change-password/' , authenticate_user);
router.use('/user-profile/' , authenticate_user);

//public router 
router.post('/register/' , User.register);
router.post('/login/' , User.login);
router.post('/send-forgot-password-email/' , User.send_forgot_password_email);
router.post('/forgot-password/:id/:token/' , User.forgot_password);

//private router
router.get('/user-profile/' , User.user_profile);
router.post('/change-password/' , User.change_password);

export default router