const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL:
      "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function generate(prompt) {

    const completion =
        await client.chat.completions.create({

        model: process.env.GEMINI_MODEL,

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