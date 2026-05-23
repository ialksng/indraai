require("dotenv").config();

const express = require("express");
const cors = require("cors");

const chatRoute = require("./src/routes/chat");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.get("/", (req, res) => {

    res.json({
        name: "IndraAI",
        status: "running"
    });

});

app.use("/chat", chatRoute);

app.listen(process.env.PORT, () => {

    console.log(
        `IndraAI running on port ${process.env.PORT}`
    );

});