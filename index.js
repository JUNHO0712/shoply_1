require("dotenv").config(); // .env 파일 로드
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const app = require("./app"); // Express 앱 가져오기
const path = require("path");
const fs = require("fs");
// WebSocket 서버 설정
const server = http.createServer(app);
const io = socketIo(server);
// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public"))); // public 디렉토리에서 파일 제공

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // index.html 반환
});

// app.get("/chat", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "chat.html")); // chat.html 반환
// });

// MongoDB 연결
const mongoURI = process.env.MONGODB_URI; 
// .env에서 MongoDB URI 가져오기
if (!mongoURI) {
    console.error("MongoDB URI가 설정되지 않았습니다. .env 파일을 확인하세요.");
    process.exit(1);
  }
  
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.error("MongoDB 연결 오류:", err));

  io.on("connection", (socket) => {
    console.log("새로운 클라이언트가 연결되었습니다:", socket.id);
  
    // 방 참여 이벤트
    socket.on("joinRoom", (chatRoomId) => {
      socket.join(chatRoomId);
      console.log(`클라이언트 ${socket.id}이(가) 방 ${chatRoomId}에 입장했습니다.`);
  });
    // 이미지 업로드 이벤트
    socket.on("uploadImage", async ({ chatRoomId, image }) => {
      try {
        const buffer = Buffer.from(image, "base64");
        const filePath = `uploads/${Date.now()}.png`;
        fs.writeFileSync(filePath, buffer);
  
        // MongoDB에 저장 (선택 사항)
        const Chat = require("./Models/chat");
        const chat = new Chat({
          chatRoomId,
          username: socket.id, // 사용자 ID
          image: filePath, // 이미지 경로 저장
        });
        await chat.save();
  
        // 방 내 모든 사용자에게 이미지 전송
        io.to(chatRoomId).emit("receiveImage", {
          username: socket.id,
          image: `/${filePath}`, // 정적 경로
        });
      } catch (err) {
        console.error("이미지 업로드 오류:", err);
      }
    });
    // 채팅 메시지 처리
  socket.on("chatMessage", async ({ chatRoomId, username, message }) => {
    console.log(`방 ${chatRoomId}에서 ${username}: ${message}`);
    io.to(chatRoomId).emit("chatMessage", { username, message });
  });

  // 이미지 업로드 처리
  socket.on("uploadImage", async ({ chatRoomId, username, image }) => {
    try {
      const buffer = Buffer.from(image, "base64");
      const filePath = `uploads/${Date.now()}.png`;
      fs.writeFileSync(filePath, buffer);

      io.to(chatRoomId).emit("receiveImage", {
        username,
        image: `/${filePath}`, // 정적 경로
      });
    } catch (err) {
      console.error("이미지 업로드 오류:", err);
    }
  });
  
    // 클라이언트 연결 해제
    socket.on("disconnect", () => {
      console.log("클라이언트 연결 종료:", socket.id);
    });
  });
  const multer = require("multer");

// Multer 저장소 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 업로드된 파일 저장 경로
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // 고유 파일명 생성
  },
});
const upload = multer({ storage });

// 정적 파일 제공
app.use("/uploads", express.static("uploads")); // 업로드된 파일 접근 가능

// 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});