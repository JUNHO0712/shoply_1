const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const {
    createProduct,
    getAllProducts,
    findProductById,
    updateProduct,
    deleteProduct,
    Product // Product 모델 가져오기
} = require('./Product'); // Product.js에서 함수와 모델 가져오기

const app = express();
const PORT = 3000;
const mongoURI = 'mongodb://localhost:27017/shoply'; // MongoDB URI

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

// 모델 생성
const User = mongoose.model('User', userSchema);

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

// 상품 추가 API 엔드포인트
app.post('/products', async (req, res) => {
    const { p_id, p_name, p_price, p_imgPath, p_content } = req.body;

    try {
        await createProduct(p_id, p_name, p_price, p_imgPath, p_content);
        res.status(201).json({ message: '상품 추가 성공' });
    } catch (error) {
        console.error('상품 추가 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 모든 상품 조회 API 엔드포인트
app.get('/products', async (req, res) => {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (error) {
        console.error('상품 조회 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 상품 ID로 검색 API 엔드포인트
app.get('/products/:id', async (req, res) => {
    try {
        const product = await findProductById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('상품 검색 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 상품 수정 API 엔드포인트
app.put('/products/:id', async (req, res) => {
    try {
        const product = await updateProduct(req.params.id, req.body);
        if (product) {
            res.json({ message: '상품 수정 성공', product });
        } else {
            res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('상품 수정 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 상품 삭제 API 엔드포인트
app.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ p_id: req.params.id });
        if (product) {
            res.json({ message: '상품 삭제 성공' });
        } else {
            res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('상품 삭제 오류:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}에서 시작되었습니다.`);
});
