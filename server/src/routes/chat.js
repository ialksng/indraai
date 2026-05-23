const express = require("express");

const router = express.Router();

const ai =
    require("../router/router");

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

        if (!conversationId) {

            const conversation =
                await createConversation();

            conversationId =
                conversation.id;
        }

        await addMessage(
            conversationId,
            "user",
            prompt
        );

        const messages =
            await getMessages(
                conversationId
            );

        const context =
            buildContext(messages);

        res.writeHead(200, {
            "Content-Type":
                "text/event-stream",
            "Cache-Control":
                "no-cache",
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

module.exports = router;