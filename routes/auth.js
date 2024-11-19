const express = require("express");
const { createUser, authenticateUser } = require("../models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();

// 사용자 등록
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        await createUser(username, password);
        res.status(201).json({ message: "사용자 등록 성공" });
    } catch (error) {
        console.error("사용자 등록 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 로그인
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await authenticateUser(username, password);

        const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "1h" });
        res.status(200).json({ token });
    } catch (error) {
        console.error("로그인 오류:", error);
        res.status(401).json({ message: "로그인 실패", error: error.message });
    }
});

module.exports = router;
