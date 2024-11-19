const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// MongoDB 연결 설정 (MongoDB URI에 맞게 설정하세요)
mongoose.connect('mongodb://localhost:27017/shoply_customer', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB에 연결되었습니다."))
    .catch((err) => console.error("MongoDB 연결 실패:", err));

// 사용자 스키마 및 모델 정의
//여기에 user 코드 넣기

const customerSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true, // id가 고유하도록 설정
        default: null, // 수동으로 설정할 수도 있으나, 대부분의 경우 MongoDB에서 _id를 사용
    },
    name: {
        type: String,
        required: true,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true, // 이메일 고유하게 설정
        maxlength: 100,
    },
    password: {
        type: String,
        required: true,
        maxlength: 100,
    },
}, { timestamps: true }); // 생성 및 업데이트 시간을 자동으로 추가

module.exports = mongoose.model("Customer", customerSchema);

// 회원가입 라우트
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 중복 계정 확인
        const existingUser = await User.findOne({ name, email });
        if (existingUser) {
            return res.status(409).send('이미 존재하는 계정입니다');
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 데이터 삽입
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).send('회원가입 성공');
    } catch (error) {
        console.error('회원가입 실패:', error);
        res.status(500).send('회원가입 실패');
    }
});

// 로그인 라우트
app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        // 사용자 조회
        const user = await User.findOne({ name });
        if (!user) {
            return res.status(401).send('사용자 이름 또는 비밀번호가 잘못되었습니다');
        }

        // 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log('로그인 성공:', user.name);
            return res.status(200).send('로그인 성공');
        } else {
            return res.status(401).send('사용자 이름 또는 비밀번호가 잘못되었습니다');
        }
    } catch (error) {
        console.error('로그인 실패:', error);
        res.status(500).send('로그인 실패');
    }
});

// 비밀번호 재설정 라우트
app.post('/reset_password', async (req, res) => {
    const { name, email, newPassword } = req.body;

    try {
        // 사용자 조회
        const user = await User.findOne({ name, email });
        if (!user) {
            return res.status(404).send('사용자를 찾을 수 없습니다');
        }

        // 비밀번호 해싱 및 업데이트
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).send('비밀번호가 성공적으로 재설정되었습니다');
    } catch (error) {
        console.error('비밀번호 재설정 실패:', error);
        res.status(500).send('비밀번호 재설정 실패');
    }
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});