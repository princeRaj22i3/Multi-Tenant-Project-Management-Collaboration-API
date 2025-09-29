const express = require('express');
const app = express();
const port = 3001;
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');


mongoose.connect('mongodb://127.0.0.1:27017/MTPMCA')
.then(()=>{console.log("Mongo connected")})
.catch((err)=>console.error("Mongo connection failed",err))


app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

const verifyToken = require('./middlewares/authMiddleware');
const signupRouter = require('./routes/signup');
const loginRouter = require('./routes/login');
const createOrg = require('./routes/org');

app.use('/signup',signupRouter);
app.use('/login',loginRouter);
app.use(verifyToken);
app.use('/org',createOrg);

app.listen(port,()=>{
    console.log(`App running at http://localhost:${port}`);
})