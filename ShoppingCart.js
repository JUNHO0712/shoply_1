const mongoose = require('mongoose');
const { Product } = require('./Product'); // Product 모델 가져오기

// 장바구니 스키마 정의
const shoppingCartSchema = new mongoose.Schema({
    cart_id: { type: String, required: true, unique: true }, // 장바구니 ID
    user_id: { type: String, required: true }, // 사용자 ID
    product_ids: [{ type: String, required: true }] // 상품 ID 배열
});

// 장바구니 모델 생성
const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);

// 장바구니 생성 함수
const createCart = async (cart_id, user_id, product_ids) => {
    const cart = new ShoppingCart({ cart_id, user_id, product_ids });
    await cart.save();
    console.log('장바구니 생성됨:', cart);
};

// 장바구니 업데이트 함수 (상품 추가)
const addToCart = async (cart_id, product_id) => {
    const cart = await ShoppingCart.findOneAndUpdate(
        { cart_id },
        { $addToSet: { product_ids: product_id } }, // 상품이 중복 없이 추가되도록 설정
        { new: true }
    );
    return cart;
};

// 장바구니에서 상품 제거 함수
const removeFromCart = async (cart_id, product_id) => {
    const cart = await ShoppingCart.findOneAndUpdate(
        { cart_id },
        { $pull: { product_ids: product_id } }, // 해당 상품 ID를 장바구니에서 제거
        { new: true }
    );
    return cart;
};

// 장바구니 삭제 함수
const deleteCart = async (cart_id) => {
    await ShoppingCart.findOneAndDelete({ cart_id });
};

// 장바구니와 상품 상세 정보 포함 조회 함수
const getCartWithProductDetails = async (user_id) => {
    const cart = await ShoppingCart.findOne({ user_id });
    if (!cart) return null;

    // product_ids를 통해 상품 정보 조회
    const products = await Product.find({ p_id: { $in: cart.product_ids } }, 'p_name p_price p_img');

    // 장바구니와 상품 정보를 포함한 결과 반환
    return {
        cart_id: cart.cart_id,
        user_id: cart.user_id,
        products: products.map(product => ({
            id: product.p_id,
            name: product.p_name,
            price: product.p_price,
            img: product.p_img
        }))
    };
};

module.exports = {
    createCart,
    getCartWithProductDetails,
    addToCart,
    removeFromCart,
    deleteCart,
    ShoppingCart
};
