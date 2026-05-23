const API_URL =
    import.meta.env.VITE_API_URL;

export async function sendMessage(
    prompt,
    mode = "smart"
) {

    const response =
        await fetch(`${API_URL}/chat`, {

        method: "POST",

        headers: {
            "Content-Type":
                "application/json"
        },

        body: JSON.stringify({
            prompt,
            mode
        })
    });

    return await response.json();
}