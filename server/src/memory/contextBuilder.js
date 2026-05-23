function buildContext(messages) {

    return messages

    .map((msg) => {

        return `${msg.role}: ${msg.content}`;

    })

    .join("\n");
}

module.exports = {
    buildContext
};