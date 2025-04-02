'use client'

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {

  const [loading, setLoading] = useState(false)
  const [text, setText] = useState("");
  const [conversation, setConversation] = useState<any[]>([])

  // const storeEmbeddings = async () => {
  //   const res = await fetch("/api/embeddings", {
  //     headers: { "Content-Type": "application/json" },
  //   });
  // }

  const summarize = async () => {
    setLoading(true)
    let tempConversation = conversation
    console.log(text)
    tempConversation.push({
      text: text,
      type: "question"
    })
    setConversation(tempConversation)
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: text
      })
    });

    const answer = await res.json()
    console.log(answer)

    tempConversation.push({
      text: answer?.message,
      type: "answer"
    })

    console.log(tempConversation)
    setConversation(tempConversation)

    setText("")
    setLoading(false)
  }

  useEffect(() => {
    // storeEmbeddings()
  }, [])

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {conversation?.length > 0 ?
        <div className="w-[70%] h-[70%] flex flex-col overflow-y-scroll pr-5">
          {conversation.map((convo, index) => {
            return (
              <span key={index}>
                {convo?.type === "question" ?
                  <div className="flex justify-end my-3">
                    <h6 className="bg-[#305CDE] px-4 py-2 text-white rounded-full">{convo.text}</h6>
                  </div>
                  :
                  <div className="flex justify-start my-3">
                    <h6 className="bg-[#305CDE] px-4 py-2 text-white rounded-full">{convo.text}</h6>
                  </div>
                }
              </span>
            )
          })}
        </div> :
        <div className="w-[70%] h-[70%] flex flex-col justify-center items-center">
          <h6 className="text-[#305CDE] text-[80px] font-bold">Ask me a Question</h6>
        </div>
      }
      <div className="w-screen flex justify-center items-center gap-5">
        <input value={text} onChange={(ev) => setText(ev.target.value)} className="bg-white text-black my-5 focus:border focus:border-[#305CDE] p-3 rounded-full w-[70%]" />
        <button disabled={loading} className="bg-[#305CDE] p-3 rounded-full text-white disabled:bg-[#305CDE]/40" onClick={summarize}>
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
