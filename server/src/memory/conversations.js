const supabase =
    require("../services/supabase");

async function createConversation(
    userId = "guest"
) {

    const {
        data,
        error
    } = await supabase

    .from("conversations")

    .insert([
        {
            user_id: userId,
            title: "New Chat"
        }
    ])

    .select()

    .single();

    if (error) throw error;

    return data;
}

async function addMessage(
    conversationId,
    role,
    content
) {

    const {
        error
    } = await supabase

    .from("messages")

    .insert([
        {
            conversation_id:
                conversationId,

            role,

            content
        }
    ]);

    if (error) throw error;
}

async function getMessages(
    conversationId
) {

    const {
        data,
        error
    } = await supabase

    .from("messages")

    .select("*")

    .eq(
        "conversation_id",
        conversationId
    )

    .order(
        "created_at",
        { ascending: true }
    );

    if (error) throw error;

    return data;
}

module.exports = {
    createConversation,
    addMessage,
    getMessages
};