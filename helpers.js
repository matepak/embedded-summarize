function cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, value, index) => sum + value * b[index], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

function identifyImportantChunks(textChunks, embeddings, topN = 5) {
    const documentEmbedding = embeddings.reduce((sum, emb) =>
        sum.map((v, i) => v + emb[i]), new Array(embeddings[0].length).fill(0))
        .map(v => v / embeddings.length);

    const similarities = embeddings.map(embedding => cosineSimilarity(embedding, documentEmbedding));
    const importantIndices = similarities.map((similarity, index) => ({ similarity, index }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topN)
        .map(obj => obj.index);

    return importantIndices.map(index => textChunks[index]);
}

function combineSummaries(summaries) {
    return summaries.join(' ');
}

module.exports = { identifyImportantChunks, combineSummaries }