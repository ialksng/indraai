const ollama =
    require("../providers/ollama");

const groq =
    require("../providers/groq");

const gemini =
    require("../providers/gemini");

const openrouter =
    require("../providers/openrouter");

const huggingface =
    require("../providers/huggingface");

async function generate(prompt, mode) {

    // ⚡ FAST
    if (mode === "fast") {

        try {

            console.log(
                "FAST → Local Fast Model 1"
            );

            return await ollama.generate(
                process.env.OLLAMA_MODEL_FAST1,
                prompt
            );

        } catch (err1) {

            console.log(
                "FAST1 failed → trying FAST2"
            );

            try {

                return await ollama.generate(
                    process.env.OLLAMA_MODEL_FAST2,
                    prompt
                );

            } catch (err2) {

                console.log(
                    "FAST2 failed → using Groq"
                );

                return await groq.generate(prompt);

            }
        }
    }

    // 🧠 SMART
    if (mode === "smart") {

        try {

            console.log(
                "SMART → Local Llama3"
            );

            return await ollama.generate(
                process.env.OLLAMA_MODEL_SMART,
                prompt
            );

        } catch (err1) {

            console.log(
                "Llama3 failed → trying Gemini"
            );

            try {

                return await gemini.generate(prompt);

            } catch (err2) {

                console.log(
                    "Gemini failed → trying OpenRouter"
                );

                try {

                    return await openrouter.generate(prompt);

                } catch (err3) {

                    console.log(
                        "OpenRouter failed → trying HuggingFace"
                    );

                    return await huggingface.generate(prompt);

                }
            }
        }
    }

    // DEFAULT
    return await ollama.generate(
        process.env.OLLAMA_MODEL_SMART,
        prompt
    );
}

module.exports = {
    generate
};