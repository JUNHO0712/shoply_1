const express = require("express");
const ShoppingCart = require("../models/ShoppingCart"); // ShoppingCart 모델 가져오기
const Product = require("../models/Product"); // Product 모델 가져오기
const router = express.Router();

// 장바구니 생성
router.post("/cart", async (req, res) => {
    const { cart_id, username, product_ids } = req.body;

    try {
        const cart = new ShoppingCart({ cart_id, username, product_ids });
        await cart.save();
        res.status(201).json({ message: "장바구니 생성 성공", cart });
    } catch (error) {
        console.error("장바구니 생성 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 사용자 장바구니 조회 (상품 정보 포함)
router.get("/:username", async (req, res) => {
    try {
        const cart = await ShoppingCart.findOne({ username: req.params.username }).lean();
        if (!cart) return res.status(404).json({ message: "장바구니를 찾을 수 없습니다." });

        // 상품 정보 병합
        const products = await Product.find({ p_id: { $in: cart.product_ids } }).lean();
        res.status(200).json({ ...cart, products });
    } catch (error) {
        console.error("장바구니 조회 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 장바구니에 상품 추가
router.put("/:cart_id/add", async (req, res) => {
    try {
        const cart = await ShoppingCart.findOne({ cart_id: req.params.cart_id });
        if (!cart) return res.status(404).json({ message: "장바구니를 찾을 수 없습니다." });

        cart.product_ids.push(req.body.product_id);
        await cart.save();
        res.status(200).json({ message: "상품 추가 성공", cart });
    } catch (error) {
        console.error("상품 추가 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 장바구니에서 상품 제거
router.put("/:cart_id/remove", async (req, res) => {
    try {
        const cart = await ShoppingCart.findOne({ cart_id: req.params.cart_id });
        if (!cart) return res.status(404).json({ message: "장바구니를 찾을 수 없습니다." });

        cart.product_ids = cart.product_ids.filter((id) => id !== req.body.product_id);
        await cart.save();
        res.status(200).json({ message: "상품 제거 성공", cart });
    } catch (error) {
        console.error("상품 제거 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 장바구니 삭제
router.delete("/:cart_id", async (req, res) => {
    try {
        const cart = await ShoppingCart.findOneAndDelete({ cart_id: req.params.cart_id });
        if (!cart) return res.status(404).json({ message: "장바구니를 찾을 수 없습니다." });

        res.status(200).json({ message: "장바구니 삭제 성공", cart });
    } catch (error) {
        console.error("장바구니 삭제 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

module.exports = router;
