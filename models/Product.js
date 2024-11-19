const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    p_id: { type: String, required: true, unique: true }, // 상품 ID
    p_name: { type: String, required: true }, // 상품 이름
    p_price: { type: Number, required: true }, // 가격
    p_img: { type: String }, // 이미지 URL
    p_content: { type: String, required: true }, // 상품 설명
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
