const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// Product 모델 가져오기
const Product = require("./models/Product");

const app = express();

// EJS 설정
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB 연결
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error("Database connection error:", err));

// 정적 파일 제공 (resized 폴더 사용)
app.use("/resized", express.static(path.join(__dirname, "resized")));

app.use((req, res, next) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    next();
});

// 홈 경로 설정
app.get("/", async (req, res) => {
    try {
        // MongoDB에서 상품 데이터 가져오기
        const products = await Product.find(); // 모든 상품 가져오기
        res.render("product", { products }); // EJS 템플릿으로 렌더링
    } catch (error) {
        console.error("상품 조회 오류:", error.message);
        res.status(500).send("서버 오류");
    }
});

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ type: "application/json; charset=utf-8" }));
app.use(express.urlencoded({ extended: true, charset: "utf-8" }));

// 라우터 연결
const productRoutes = require("./routes/product");
const shoppingCartRoutes = require("./routes/shoppingcart");
const authRoutes = require("./routes/auth");

app.use("/product", productRoutes);
app.use("/shoppingcart", shoppingCartRoutes);
app.use("/auth", authRoutes);

module.exports = app;
