import { io } from "socket.io-client";

const userId = process.argv[2]; // node client.js user1

if (!userId) {
    console.log("Usage: node client.js <userId>");
    process.exit(1);
}

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log(`Connected as ${userId}`);
    console.log(`Socket ID: ${socket.id}`);

    socket.emit("register", userId);
});

socket.on("receive_message", (data) => {
    console.log("\n📩 New Message");
    console.log(`From: ${data.senderId}`);
    console.log(`Message: ${data.message}`);
});

socket.on("error_message", (msg) => {
    console.log("❌", msg);
});

// Send a message from terminal
process.stdin.on("data", (data) => {
    const input = data.toString().trim();

    // Format:
    // receiverId:message
    const [receiverId, ...messageParts] = input.split(":");

    const message = messageParts.join(":");

    if (!receiverId || !message) {
        console.log("Format: receiverId:message");
        return;
    }

    socket.emit("private_message", {
        senderId: userId,
        receiverId,
        message,
    });
});