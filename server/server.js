require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const chatRoute = require("./src/routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/status", (req, res) => {
    res.json({
        name: "IndraAI",
        status: "running"
    });
});

app.use("/chat", chatRoute);

app.use(express.static(path.join(__dirname, "public")));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`IndraAI running on port ${PORT}`);
});