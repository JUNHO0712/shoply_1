const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    p_id: { type: String, required: true, unique: true }, // ��ǰ ID
    p_name: { type: String, required: true }, // ��ǰ �̸�
    p_price: { type: Number, required: true }, // ����
    p_img: { type: String }, // �̹��� URL
    p_content: { type: String, required: true }, // ��ǰ ����
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
