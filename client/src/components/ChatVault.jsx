// const express = require("express");
const router = express.Router();

// const ai = require("../");

// const {
//     createConversation,
//     addMessage,
//     getMessages,
//     getConversations 
// } = require("../memory/conversations");

// const {
//     buildContext
// } = require("../memory/contextBuilder");

// ==========================================
// 1. MAIN CHAT STREAMING ROUTE
// ==========================================
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

        if (!conversationId) {
            const conversation = await createConversation();
            conversationId = conversation.id;
        }

        await addMessage(
            conversationId,
            "user",
            prompt
        );

        const messages = await getMessages(
            conversationId
        );

        const context = buildContext(messages);

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
        });

        let finalResponse = "";

        await ai.stream(
            context,
            mode,
            (token) => {
                finalResponse += token;
                res.write(
                    `data: ${JSON.stringify({
                        token
                    })}\n\n`
                );
            }
        );

        await addMessage(
            conversationId,
            "assistant",
            finalResponse
        );

        res.write(
            `data: ${JSON.stringify({
                done: true,
                conversationId
            })}\n\n`
        );

        res.end();

    } catch (err) {
        console.error(err);
        res.end();
    }
});

// ==========================================
// 2. VAULT ROUTES (NEW)
// ==========================================

// Fetch all past conversations for the Vault menu
router.get("/history/:userId", async (req, res) => {
    try {
        const userId = req.params.userId || "guest";
        const history = await getConversations(userId);
        res.json({ success: true, history });
    } catch (error) {
        console.error("Vault Error:", error);
        res.status(500).json({ success: false, error: "Failed to load vault" });
    }
});

// Fetch specific messages when a user clicks a chat in the Vault
router.get("/history/messages/:conversationId", async (req, res) => {
    try {
        const messages = await getMessages(req.params.conversationId);
        res.json({ success: true, messages });
    } catch (error) {
        console.error("Vault Messages Error:", error);
        res.status(500).json({ success: false, error: "Failed to load messages" });
    }
});

module.exports = router;