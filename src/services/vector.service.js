import { Pinecone } from '@pinecone-database/pinecone'

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const cohortchatgptindex = pc.Index('cohort-cahtgpt');

export const createMemory = async ({ vectors, metadata, messageId }) => {
    await cohortchatgptindex.upsert([
        {
            id: messageId,
            values: vectors,
            metadata
        }
    ])
}

export const queryMemory = async ({ queryvector, limit = 5, metadata }) => {
    const data = await cohortchatgptindex.query({
        vector: queryvector,
        topK: limit,
        filter: metadata ? { metadata } : "undefined",
        includeMetadata: true
    })

    return data.matches;
}