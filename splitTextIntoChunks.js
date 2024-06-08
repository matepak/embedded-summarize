const splitTextIntoChunks = (text, maxChunkSize = 1000) => {
    const words = text.split(' ');
    const chunks = [];
    let currentChunk = [];
    let currentChunkSize = 0;

    for (const word of words) {
        currentChunk.push(word);
        currentChunkSize += word.length + 1;

        if (currentChunkSize >= maxChunkSize) {
            chunks.push(currentChunk.join(' '));
            currentChunk = [];
            currentChunkSize = 0;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }

    return chunks;
}

module.exports = { splitTextIntoChunks };