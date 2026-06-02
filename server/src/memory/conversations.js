const { supabase } = require("./supabase");

/**
 * Create a new conversation
 */
async function createConversation(
    userId = "guest",
    title = "New Chat"
) {
    const { data, error } = await supabase
        .from("conversations")
        .insert([
            {
                user_id: userId,
                title
            }
        ])
        .select()
        .single();

    if (error) {
        console.error("Create conversation error:", error);
        throw error;
    }

    return data;
}

/**
 * Add message to conversation
 */
async function addMessage(
    conversationId,
    role,
    content
) {
    const { data, error } = await supabase
        .from("messages")
        .insert([
            {
                conversation_id: conversationId,
                role,
                content
            }
        ])
        .select()
        .single();

    if (error) {
        console.error("Add message error:", error);
        throw error;
    }

    return data;
}

/**
 * Get all messages from conversation
 */
async function getMessages(conversationId) {
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", {
            ascending: true
        });

    if (error) {
        console.error("Get messages error:", error);
        throw error;
    }

    return data || [];
}

/**
 * Get all conversations for user
 */
async function getConversations(
    userId = "guest"
) {
    const { data, error } = await supabase
        .from("conversations")
        .select("id, title, created_at")
        .eq("user_id", userId)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Get conversations error:", error);
        throw error;
    }

    return data || [];
}

module.exports = {
    createConversation,
    addMessage,
    getMessages,
    getConversations
};