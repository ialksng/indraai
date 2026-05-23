const ollama =
    require("../providers/ollama");

const groq =
    require("../providers/groq");

const gemini =
    require("../providers/gemini");

const openrouter =
    require("../providers/openrouter");

async function generate(prompt, mode) {

    // ⚡ FAST
    if (mode === "fast") {

        try {

            return await ollama.generate(
                process.env.OLLAMA_MODEL_FAST1,
                prompt
            );

        } catch {

            try {

                return await ollama.generate(
                    process.env.OLLAMA_MODEL_FAST2,
                    prompt
                );

            } catch {

                return await groq.generate(prompt);

            }
        }
    }

    // 🧠 SMART
    if (mode === "smart") {

        try {

            return await ollama.generate(
                process.env.OLLAMA_MODEL_SMART,
                prompt
            );

        } catch {

            try {

                return await gemini.generate(prompt);

            } catch {

                return await openrouter.generate(prompt);

            }
        }
    }

    return await ollama.generate(
        process.env.OLLAMA_MODEL_SMART,
        prompt
    );
}

module.exports = {
    generate
};