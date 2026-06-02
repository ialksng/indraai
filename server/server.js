require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const chatRoute = require("./src/routes/chat");
// ADDED: Import the auth route
const authRoute = require("./src/routes/auth"); 

const app = express();

app.use(cors());
app.use(express.json());

// Mount the routes
app.use("/api/v1/indra/chat", chatRoute);
// ADDED: Mount the auth route so the frontend can reach it
app.use("/api/v1/auth", authRoute); 

app.get("/api/status", (req, res) => {
    res.json({
        name: "IndraAI",
        status: "running"
    });
});

app.use(express.static(path.join(__dirname, "public")));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`IndraAI running on port ${PORT}`);
});