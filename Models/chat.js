const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
    
    username: { type: String, required: true },
    message: { type: String },
    chatRoomId: { type: String, required: true },
    image:{ type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Chat ||mongoose.model("Chat", ChatSchema);
