const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user"); // User 모델 가져오기

const router = express.Router();

// 회원가입
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
     
      
    });
    await user.save();
    res.status(201).send("회원가입 성공");
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).send("서버 오류");
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send("사용자가 존재하지 않습니다.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("잘못된 비밀번호입니다.");
    }

    res.status(200).send("로그인 성공");
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).send("서버 오류");
  }
});

// 비밀번호 재설정
router.post("/reset-password", async (req, res) => {
  const { username, email, newPassword } = req.body;

  try {
    // 사용자 확인
    const user = await User.findOne({ username, email });
    if (!user) {
      return res.status(404).send("사용자를 찾을 수 없습니다.");
    }

    // 새로운 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // 사용자 저장
    await user.save();
    res.status(200).send("비밀번호가 성공적으로 변경되었습니다.");
  } catch (error) {
    console.error("비밀번호 재설정 오류:", error);
    res.status(500).send("서버 오류");
  }
});

module.exports = router;