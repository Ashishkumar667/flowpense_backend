import express from 'express';
import {
    googleIOSMobileLogin,
    googleMobileLogin,
} from '../../controllers/mobile/googleSignIn.js';
import { 
    googleWebSignup } from '../../controllers/mobile/google.login.js';
const router = express.Router();

router.post('/google-mobile', googleMobileLogin);
router.post('/google-ios-mobile', googleIOSMobileLogin);

router.post('/google', googleWebSignup);

router.get('/google/callback', async(req,res)=>{
  const { code } = req.query;

  if(!code){
     return res.status(400).json({message : 'Code is missing'});
  }

  try {
    
    const response = await axios.post(`${process.env.BACKEND_URL}/auth/google`, {code});

     const { token, user } = response.data;

     const redirecturl = process.env.FRONTEND_URL;

     res.status(200).redirect(`${redirecturl}?token=${token}`);


  } catch (error) {
    res.status(500).json({message: 'server error'});
        console.log(error);
  }
});


export default router;