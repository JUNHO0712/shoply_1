const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// Product 모델 가져오기
const Product = require("./models/Product");

const app = express();

// MongoDB 연결
mongoose
    .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("Connected to database");

        // 테스트: sneakers_1 상품 찾기
        try {
            const product = await Product.findOne({ p_id: "sneakers_1" });

            if (product) {
                console.log("상품 정보:", product);
            } else {
                console.log("상품을 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error("상품 검색 오류:", error.message);
        }
    })
    .catch((err) => console.error("Database connection error:", err));

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ type: "application/json; charset=utf-8" }));
app.use(express.urlencoded({ extended: true, charset: "utf-8" }));
app.use("/resized", express.static(path.join(__dirname, "resized")));

// 라우터 연결
const productRoutes = require("./routes/product");
const shoppingCartRoutes = require("./routes/shoppingcart");
const authRoutes = require("./routes/auth");

app.use("/product", productRoutes);
app.use("/shoppingcart", shoppingCartRoutes);
app.use("/auth", authRoutes);

module.exports = app;
