const axios = require("axios");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

async function generate(model, prompt) {
    // 1. Ensure prompt is an array of messages
    const messages = Array.isArray(prompt) ? prompt : [{ role: "user", content: String(prompt) }];

    const response = await axios.post(
        `${OLLAMA_URL}/api/chat`, // FIXED: Changed from /generate to /chat
        {
            model,
            messages, // FIXED: Sending messages array instead of a string prompt
            stream: false,
            options: {
                temperature: 0.7,
                num_ctx: 2048,
                num_predict: 300
            }
        },
        {
            timeout: 15000
        }
    );

    // FIXED: /api/chat returns response.data.message.content
    return response.data.message.content; 
}

async function stream(model, prompt, onToken) {
    // 1. Ensure prompt is an array of messages
    const messages = Array.isArray(prompt) ? prompt : [{ role: "user", content: String(prompt) }];

    const response = await axios({
        method: "post",
        url: `${OLLAMA_URL}/api/chat`, // FIXED: Changed from /generate to /chat
        responseType: "stream",
        data: {
            model,
            messages, // FIXED: Sending messages array
            stream: true,
            options: {
                temperature: 0.7,
                num_ctx: 2048,
                num_predict: 300
            }
        },
        timeout: 30000
    });

    return new Promise((resolve, reject) => {
        let finalText = "";

        response.data.on("data", (chunk) => {
            const lines = chunk
                .toString()
                .split("\n")
                .filter(Boolean);

            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);

                    // FIXED: /api/chat streams parsed.message.content
                    if (parsed.message && parsed.message.content) {
                        finalText += parsed.message.content;
                        onToken(parsed.message.content);
                    }

                    if (parsed.done) {
                        resolve(finalText);
                    }

                } catch (err) {}
            }
        });

        response.data.on("error", reject);
    });
}

module.exports = {
    generate,
    stream
};