const {
    InferenceClient
} = require("@huggingface/inference");

const client =
    new InferenceClient(
        process.env.HUGGINGFACE_API_KEY
    );

async function generate(prompt) {

    const result =
        await client.chatCompletion({

        provider: "hf-inference",

        model: process.env.HF_MODEL,

        messages: [
            {
                role: "user",
                content: prompt
            }
        ],

        max_tokens: 512
    });

    return result
        .choices[0]
        .message.content;
}

module.exports = {
    generate
};