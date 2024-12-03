require("dotenv").config(); // .env 파일 로드
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const app = require("./app"); // Express 앱 가져오기

// 서버 및 소켓 설정
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST","DELETE"],

  },
});

const chattingHandler = require("./routes/Chatting")(io);
app.use("/chat", chattingHandler);
// MongoDB 연결
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error("MongoDB URI가 설정되지 않았습니다. .env 파일을 확인하세요.");
  process.exit(1);
}

mongoose
    .connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // 연결 풀 크기 설정
    })
    .then(() => console.log("MongoDB 연결 성공"))
    .catch((err) => console.error("MongoDB 연결 오류:", err));

// 정적 파일 제공
app.use("/uploads", express.static("uploads")); // 업로드된 파일 제공
app.use(express.static(path.join(__dirname, "public"))); // 정적 파일 제공

// WebSocket 이벤트 처리
io.on("connection", (socket) => {
  console.log("새로운 클라이언트 연결:", socket.id);

  // 방 참여 이벤트
  socket.on("joinRoom", (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`클라이언트 ${socket.id}이(가) 방 ${chatRoomId}에 입장했습니다.`);
  });

  // 채팅 메시지 이벤트
  socket.on("chatMessage", ({ chatRoomId, username, message }) => {
    console.log(`방 ${chatRoomId}에서 ${username}: ${message}`);
    io.to(chatRoomId).emit("chatMessage", { username, message });
  });

  // 이미지 업로드 이벤트
  // socket.on("uploadImage", ({ chatRoomId, username, image }) => {
  //   try {
  //     const buffer = Buffer.from(image, "base64");
  //     const filePath = `uploads/${Date.now()}.png`;
  //     fs.writeFileSync(filePath, buffer);

  //     io.to(chatRoomId).emit("receiveImage", {
  //       username,
  //       image: `/${filePath}`,
  //     });
  //   } catch (err) {
  //     console.error("이미지 업로드 오류:", err);
  //   }
  // });

  // 연결 해제 이벤트
  socket.on("disconnect", () => {
    console.log("클라이언트 연결 해제:", socket.id);
  });
});

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 업로드 파일 저장 경로
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // 고유 파일명 생성
  },
});
const upload = multer({ storage });

// 업로드 API (테스트용)
app.post("/upload", upload.single("file"), (req, res) => {
  res.status(200).json({
    message: "파일 업로드 성공",
    filePath: `/uploads/${req.file.filename}`,
  });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0",() => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
