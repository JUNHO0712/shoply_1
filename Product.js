const mongoose = require('mongoose');

// 상품 스키마 정의
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
});

// 상품 모델 생성
const Product = mongoose.model('Product', productSchema);

module.exports = Product;

const Product = require('./Product'); // 상품 모델 임포트

// 상품 추가
const createProduct = async (name, description, price, stock) => {
    const product = new Product({ name, description, price, stock });
    await product.save();
    console.log('상품 추가됨:', product);
};

// 모든 상품 조회
const getAllProducts = async () => {
    const products = await Product.find();
    console.log('상품 목록:', products);
    return products;
};

// 상품 수정
const updateProduct = async (productId, updatedData) => {
    const product = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
    console.log('상품 수정됨:', product);
    return product;
};

// 상품 삭제
const deleteProduct = async (productId) => {
    await Product.findByIdAndDelete(productId);
    console.log('상품 삭제됨:', productId);
};

// 예시 호출
(async () => {
    await createProduct('예시 상품', '상품 설명', 10000, 50);
    await getAllProducts();
    // 여기에 상품 ID를 넣어 수정 및 삭제 테스트
    // await updateProduct('상품ID', { price: 12000 });
    // await deleteProduct('상품ID');
})();