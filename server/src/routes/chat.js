const express = require("express");
const router = express.Router();
const ai = require("../router/router");

const {
    createConversation,
    addMessage,
    getMessages
} = require("../memory/conversations");

const {
    buildContext
} = require("../memory/contextBuilder");

router.post("/", async (req, res) => {
    try {
        let {
            prompt,
            mode = "smart",
            conversationId
        } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: "Prompt required"
            });
        }

        // Create new conversation
        if (!conversationId) {
            const conversation = await createConversation();
            conversationId = conversation.id;
        }

        // Save user message
        await addMessage(
            conversationId,
            "user",
            prompt
        );

        // Get old messages
        const messages = await getMessages(conversationId);

        // Build AI context
        const context = buildContext(messages);

        // Generate AI response
        const response = await ai.generate(context, mode);

        // Save AI message
        await addMessage(
            conversationId,
            "assistant",
            response
        );

        res.json({
            success: true,
            conversationId,
            mode,
            response
        });

    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({
            success: false,
            error: "AI failed"
        });
    }
});

module.exports = router;