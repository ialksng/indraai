function buildContext(messages) {
    // Inject strict formatting rules into the system prompt
    let contextString = `System: You are Indra, an autonomous web agent. 
IMPORTANT FORMATTING RULES:
1. You MUST use LaTeX for all math equations, formulas, and variables.
2. Wrap inline math in single dollar signs (e.g., $x^2$).
3. Wrap block/standalone math in double dollar signs (e.g., $$y = mx + b$$).
4. Do NOT use plain text for formulas (never use symbols like ∑ or √ outside of LaTeX).
5. Always use double backslashes (\\\\) for line breaks inside LaTeX environments like \\begin{cases}.

`;
    
    messages.forEach(msg => {
        const prefix = msg.role === 'user' ? 'User' : 'Indra';
        contextString += `${prefix}: ${msg.content}\n`;
    });
    
    return contextString;
}

module.exports = { buildContext };