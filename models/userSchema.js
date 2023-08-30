import mongoose from "mongoose";

const emailValidator = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const UserSchema = new mongoose.Schema({
  name: {type:String , required:true , trim:true},
  email: {
    type:String,
    required:true, 
    unique:true,
    validate:{
      validator: function(email) {
        return emailValidator.test(email)
      },
      message: props => "${props.value} is not a valid email address."
    }
  },
  password: {type:String , required:true},
})

const UserModel = mongoose.model('JWTAuthentication' , UserSchema)

export default UserModel