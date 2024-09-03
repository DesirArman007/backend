import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static('public'))
app.use(cookieParser())

// routes import

import userRouter from './routes/user.routes.js'

// yaha userRouter isliye likh paye cux in user,router.js export default ho rha hai
// routes declaration

app.use("/api/v1/users", userRouter)
// route url will look like this
//  http://localhost:8000/api/v1/users/register

export {app}