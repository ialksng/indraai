const express = require("express");

const router = express.Router();

const ai =
    require("../router/router");

router.post("/", async (req, res) => {

    try {

        const {
            prompt,
            mode = "smart"
        } = req.body;

        if (!prompt) {

            return res.status(400).json({
                success: false,
                error: "Prompt required"
            });
        }

        const response =
            await ai.generate(
                prompt,
                mode
            );

        res.json({
            success: true,
            mode,
            response
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: "AI failed"
        });

    }

});

module.exports = router;