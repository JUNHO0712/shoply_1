const express = require("express");
const Favorite = require("../models/favorite");
const router = express.Router();

// 즐겨찾기 추가
router.post("/add", async (req, res) => {
    try {
        const { username, productId, productName, productImage } = req.body;

        // 중복 확인
        const existingFavorite = await Favorite.findOne({ username, productId });
        if (existingFavorite) {
            return res.status(400).send("이미 즐겨찾기에 추가된 상품입니다.");
        }

        const newFavorite = new Favorite({
            username,
            productId,
            productName,
            productImage,
        });

        await newFavorite.save();
        res.status(201).send("즐겨찾기에 추가되었습니다.");
    } catch (err) {
        console.error(err);
        res.status(500).send("서버 오류");
    }
});

// 즐겨찾기 조회
router.get("/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const favorites = await Favorite.find({ username});

        res.status(200).json(favorites);
    } catch (err) {
        console.error(err);
        res.status(500).send("서버 오류");
    }
});

// 즐겨찾기 삭제
router.delete("/remove", async (req, res) => {
    try {
        const { username, productId } = req.body;

        await Favorite.deleteOne({username, productId });
        res.status(200).send("즐겨찾기에서 제거되었습니다.");
    } catch (err) {
        console.error(err);
        res.status(500).send("서버 오류");
    }
});

module.exports = router;