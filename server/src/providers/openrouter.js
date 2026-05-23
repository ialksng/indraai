const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
});

async function generate(prompt) {

    const completion =
        await client.chat.completions.create({

        model: process.env.OPENROUTER_MODEL,

        messages: [
            {
                role: "user",
                content: prompt
            }
        ]
    });

    return completion
        .choices[0]
        .message.content;
}

module.exports = {
    generate
};