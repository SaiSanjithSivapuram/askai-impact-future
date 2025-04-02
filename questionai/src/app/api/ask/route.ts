import { Pinecone } from "@pinecone-database/pinecone";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const getEmbedding = async (text: string): Promise<number[]> => {
    const response = await axios.post(
        "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
        { inputs: text },
        {
            headers: {
                Authorization: `Bearer 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`,
            },
        }
    );

    return response.data;
};

const summarize = async (text: string): Promise<string> => {
    const response = await axios.post(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        { inputs: text },
        {
            headers: {
                Authorization: `Bearer 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`,
            },
        }
    );

    console.log("Summarize", response.data)
    return response.data[0]?.summary_text ?? text;
};

const searchWeb = async (query: string): Promise<string> => {
    const res = await axios.get("https://api.duckduckgo.com", {
        params: {
            q: query,
            format: "json",
            no_redirect: 1,
        },
    });

    console.log(res.data)

    return res.data.RelatedTopics[0]?.Text || "No relevant info found on the web.";
};

export async function POST(req: NextRequest, res: NextResponse) {

    try {
        if (req.method !== "POST") {
            return NextResponse.json({
                status: 405
            });
        }

        const body: any = await req.json();
        const question = body?.question
        console.log("Question", question)
        const vector = await getEmbedding(question);

        const pinecone = new Pinecone({ apiKey: "pcsk_fhnt7_Hofin8horJdaNfnkzdeKiH6b3qyWN3X53CTG9uwZvPYmYQqkkBgaRYrVrxXAbe7" });
        const index = pinecone.Index("qa-index");

        const result = await index.query({
            vector,
            topK: 1,
            includeMetadata: true,
        });

        console.log("Result", result.matches[0])
        const topMatch: any = result.matches[0];

        if (topMatch?.score > 0.5) {
            const summary = await summarize(topMatch.metadata?.text || "");
            // console.log("Summary", summary)
            return NextResponse.json({
                message: summary,
                status: 200
            });
        } else {
            const webText = await searchWeb(question);
            const summary = await summarize(webText);
            return NextResponse.json({
                message: summary,
                status: 200
            });
        }
    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({
            message: "Something went wrong.",
            status: 500
        })
    }
}