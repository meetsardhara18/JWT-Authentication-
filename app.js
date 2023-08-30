import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

import connectDB from './config/connectdb.js'
import router from './routes/accountRoute.js'

// dotenv file configurations
dotenv.config()

const port = process.env.PORT
const connection_url = process.env.CONNECTION_URL

// databse connection
connectDB(connection_url)

const app = express()

// Use JSON data
app.use(express.json())

// cors policy error handling
app.use(cors())

app.use('/accouts' , router)

app.listen(port , () => {
  console.log(`server run at http://localhost:${port}`)
})