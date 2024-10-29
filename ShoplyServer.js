const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 회원가입
app.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // DB에 사용자 저장
});

// 로그인
app.post('/login', async (req, res) => {
    const user = // DB에서 사용자 찾기
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (isMatch) {
        const token = jwt.sign({ id: user._id }, 'secretkey');
        res.json({ token });
    }
});
// 상품 추가
app.post('/products', (req, res) => {
    // 상품 정보를 DB에 저장
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