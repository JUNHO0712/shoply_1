const express = require("express");
const Chat = require("../Models/chat");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer 저장소 설정
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
module.exports = (io) => {
    // WebSocket 이벤트 처리
    io.on("connection", (socket) => {
        console.log("사용자 연결됨:", socket.id);

        socket.on("joinRoom", (chatRoomId) => {
            socket.join(chatRoomId);
            console.log(`${socket.id} 님이 ${chatRoomId} 방에 입장했습니다.`);
        });

        socket.on("chatMessage", async ({ chatRoomId, username, message }) => {
            try {
                const chat = new Chat({
                    chatRoomId, // 방 ID
                    username, // 사용자 이름
                    message, // 메시지 내용
                    timestamp: new Date(), // 현재 시간
                });
                await chat.save();
        
                // 방에 메시지 브로드캐스트
                io.to(chatRoomId).emit("chatMessage", { username, message });
            } catch (error) {
                console.error("메시지 저장 오류:", error);
            }
        });
        socket.on("sendImage", async ({ chatRoomId, image }) => {
            try {
                const chat = new Chat({ chatRoomId, username: socket.id, image });
                await chat.save(); // 이미지 저장
                io.to(chatRoomId).emit("receiveImage", chat); // 방 안의 모든 사용자에게 이미지 전송
            } catch (err) {
                console.error("이미지 저장 오류:", err);
            }
        });
        socket.on("uploadImage", async ({ chatRoomId, image }) => {
            try {
                const buffer = Buffer.from(image, "base64");
                const filePath = `uploads/${Date.now()}.png`;
                fs.writeFileSync(filePath, buffer);
        
                const chat = new Chat({
                    chatRoomId, // 방 ID
                    username: socket.user?.id || socket.id, // 사용자 이름 (로그인 안 됐으면 socket ID)
                    image: filePath, // 이미지 경로
                    timestamp: new Date(), // 현재 시간
                });
                await chat.save();
        
                io.to(chatRoomId).emit("imageUploaded", {
                    username: socket.user?.id || socket.id,
                    image: `/${filePath}`,
                });
            } catch (err) {
                console.error("이미지 업로드 오류:", err);
            }
        });
        socket.on("imageUploaded", (data) => {
            const img = document.createElement("img");
            img.src = data.image; // 서버에서 제공한 이미지 경로
            img.alt = "Uploaded Image";
            img.style.maxWidth = "300px"; // 보기 좋은 크기로 조정
            document.getElementById("messages").appendChild(img);
        });
        socket.on("disconnect", () => {
            console.log("사용자 연결 종료:", socket.id);
        });
    });

    // REST API
    router.post("/send", async (req, res) => {
        const { username, message, chatRoomId } = req.body;
        try {
            const chat = new Chat({ username, message, chatRoomId, timestamp: new Date() });
            await chat.save();
            res.status(201).send("채팅 메시지가 저장되었습니다.");
        } catch (error) {
            console.error("채팅 저장 오류:", error);
            res.status(500).send("서버 오류");
        }
    });

    router.get("/history/:chatRoomId", async (req, res) => {
        try {
            const chats = await Chat.find({ chatRoomId: req.params.chatRoomId }).sort({ timestamp: 1 });
            res.status(200).json(chats);
        } catch (error) {
            console.error("채팅 기록 불러오기 오류:", error);
            res.status(500).send("서버 오류");
        }
    });

    return router;
};