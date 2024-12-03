const express = require("express");
const Favorite = require("../models/favorite");
const Product = require("../models/Product"); // Product 모델 가져오기
const router = express.Router();

// 즐겨찾기 추가
router.post("/add", async (req, res) => {
    console.log("즐겨찾기 추가 요청 수신");
    console.log(req.body);
    try {
        const { username, productId: p_id, productName: p_name, productImage: p_img } = req.body;
        
        // 중복 확인
        const existingFavorite = await Favorite.findOne({ username, p_id });
        if (existingFavorite) {
            return res.status(400).send("이미 즐겨찾기에 추가된 상품입니다.");
        }

        // 상품 존재 확인
        const product = await Product.findOne({ p_id });
        if (!product) {
            return res.status(404).send("상품이 존재하지 않습니다.");
        }

        // 즐겨찾기 추가
        const favorite = new Favorite({ username, p_id, p_name, p_img });
        await favorite.save();
        res.status(201).send("즐겨찾기에 추가되었습니다.");
    } catch (err) {
        console.error("즐겨찾기 추가 오류:", err);
        res.status(500).send("서버 오류");
    }
});

// 즐겨찾기 조회
router.get("/list/:username", async (req, res) => {
    try {
        const favorites = await Favorite.find({ username: req.params.username });
        res.status(200).json(favorites);
    } catch (err) {
        console.error("즐겨찾기 조회 오류:", err);
        res.status(500).send("서버 오류");
    }
});

// 즐겨찾기 삭제
router.delete("/remove", async (req, res) => {
    try {
        const { username, productId: p_id } = req.body;
        await Favorite.deleteOne({ username, p_id });
        res.status(200).send("즐겨찾기에서 제거되었습니다.");
    } catch (err) {
        console.error("즐겨찾기 삭제 오류:", err);
        res.status(500).send("서버 오류");
    }
});

module.exports = router;