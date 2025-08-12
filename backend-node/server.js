const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const formidable = require('express-formidable');
const http = require('http');
const { Server } = require('socket.io');
const ChatMessage = require('./model/ChatMessage');

dotenv.config();
db.connectDB();

const app = express();

// Middlewares
app.use(formidable());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/company', require('./routes/CompanyRoutes'));
app.use('/api/Jobs', require('./routes/JobsRoutes'));
app.use('/api/profileViewCount', require('./routes/ProfileViewCountRoutes'));
app.use('/api/chat', require('./routes/ChatRoutes'));

app.use('/uploads', express.static('uploads'));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let onlineUsers = {};

// Socket.io events
io.on("connection", (Socket) => {
    console.log("User connected", Socket.id);

    Socket.on("join", (userId) => {
        onlineUsers[userId] = Socket.id;
        console.log("Online Users:", onlineUsers);
        io.emit("onlineUsers", Object.keys(onlineUsers));
    });

    Socket.on("PrivateMsg", async ({ tempId, senderId, receiverId, text }) => {
        try {
            const newMessage = new ChatMessage({
                senderId,
                receiverId,
                text,
                status: 1
            });
            await newMessage.save();

            const receiverSocketId = onlineUsers[receiverId];
            if (receiverSocketId) {
                await ChatMessage.updateOne(
                    { _id: newMessage._id },
                    { $set: { status: 2 } }
                );
                newMessage.status = 2;

                io.to(receiverSocketId).emit("PrivateMsg", {
                    ...newMessage.toObject(),
                    tempId: tempId || null
                });
            }

            io.to(Socket.id).emit("PrivateMsg", {
                ...newMessage.toObject(),
                tempId: tempId || null
            });
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    Socket.on("typing", ({ senderId, receiverId, isTyping }) => {
        const receiverSocketId = onlineUsers[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", { senderId, isTyping });
        }
    });

    Socket.on("markAsRead", async ({ senderId, receiverId }) => {
        try {
            await ChatMessage.updateMany(
                {
                    senderId,
                    receiverId,
                    status: { $lt: 3 }
                },
                { $set: { status: 3 } }
            );

            const senderSocketId = onlineUsers[senderId];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesRead", { readerId: receiverId });
            }
        } catch (err) {
            console.error("Error marking messages as read:", err);
        }
    });

    Socket.on("disconnect", () => {
        const userId = Object.keys(onlineUsers).find(
            key => onlineUsers[key] === Socket.id
        );
        if (userId) {
            delete onlineUsers[userId];
            console.log(`User ${userId} disconnected`);
        }
        io.emit("onlineUsers", Object.keys(onlineUsers));
    });
});

app.post("/send-notification", (req, res) => {
    const { id, sender_id, assign_person_ids, title, message, url, created_at } = req.fields;

    const recipients = Array.isArray(assign_person_ids) ? assign_person_ids : [assign_person_ids];

    recipients.forEach(userId => {
        const socketId = onlineUsers[userId];
        if (socketId) {
            io.to(socketId).emit("notification", { id, title, message, url, created_at });
            console.log(`Sent notification to ${userId}`);
        }
    });

    res.json({ success: true });
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
    console.log(`Server running on port ${PORT} with Socket.io enabled!`)
);
