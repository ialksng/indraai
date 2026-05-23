const ollama =
    require("../services/ai/ollama");

const groq =
    require("../services/ai/groq");

const gemini =
    require("../services/ai/gemini");

const openrouter =
    require("../services/ai/openrouter");

const huggingface =
    require("../services/ai/huggingface");

async function generate(prompt, mode) {

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

                return await groq.generate(
                    prompt
                );
            }
        }
    }

    try {

        return await ollama.generate(
            process.env.OLLAMA_MODEL_SMART,
            prompt
        );

    } catch {

        try {

            return await gemini.generate(
                prompt
            );

        } catch {

            try {

                return await openrouter.generate(
                    prompt
                );

            } catch {

                return await huggingface.generate(
                    prompt
                );
            }
        }
    }
}

async function stream(
    prompt,
    mode,
    onToken
) {

    try {

        return await ollama.stream(
            mode === "fast"
                ? process.env.OLLAMA_MODEL_FAST1
                : process.env.OLLAMA_MODEL_SMART,
            prompt,
            onToken
        );

    } catch {

        const text =
            await generate(prompt, mode);

        onToken(text);

        return text;
    }
}

module.exports = {
    generate,
    stream
};