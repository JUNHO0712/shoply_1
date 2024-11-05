const mongoose = require('mongoose');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 상품 스키마 정의
const productSchema = new mongoose.Schema({
    p_id: { type: String, required: true, unique: true }, // 상품 ID
    p_name: { type: String, required: true }, // 상품 이름
    p_price: { type: Number, required: true }, // 가격
    p_img: { type: String }, // 이미지 URL
    p_content: { type: String, required: true }, // 상품 설명
});

// 상품 모델 생성
const Product = mongoose.model('Product', productSchema);

// 이미지 리사이즈 함수
const resizeImage = async (inputPath, outputPath) => {
    await sharp(inputPath)
        .resize(300, 300) // 300x300 픽셀로 리사이즈
        .toFile(outputPath);
};

// 상품 추가 함수
const createProduct = async (p_id, p_name, p_price, p_imgPath, p_content) => {
    const resizedImgPath = path.join(__dirname, 'resized', `${p_id}.jpg`); // 리사이즈된 이미지 저장 경로

    // 이미지 리사이즈
    await resizeImage(p_imgPath, resizedImgPath);

    const product = new Product({ p_id, p_name, p_price, p_img: resizedImgPath, p_content });
    await product.save();
    console.log('상품 추가됨:', product);
};

// 모든 상품 조회 함수
const getAllProducts = async () => {
    const products = await Product.find();
    return products;
};

// 상품 ID로 검색 함수
const findProductById = async (p_id) => {
    const product = await Product.findOne({ p_id });
    return product;
};

// 상품 수정 함수
const updateProduct = async (productId, updatedData) => {
    const product = await Product.findOneAndUpdate({ p_id: productId }, updatedData, { new: true });
    return product;
};

// 상품 삭제 함수
const deleteProduct = async (productId) => {
    await Product.findOneAndDelete({ p_id: productId });
};

// Exported functions and model for use in server
module.exports = {
    createProduct,
    getAllProducts,
    findProductById,
    updateProduct,
    deleteProduct,
    Product // Product 모델도 내보내기
};
