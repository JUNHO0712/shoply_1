const express = require("express")
const mongoose = require("mongoose")
require('dotenv').config()
const cors = require("cors") // 테스트를 위해 어떤 주소로든 접근 하게 하기위한 변수, 테스트가 끝나면 다시 닫아주어야함
const app = express()
app.use(cors());
mongoose.connect(process.env.DB,{ //데이터베이스 주소
    useNewUrlParser: true,
    useUnifiedTopology : true,
}).then(()=>console.log("connected to database"));

module.exports = app
