import mongoose from "mongoose";

 
const connectDB = async (connection_url) => {
  try {
    const DB_OPTIONS = {
      dbname: process.env.DB_NAME
    }
    await mongoose.connect(connection_url , DB_OPTIONS);
  } catch (error) {
    console.log(error)
  }
}

export default connectDB;