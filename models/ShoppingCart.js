const mongoose = require("mongoose");

// 장바구니 스키마 정의
const shoppingCartSchema = new mongoose.Schema({
    cart_id: { type: String, required: true, unique: true }, // 장바구니 ID
    username: { type: String, required: true }, // 사용자 이름
    product_ids: { type: [String], required: true }, // 상품 ID 배열
});

// 장바구니 모델 생성
const ShoppingCart = mongoose.model("ShoppingCart", shoppingCartSchema);

// 장바구니 생성 함수
const createCart = async (cart_id, username, product_ids) => {
    const cart = new ShoppingCart({ cart_id, username, product_ids });
    await cart.save();
    console.log("장바구니 생성됨:", cart);
};

// 장바구니 조회 (상품 정보 포함)
const getCartWithProductDetails = async (username) => {
    const cart = await ShoppingCart.findOne({ username }).lean();
    if (!cart) return null;

    // 상품 정보를 병합 (가정: Product 모델이 별도로 존재)
    const Product = require("./Product");
    const products = await Product.find({ p_id: { $in: cart.product_ids } }).lean();
    return { ...cart, products };
};

// 장바구니에 상품 추가
const addToCart = async (cart_id, product_id) => {
    const cart = await ShoppingCart.findOne({ cart_id });
    if (!cart) throw new Error("장바구니를 찾을 수 없습니다.");
    cart.product_ids.push(product_id);
    await cart.save();
    return cart;
};

// 장바구니에서 상품 제거
const removeFromCart = async (cart_id, product_id) => {
    const cart = await ShoppingCart.findOne({ cart_id });
    if (!cart) throw new Error("장바구니를 찾을 수 없습니다.");
    cart.product_ids = cart.product_ids.filter((id) => id !== product_id);
    await cart.save();
    return cart;
};

// 장바구니 삭제
const deleteCart = async (cart_id) => {
    const result = await ShoppingCart.findOneAndDelete({ cart_id });
    console.log("장바구니 삭제됨:", result);
    return result;
};

module.exports = {
    createCart,
    getCartWithProductDetails,
    addToCart,
    removeFromCart,
    deleteCart,
    ShoppingCart,
};
