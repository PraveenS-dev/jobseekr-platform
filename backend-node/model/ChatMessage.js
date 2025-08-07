const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },

    // 1 = sent, 2 = delivered, 3 = read
    status: { type: Number, enum: [1, 2, 3], default: 1 },
    trash: {
        type: String,
        default: "NO"
    },
});

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);
