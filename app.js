const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const loginRoutes = require("./routes/Login2");
const chatRoutes = require("./routes/Chatting");
const FavoriteRoutes = require("./routes/Favorite");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware 설정
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); 
// 라우트 연결
app.use("/auth", loginRoutes);
app.use("/chat", chatRoutes);
app.use("/favorites", FavoriteRoutes);
module.exports = app; // MongoDB 연결 및 서버 실행은 index.js에서 처리