const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// MongoDB 연결
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error("Database connection error:", err));

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ type: "application/json; charset=utf-8" }));
app.use(express.urlencoded({ extended: true, charset: "utf-8" }));
app.use("/resized", express.static(path.join(__dirname, "resized")));

// 라우터 연결
const productRoutes = require("./routes/products");
const shoppingCartRoutes = require("./routes/shoppingCart");
const authRoutes = require("./routes/auth");

app.use("/products", productRoutes);
app.use("/shoppingcart", shoppingCartRoutes);
app.use("/auth", authRoutes);

module.exports = app;
