const WebSocket = require("ws");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter your User ID: ", (userId) => {

    const socket = new WebSocket("ws://localhost:8000");

    socket.on("open", () => {
        console.log("Connected to server");
        console.log(userId, "is connecting...");
        // Register user
        socket.send(
            JSON.stringify({
                type: "register",
                userId
            })
        );

        console.log(`
Connected as User ${userId}

Format:
receiverId:message

Example:
2:Hello Rahul
3:How are you?
        `);

        rl.on("line", (input) => {

            const [to, ...messageParts] = input.split(":");

            const text = messageParts.join(":");

            if (!to || !text) {
                console.log("Use: receiverId:message");
                return;
            }

            socket.send(
                JSON.stringify({
                    type: "message",
                    to,
                    text
                })
            );
        });
    });

    socket.on("message", (message) => {

        const data = JSON.parse(message);

        if (data.type === "message") {
            console.log(`\nUser ${data.from}: ${data.text}`);
        } else {
            console.log(`\n${data.message}`);
        }
    });

    socket.on("close", () => {
        console.log("Disconnected");
    });
});