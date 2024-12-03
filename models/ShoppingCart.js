const mongoose = require("mongoose");

// 장바구니 스키마 정의
const shoppingCartSchema = new mongoose.Schema({
    cart_id: { type: String, required: true, unique: true }, // 장바구니 ID
    username: { type: String, required: true }, // 사용자 이름 (username으로 변경됨)
    product_ids: { type: [String], required: true }, // 상품 ID 배열
}, { timestamps: true }); // 생성 및 수정 시간 자동 기록

// 장바구니 모델 생성 및 내보내기
module.exports = mongoose.model("ShoppingCart", shoppingCartSchema);
