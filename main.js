const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8000 });

// userId -> websocket
const users = new Map();

wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            // Register user
            if (data.type === "register") {
                users.set(data.userId, ws);
                ws.userId = data.userId;

                console.log(`User ${data.userId} connected`);

                ws.send(
                    JSON.stringify({
                        type: "system",
                        message: `Welcome User ${data.userId}`
                    })
                );

                return;
            }

            // Personal message
            if (data.type === "message") {
                const receiver = users.get(data.to);

                if (!receiver) {
                    ws.send(
                        JSON.stringify({
                            type: "error",
                            message: `User ${data.to} is offline`
                        })
                    );
                    return;
                }

                receiver.send(
                    JSON.stringify({
                        type: "message",
                        from: ws.userId,
                        text: data.text
                    })
                );
            }
        } catch (err) {
            console.log(err.message);
        }
    });

    ws.on("close", () => {
        if (ws.userId) {
            users.delete(ws.userId);
            console.log(`User ${ws.userId} disconnected`);
        }
    });
});

console.log("Server running on ws://localhost:8000");