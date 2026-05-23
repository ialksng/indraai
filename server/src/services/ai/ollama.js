const axios = require("axios");

const OLLAMA_URL =
    process.env.OLLAMA_URL;

async function generate(model, prompt) {

    const response = await axios.post(
        `${OLLAMA_URL}/api/generate`,
        {
            model,
            prompt,
            stream: false
        }
    );

    return response.data.response;
}

module.exports = {
    generate
};