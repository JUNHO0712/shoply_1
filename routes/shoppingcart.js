const mongoose = require('mongoose');
const { Product } = require('./Product'); // Product �� ��������

// ��ٱ��� ��Ű�� ����
const shoppingCartSchema = new mongoose.Schema({
    cart_id: { type: String, required: true, unique: true }, // ��ٱ��� ID
    user_id: { type: String, required: true }, // ����� ID
    product_ids: [{ type: String, required: true }] // ��ǰ ID �迭
});

// ��ٱ��� �� ����
const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);

// ��ٱ��� ���� �Լ�
const createCart = async (cart_id, user_id, product_ids) => {
    const cart = new ShoppingCart({ cart_id, user_id, product_ids });
    await cart.save();
    console.log('��ٱ��� ������:', cart);
};

// ��ٱ��� ������Ʈ �Լ� (��ǰ �߰�)
const addToCart = async (cart_id, product_id) => {
    const cart = await ShoppingCart.findOneAndUpdate(
        { cart_id },
        { $addToSet: { product_ids: product_id } }, // ��ǰ�� �ߺ� ���� �߰��ǵ��� ����
        { new: true }
    );
    return cart;
};

// ��ٱ��Ͽ��� ��ǰ ���� �Լ�
const removeFromCart = async (cart_id, product_id) => {
    const cart = await ShoppingCart.findOneAndUpdate(
        { cart_id },
        { $pull: { product_ids: product_id } }, // �ش� ��ǰ ID�� ��ٱ��Ͽ��� ����
        { new: true }
    );
    return cart;
};

// ��ٱ��� ���� �Լ�
const deleteCart = async (cart_id) => {
    await ShoppingCart.findOneAndDelete({ cart_id });
};

// ��ٱ��Ͽ� ��ǰ �� ���� ���� ��ȸ �Լ�
const getCartWithProductDetails = async (user_id) => {
    const cart = await ShoppingCart.findOne({ user_id });
    if (!cart) return null;

    // product_ids�� ���� ��ǰ ���� ��ȸ
    const products = await Product.find({ p_id: { $in: cart.product_ids } }, 'p_name p_price p_img');

    // ��ٱ��Ͽ� ��ǰ ������ ������ ��� ��ȯ
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
