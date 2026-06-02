const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

async function generate(prompt) {

    const messagesPayload = Array.isArray(prompt) 
        ? prompt 
        : [{ role: "user", content: String(prompt) }];

    try {
        const completion = await client.chat.completions.create({
            model: process.env.GROQ_MODEL, 
            messages: messagesPayload
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Groq Generation Error:", error);
        throw error;
    }
}

module.exports = {
    generate
};