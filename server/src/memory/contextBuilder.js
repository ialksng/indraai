/**
 * Transforms Supabase message records into the standard array format 
 * expected by most modern LLM APIs (Ollama, Groq, OpenRouter).
 */
function buildContext(messages) {
    if (!messages || messages.length === 0) {
        return [];
    }

    const systemPrompt = {
        role: "system",
        content: "You are Indra, an advanced AI Platform. You are helpful, concise, and highly capable. IMPORTANT: You must always format mathematical formulas, equations, and variables using standard LaTeX markdown. Use single $ for inline math (e.g., $E=mc^2$) and double $$ for block equations."
    };

    const formattedMessages = messages.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : msg.role,
        content: msg.content
    }));

    return [systemPrompt, ...formattedMessages];
}

module.exports = {
    buildContext
};