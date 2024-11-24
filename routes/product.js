const express = require("express");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product"); // Product 모델 가져오기
const router = express.Router();

// 이미지 리사이즈 함수
const resizeImage = async (inputPath, outputPath) => {
    try {
        await sharp(inputPath)
            .resize(300, 300) // 300x300 픽셀로 리사이즈
            .toFile(outputPath);
        console.log(`이미지 리사이즈 완료: ${outputPath}`);
    } catch (error) {
        console.error("이미지 리사이즈 오류:", error.message);
        throw new Error("이미지 리사이즈 중 오류 발생");
    }
};

// 상품 추가
router.post("/", async (req, res) => {
    const { p_id, p_name, p_price, p_imgPath, p_content } = req.body;
    const resizedImgPath = path.join(__dirname, "../resized", `${p_id}.jpg`);
    const imageUrl = `http://localhost:3000/resized/${p_id}.jpg`; // URL 형식으로 저장

    try {
        // 이미지 리사이즈
        await resizeImage(p_imgPath, resizedImgPath);

        // 데이터베이스에 상품 추가
        const product = new Product({ p_id, p_name, p_price, p_img: imageUrl, p_content });
        await product.save();
        res.status(201).json({ message: "상품 추가 성공", product });
    } catch (error) {
        console.error("상품 추가 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 모든 상품 조회
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error("상품 조회 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 상품 ID로 검색
router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findOne({ p_id: id });
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "상품을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("상품 검색 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 상품 상세 페이지 라우터 추가
router.get("/:id/detail", async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findOne({ p_id: id });
        if (product) {
            res.render("product-detail", { product }); // EJS로 렌더링
        } else {
            res.status(404).send("상품을 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("상품 상세 조회 오류:", error);
        res.status(500).send("서버 오류");
    }
});

// 상품 수정
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const product = await Product.findOneAndUpdate({ p_id: id }, updatedData, { new: true });
        if (product) {
            res.status(200).json({ message: "상품 수정 성공", product });
        } else {
            res.status(404).json({ message: "상품을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("상품 수정 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

// 상품 삭제
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findOneAndDelete({ p_id: id });

        if (product) {
            const resizedImgPath = path.join(__dirname, "../resized", `${id}.jpg`);
            if (fs.existsSync(resizedImgPath)) {
                fs.unlinkSync(resizedImgPath);
                console.log(`이미지 파일 삭제됨: ${resizedImgPath}`);
            }
            res.status(200).json({ message: "상품 삭제 성공" });
        } else {
            res.status(404).json({ message: "상품을 찾을 수 없습니다." });
        }
    } catch (error) {
        console.error("상품 삭제 오류:", error);
        res.status(500).json({ message: "서버 오류", error: error.message });
    }
});

module.exports = router;
