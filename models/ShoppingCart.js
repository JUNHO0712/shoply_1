const mongoose = require("mongoose");

// ��ٱ��� ��Ű�� ����
const shoppingCartSchema = new mongoose.Schema({
    cart_id: { type: String, required: true, unique: true }, // ��ٱ��� ID
    user_id: { type: String, required: true }, // ����� ID
    product_ids: { type: [String], required: true }, // ��ǰ ID �迭
});

// ��ٱ��� �� ����
const ShoppingCart = mongoose.model("ShoppingCart", shoppingCartSchema);

// ��ٱ��� ���� �Լ�
const createCart = async (cart_id, user_id, product_ids) => {
    const cart = new ShoppingCart({ cart_id, user_id, product_ids });
    await cart.save();
    console.log("��ٱ��� ������:", cart);
};

// ��ٱ��� ��ȸ (��ǰ ���� ����)
const getCartWithProductDetails = async (user_id) => {
    const cart = await ShoppingCart.findOne({ user_id }).lean();
    if (!cart) return null;

    // ��ǰ ������ ���� (����: Product ���� ������ ����)
    const Product = require("./Product");
    const products = await Product.find({ p_id: { $in: cart.product_ids } }).lean();
    return { ...cart, products };
};

// ��ٱ��Ͽ� ��ǰ �߰�
const addToCart = async (cart_id, product_id) => {
    const cart = await ShoppingCart.findOne({ cart_id });
    if (!cart) throw new Error("��ٱ��ϸ� ã�� �� �����ϴ�.");
    cart.product_ids.push(product_id);
    await cart.save();
    return cart;
};

// ��ٱ��Ͽ��� ��ǰ ����
const removeFromCart = async (cart_id, product_id) => {
    const cart = await ShoppingCart.findOne({ cart_id });
    if (!cart) throw new Error("��ٱ��ϸ� ã�� �� �����ϴ�.");
    cart.product_ids = cart.product_ids.filter((id) => id !== product_id);
    await cart.save();
    return cart;
};

// ��ٱ��� ����
const deleteCart = async (cart_id) => {
    const result = await ShoppingCart.findOneAndDelete({ cart_id });
    console.log("��ٱ��� ������:", result);
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
