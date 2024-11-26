const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
    username: { type: String, required: true },        // 회원 ID
    productId: { type: String, required: true },     // 상품 ID
    productName: { type: String, required: true },   // 상품 이름
    productImage: { type: String, required: true },  // 상품 이미지 URL
    addedAt: { type: Date, default: Date.now },      // 추가된 시간
});

module.exports = mongoose.model("Favorite", FavoriteSchema);