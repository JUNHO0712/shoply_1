const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const mongoURI = 'mongodb://localhost:27017/mydatabase'; // MongoDB URI

// MongoDB 연결
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB에 연결되었습니다.');
})
.catch(err => {
    console.error('MongoDB 연결 오류:', err);
});

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// 사용자 스키마 정의
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// 상품 스키마 정의
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
});

// 모델 생성
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

// 사용자 등록
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).json({ message: '사용자 등록 성공' });
    } catch (error) {
        console.error('사용자 등록 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 로그인
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' }); // 비밀키와 만료시간 설정
            res.json({ token });
        } else {
            res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 상품 추가
app.post('/products', async (req, res) => {
    try {
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
        });
        await product.save();
        res.status(201).json({ message: '상품 추가 성공', product });
    } catch (error) {
        console.error('상품 추가 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});


app.post('/cart', (req, res) => {
    // 장바구니에 상품 추가
});
const stripe = require('stripe')('your-stripe-secret-key');

app.post('/checkout', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: req.body.items, // 장바구니에서 가져온 상품 정보
        mode: 'payment',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
    });
    res.json({ id: session.id });
});
// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}에서 시작되었습니다.`);
});