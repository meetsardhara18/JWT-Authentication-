import jwt from 'jsonwebtoken';
import UserModel from '../models/userSchema.js';

const authenticate_user = async (req , res , next) => {
  const {authorization} = req.headers;
  if(authorization && authorization.startsWith('Bearer')){
    try {
      const token = authorization.split(' ')[1];
      const {user_id} = jwt.verify(token , process.env.JWT_SECRET_KEY);
      req.user = await UserModel.findById(user_id).select('-password');
      next();
    } catch (error) {
      console.log(error);
      res.status(400).send({'status':400 , 'message': error})
    }
  }else{
    res.status(401).send({'status':401 , 'message': 'Unauthorized request.'})
  }
}

export default authenticate_user;