const axios = require("axios");

const OLLAMA_URL =
    process.env.OLLAMA_URL ||
    "http://localhost:11434";

async function generate(model, prompt) {

    const response = await axios.post(
        `${OLLAMA_URL}/api/generate`,
        {
            model,
            prompt,
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

    return response.data.response;
}

async function stream(model, prompt, onToken) {

    const response = await axios({
        method: "post",
        url: `${OLLAMA_URL}/api/generate`,
        responseType: "stream",
        data: {
            model,
            prompt,
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

                    const parsed =
                        JSON.parse(line);

                    if (parsed.response) {

                        finalText +=
                            parsed.response;

                        onToken(parsed.response);
                    }

                    if (parsed.done) {
                        resolve(finalText);
                    }

                } catch (err) {}
            }
        });

        response.data.on(
            "error",
            reject
        );
    });
}

module.exports = {
    generate,
    stream
};