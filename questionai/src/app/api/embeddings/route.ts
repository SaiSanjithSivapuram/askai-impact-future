import { InferenceClient } from "@huggingface/inference";
import { Pinecone } from "@pinecone-database/pinecone";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

const recipiesData = [
    {
        id: "1",
        text: "Apple pie is a traditional American dessert featuring spiced apple filling encased in a flaky, buttery crust. It's often served warm with a scoop of vanilla ice cream during holidays like Thanksgiving."
    },
    {
        id: "2",
        text: "Biryani is a fragrant South Asian rice dish made by layering marinated meat, basmati rice, and saffron. It's cooked slowly and often served with raita or boiled eggs for a festive meal."
    },
    {
        id: "3",
        text: "Sushi is a Japanese delicacy made with vinegared rice combined with raw or cooked seafood, vegetables, and occasionally tropical fruits. It's typically accompanied by soy sauce, wasabi, and pickled ginger."
    },
    {
        id: "4",
        text: "Lasagna is a classic Italian comfort food consisting of layered sheets of pasta, rich meat sauce, béchamel, and melted mozzarella, baked to perfection."
    },
    {
        id: "5",
        text: "Tacos are a traditional Mexican street food made with small corn or flour tortillas filled with seasoned meat, fresh salsa, and lime juice. Variants include al pastor, carnitas, and fish tacos."
    },
    {
        id: "6",
        text: "Ratatouille is a French Provençal stewed vegetable dish made with eggplant, zucchini, bell peppers, and tomatoes, seasoned with herbs like thyme and rosemary. It's both hearty and vegan-friendly."
    },
    {
        id: "7",
        text: "Fried rice is a staple of Chinese cuisine, combining cooked rice stir-fried with scrambled eggs, vegetables, soy sauce, and often bits of meat or shrimp. It's quick, satisfying, and highly customizable."
    },
    {
        id: "8",
        text: "Butter chicken, or murgh makhani, is a North Indian curry dish made with tender chicken simmered in a creamy tomato sauce, seasoned with fenugreek and garam masala. Best served with naan or rice."
    },
    {
        id: "9",
        text: "Pho is a Vietnamese soup featuring a fragrant broth made from simmered beef bones, rice noodles, thinly sliced meat, and fresh herbs like cilantro and Thai basil. It's often eaten for breakfast in Vietnam."
    },
    {
        id: "10",
        text: "Clam chowder is a rich, creamy soup popular in New England, made with clams, potatoes, onions, and bacon. It's traditionally served in a sourdough bread bowl."
    }
]

const getEmbedding = async (text: string): Promise<number[]> => {
    const response = await axios.post(
        `https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2`,
        { inputs: text },
        {
            headers: {
                Authorization: `Bearer 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`,
            },
        }
    );

    return response.data
};

const uploadToPinecone = async () => {
    const pinecone = new Pinecone({
        apiKey: "pcsk_fhnt7_Hofin8horJdaNfnkzdeKiH6b3qyWN3X53CTG9uwZvPYmYQqkkBgaRYrVrxXAbe7",
    });

    const index = pinecone.Index("qa-index");

    for (const doc of recipiesData) {
        try {
            const vector = await getEmbedding(doc.text);
            await index.upsert([
                {
                    id: doc.id,
                    values: vector,
                    metadata: { text: doc.text },
                },
            ]);
            console.log(`Uploaded doc ${doc.id}`);
        } catch (err) {
            console.error(`Failed for ${doc.id}`, err);
        }
        // break
    }
};

export async function GET(req: NextRequest, res: NextResponse) {
    try {
        await uploadToPinecone();
        console.log("In Embeddings API")
        return NextResponse.json({
            message: "In Embeddings API"
        })
    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({
            message: "Place Name is required",
            status: 500,
        })
    }
}