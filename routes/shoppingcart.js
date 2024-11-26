const express = require("express");
const {
    createCart,
    getCartWithProductDetails,
    addToCart,
    removeFromCart,
    deleteCart,
} = require("../models/ShoppingCart");
const router = express.Router();

// ��ٱ��� ����
router.post("/cart", async (req, res) => {
    const { cart_id, user_id, product_ids } = req.body;

    try {
        await createCart(cart_id, user_id, product_ids);
        res.status(201).json({ message: "��ٱ��� ���� ����" });
    } catch (error) {
        console.error("��ٱ��� ���� ����:", error);
        res.status(500).json({ message: "���� ����", error: error.message });
    }
});

// ����� ��ٱ��� ��ȸ
router.get("/:user_id", async (req, res) => {
    try {
        const cartWithDetails = await getCartWithProductDetails(req.params.user_id);
        if (cartWithDetails) {
            res.status(200).json(cartWithDetails);
        } else {
            res.status(404).json({ message: "��ٱ��ϸ� ã�� �� �����ϴ�." });
        }
    } catch (error) {
        console.error("��ٱ��� ��ȸ ����:", error);
        res.status(500).json({ message: "���� ����", error: error.message });
    }
});

// ��ٱ��Ͽ� ��ǰ �߰�
router.put("/:cart_id/add", async (req, res) => {
    try {
        const cart = await addToCart(req.params.cart_id, req.body.product_id);
        res.status(200).json({ message: "��ǰ �߰� ����", cart });
    } catch (error) {
        console.error("��ǰ �߰� ����:", error);
        res.status(500).json({ message: "���� ����", error: error.message });
    }
});

// ��ٱ��Ͽ��� ��ǰ ����
router.put("/:cart_id/remove", async (req, res) => {
    try {
        const cart = await removeFromCart(req.params.cart_id, req.body.product_id);
        res.status(200).json({ message: "��ǰ ���� ����", cart });
    } catch (error) {
        console.error("��ǰ ���� ����:", error);
        res.status(500).json({ message: "���� ����", error: error.message });
    }
});

// ��ٱ��� ����
router.delete("/:cart_id", async (req, res) => {
    try {
        await deleteCart(req.params.cart_id);
        res.status(200).json({ message: "��ٱ��� ���� ����" });
    } catch (error) {
        console.error("��ٱ��� ���� ����:", error);
        res.status(500).json({ message: "���� ����", error: error.message });
    }
});

module.exports = router;
