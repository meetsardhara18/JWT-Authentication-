import UserModel from "../models/userSchema.js";
import bcrypt from 'bcrypt';
import  jwt  from "jsonwebtoken";
import transporter from "../config/sendEmail.js";

class User{
  static register = async (req , res) => {
    const {name , email , password , conform_password} = req.body
    if(name){
      if(email){
        if(password){
          if(conform_password){
            if(password === conform_password){
              const user = await UserModel.findOne({email:email});
              if (!user){
                try {
                  const salt = await bcrypt.genSalt(8);
                  const hashpassword = await  bcrypt.hash(password , salt);
                  const newUser = new UserModel({
                    name:name,
                    email: email,
                    password: hashpassword
                  });
                  await newUser.save();
                  const token = jwt.sign({'user_id':newUser.id} , process.env.JWT_SECRET_KEY , {expiresIn: '8d'})
                  res.status(201).send({'status': 201 , 'message': 'Register successfully.' , 'token': token});
                } catch (error) {
                  res.status(500).send({'status': 500 , 'message': error.message});
                }
              }else{
                res.status(400).send({'status': 400 ,'message': 'User with this email already exits.'});
              }
            }else{
              res.status(400).send({'status': 400 ,'message': 'Password and conform password does not match.'});
            }
          }else{
            res.status(400).send({'status': 400 ,'message': 'Please enter conform password.'});
          }
        }else{
          res.status(400).send({'status': 400 ,'message': 'Please enter password.'});
        }
      }else{
        res.status(400).send({'status': 400 ,'message': 'Please enter your email.'});
      }
    }else{
      res.status(400).send({'status': 400 ,'message': 'Please enter your name.'});
    }
  }

  static login = async (req , res) => {
    try {
      const {email , password} = req.body;
      if(email){
        if(password){
          const user = await UserModel.findOne({email:email});
          if(user){
            const match_password = await bcrypt.compare(password , user.password);
            if(user.email === email && match_password){
              const token = jwt.sign({'user_id':user.id} , process.env.JWT_SECRET_KEY , {expiresIn: '8d'})
              res.status(200).send({'status':200 , 'message': 'Login successfully.' , 'token': token});
            }else{
              res.status(400).send({'status':400 , 'message': 'Invalid email or password.'});
            }
          }else{
            res.status(404).send({'status':404 , 'message': 'User with this email is not registered.'});
          }
        }else{
          res.status(400).send({'status': 400 ,'message': 'Please enter password.'});
        }
      }else{
        res.status(400).send({'status': 400 ,'message': 'Please enter your email.'});
      }
    } catch (error) {
      res.status(500).send({'status': 500 , 'message': 'Internal server error.'});
    }
  }

  static user_profile = async (req , res) => {
    try {
      res.status(200).send({'status': 200 , 'message': 'ok' , 'user':req.user});
    } catch (error) {
      res.status(500).send({'status': 500 , 'message': 'Internal server error.'});
    }
  }

  static change_password = async (req , res) => {
    try {
      const {password , conform_password} = req.body;
      if(password){
        if(conform_password){
          if(password === conform_password){
            const salt = await bcrypt.genSalt(8);
            const hashpassword = await  bcrypt.hash(password , salt);
            await UserModel.findByIdAndUpdate(req.user._id , {$set: {password: hashpassword}});
            res.status(200).send({'status':200 , 'message': 'Password change successfully.'})
          }else{
            res.status(400).send({'status': 400 ,'message': 'Password and conform password does not match.'})
          }
        }else{
          res.status(400).send({'status': 400 ,'message': 'Please enter conform password.'});
        }
      }else{
        res.status(400).send({'status': 400 ,'message': 'Please enter password.'});
      }
    } catch (error) {
      console.log(error)
    }
  }

  static send_forgot_password_email = async (req , res) => {
    try {
      const {email} = req.body;
      if(email){
        const user = await UserModel.findOne({email:email});
        if(user){
          const secret_key = user._id + process.env.JWT_SECRET_KEY;
          const token = jwt.sign({'user_id':user.id} , secret_key , {expiresIn: '5m'});
          const link = `http://localhost:8000/accouts/forgot-password/${user._id}/${token}/`;
          const info = await transporter.sendMail({
            from:process.env.EMAIL_FROM,
            to:user.email,
            subject:'Reset password link',
            html:`<a href=${link}>Reset password</a>`
          })
          res.status(200).send({'status':200 , 'message': 'Reset password send your email address.' , 'info':info});
        }else{
          res.status(404).send({'status':404 , 'message': 'User with this email is not registered.'});
        }
      }else{
        res.status(400).send({'status': 400 ,'message': 'Please enter your email.'});
      }
    } catch (error) {
      res.status(500).send({'status': 500 , 'message': error.message});
    }
  }

  static forgot_password = async (req , res) => {
    try {
      const {id , token} = req.params;
      if(id){
        if(token){
          const user = await UserModel.findById(id);
          if(user){
            const secret_key = user._id + process.env.JWT_SECRET_KEY;
            try {
              const verify_token = jwt.verify(token , secret_key);
              const {password , conform_password} = req.body;
              if(password && password != ""){
                if(conform_password && conform_password != ""){
                  if(password === conform_password){
                    const salt = await bcrypt.genSalt(8);
                    const hashpassword = await  bcrypt.hash(password , salt);
                    await UserModel.findByIdAndUpdate(user._id , {$set: {password: hashpassword}});
                    res.status(200).send({'status':200 , 'message': 'Password reset successfully.'})
                  }else{
                    res.status(400).send({'status':400 , 'message': 'Password and conform password does not match.'})
                  }
                }else{
                  res.status(400).send({'status':400 , 'message': 'Please enter conform password.'})
                }
              }else{
                res.status(400).send({'status':400 , 'message': 'Please enter password.'})
              }
            } catch (error) {
              if(error instanceof jwt.TokenExpiredError){
                res.status(400).send({'status':400 , 'message': "This link will be expired."})
              }else{
                res.status(400).send({'status':400 , 'message': error.message})
              }
            }
          }else{
            res.status(404).send({'status':404 , 'message': 'User not found.'})
          }
        }else{
          res.status(401).send({'status': 401 , 'message': 'Unauthorized request.'});
        }
      }else{
        res.status(401).send({'status': 401 , 'message': 'Unauthorized request.'});
      } 
    } catch (error) {
      console.log("nfuehfeufh",error.message);
      res.status(500).send({'status': 500 , 'message': error.message});
    }
  }
}

export default User