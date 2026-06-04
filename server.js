import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { fetchUserFromDb } from "./utils.js";
import { createUser } from "./utils.js";

const app = express();
const port = 3000;

// Parse JSON request bodies
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/signup", (req, res) => {
    // Here you would normally handle user registration logic
    if (req.body) {
        createUser(req.body).then((user) => {
            console.log("User created:", user);
        }).catch((error) => {
            console.error("Error creating user:", error);
        });
        console.log("User data:", req.body);
    }
    res.json({ message: "User registered successfully!" });
});

app.post("/login-with-access-token", (req, res) => {
    const headers = req.headers;

    if (headers.accessToken) {
        const decoded = jwt.verify(headers.accessToken, "access_secret");
        return res.json({ message: "Token is valid", user: decoded });
    }

    res.status(401).json({ message: "Access token is required" });
});

app.post("/login", (req, res) => {
    
    const payload = req.body; 
    const headers = req.headers;

    fetchUserFromDb(payload.email, payload.password)
        .then((user) => {
            if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
            }
            
        payload.id = user.id; 
        payload.name = user.name; 
        payload.phone = user.phone; 
        const accessToken = jwt.sign(
            payload,
            "access_secret",
            { expiresIn: "1m" }
        );

        const refreshToken = jwt.sign(
            payload,
            "refresh_secret",
            { expiresIn: "4m" }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
        });

        res.json({
            accessToken,
            refreshToken
        });
        })
        .catch((error) => {
            console.error("Error during login:", error);
            res.status(500).json({ message: "Internal server error" });
        });
});

app.post("/refresh-token", (req, res) => {
    const { refreshToken } = req.body.refreshToken ? req.body : req.cookies;

    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
    }

    try {
        const decoded = jwt.verify(refreshToken, "refresh_secret");
        const newAccessToken = jwt.sign(
            { id: decoded.id, name: decoded.name, phone: decoded.phone },
            "access_secret",
            { expiresIn: "10m" }
        );
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(401).json({ message: "Invalid refresh token" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});