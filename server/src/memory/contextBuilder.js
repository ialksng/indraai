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
        content: "You are Indra, an advanced AI Cloud Intelligence Platform. You are helpful, concise, and highly capable."
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