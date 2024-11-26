const express = require("express");
const {
    createCart,
    getCartWithProductDetails,
    addToCart,
    removeFromCart,
    deleteCart,
} = require("../models/ShoppingCart");
const router = express.Router();

// 장바구니 생성
router.post("/cart", async (req, res) => {
    const { cart_id, user_id, product_ids } = req.body;

    try {
        await createCart(cart_id, user_id, product_ids);
        res.status(201).json({ message: "장바구니 생성 성공" });
    } catch (error) {
        console.error("장바구니 생성 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 사용자 장바구니 조회
router.get("/:user_id", async (req, res) => {
    try {
        const cartWithDetails = await getCartWithProductDetails(req.params.user_id);
        if (cartWithDetails) {
            res.status(200).json(cartWithDetails);
        } else {
            res.status(404).json({ message: "장바구니를 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("장바구니 조회 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 장바구니에 상품 추가
router.put("/:cart_id/add", async (req, res) => {
    try {
        const cart = await addToCart(req.params.cart_id, req.body.product_id);
        res.status(200).json({ message: "상품 추가 성공", cart });
    } catch (error) {
        console.error("상품 추가 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 장바구니에서 상품 제거
router.put("/:cart_id/remove", async (req, res) => {
    try {
        const cart = await removeFromCart(req.params.cart_id, req.body.product_id);
        res.status(200).json({ message: "상품 제거 성공", cart });
    } catch (error) {
        console.error("상품 제거 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 장바구니 삭제
router.delete("/:cart_id", async (req, res) => {
    try {
        await deleteCart(req.params.cart_id);
        res.status(200).json({ message: "장바구니 삭제 성공" });
    } catch (error) {
        console.error("장바구니 삭제 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

module.exports = router;
