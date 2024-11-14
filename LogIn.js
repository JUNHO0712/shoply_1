const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user_id: { // 추가한 필드로 user_id를 ObjectId 형식으로 생성
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
        unique: true
    },
    name: { //유저 정보
        type: String,
        required: [true, "User must have name"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "User must have name"],
        unique: true,
    },
    token: { //유저 id 정보
        type: String,
    },
});
module.exports = mongoose.model("User", userSchema);