const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "사용자 이름이 필요합니다."],
        unique: true,
        maxlength: 255
    },
    email: {
        type: String,
        required: [true, "이메일이 필요합니다."],
        unique: true, // 이메일 중복 불가
        match: [/^\S+@\S+\.\S+$/, "유효한 이메일 형식이 아닙니다."],
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        maxlength: 255
    },
    token: {
        type: String
    }
}, { timestamps: true });

// 이미 정의된 모델이 있으면 해당 모델 사용, 없으면 새로 정의
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
