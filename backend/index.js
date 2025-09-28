const express = require('express');
const app = express();
const port = 3001;
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
mongoose.connect('mongodb://127.0.0.1:27017/MTPMCA');
const verifyToken = require('./middlewares/authMiddleware');

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

const signupRouter = require('./routes/signup');
const loginRouter = require('./routes/login');

app.use('/signup',signupRouter);
app.use('/login',loginRouter);

app.listen(port,()=>{
    console.log(`App running at http://localhost:${port}`);
})