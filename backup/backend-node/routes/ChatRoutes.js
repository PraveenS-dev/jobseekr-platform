const express = require("express");
const ChatMessage = require("../model/ChatMessage");
const router = express.Router();

// Get chat history between two users
router.get("/:user1/:user2", async (req, res) => {
    const { user1, user2 } = req.params;

    try {
        const messages = await ChatMessage.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ timestamp: 1 }); // oldest first

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching chat history" });
    }
});

router.get("/user/getMessageUserList/:userId", async (req, res) => {
    const userId = String(req.params.userId);

    try {
        const latestChats = await ChatMessage.aggregate([
            { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
            {
                $addFields: {
                    otherUserId: {
                        $cond: [
                            { $eq: ["$senderId", userId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    }
                }
            },
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$otherUserId",
                    latestMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiverId", userId] },
                                        { $lt: ["$status", 3] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { "latestMessage.timestamp": -1 } }
        ]);

        res.json(latestChats);
    } catch (err) {
        console.error("Error fetching chat list:", err);
        res.status(500).json({ error: "Error fetching chat list" });
    }
});
// ✅ Mark messages as read
router.post("/markAsRead", async (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
        await ChatMessage.updateMany(
            { senderId, receiverId, status: { $lt: 3 } },
            { $set: { status: 3 } }
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Error marking as read:", err);
        res.status(500).json({ error: "Error marking messages as read" });
    }
});


module.exports = router;
