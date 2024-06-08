// File: openai.js
const OpenAIApi = require('openai')
const async = require('async')
const { encoding_for_model } = require('tiktoken')

const openai = new OpenAIApi({
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
})

async function getAvailableModels() {
    try {
        const response = await openai.models.list()
        return response.data.map((model) => model.id)
    } catch (error) {
        console.error('Error fetching available models:', error)
        throw error
    }
}

async function callOpenAI(model, input, type, additionalParams = {}) {
    const validModels = await getAvailableModels()
    if (!validModels.includes(model)) {
        throw new Error(
            `Invalid model ID: ${model}. Please use one of the following valid models: ${validModels.join(
                ', '
            )}`
        )
    }

    try {
        if (type === 'embedding') {
            const response = await openai.embeddings.create({
                input: input,
                model: model,
                ...additionalParams,
            })
            return response.data.map((data) => data.embedding)
        } else if (type === 'completion') {
            const response = await openai.chat.completions.create({
                model: model,
                messages: input,
                ...additionalParams,
            })
            return response.choices[0].message.content.trim()
        } else {
            throw new Error('Invalid type for OpenAI call')
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.error('Invalid model ID or parameters:', error.response.data)
        } else {
            console.error('Error calling OpenAI API:', error.message)
        }
        throw error
    }
}

async function getEmbeddings(
    textChunks,
    batchSize = 5,
    model = 'text-embedding-ada-002'
) {
    const embeddings = []
    const batches = []

    // Create batches of text chunks
    for (let i = 0; i < textChunks.length; i += batchSize) {
        const batch = textChunks.slice(i, i + batchSize)
        batches.push(batch)
    }

    // Process each batch in parallel with a limit
    await async.eachLimit(batches, 5, async (batch) => {
        const batchEmbeddings = await callOpenAI(model, batch, 'embedding')
        embeddings.push(...batchEmbeddings)
    })

    return embeddings
}

async function summarizeChunks(chunks, options = {}) {
    const {
        model = 'gpt-3.5-turbo',
        messages = [
            { role: 'system', content: 'You are a helpful assistant.' },
            {
                role: 'user',
                content: 'Summarize the following text:\n\n',
            },
        ],
        max_tokens = 500,
        temperature = 0.2,
    } = options

    try {
        const summaries = await async.mapLimit(chunks, 5, async (chunk) => {
            const completeMessages = [
                ...messages,
                { role: 'user', content: messages[1].content + chunk },
            ]
            return await callOpenAI(model, completeMessages, 'completion', {
                max_tokens,
                temperature,
            })
        })
        return summaries
    } catch (error) {
        console.error('Error summarizing chunks:', error)
        throw error
    }
}

module.exports = { getEmbeddings, summarizeChunks, getAvailableModels }
