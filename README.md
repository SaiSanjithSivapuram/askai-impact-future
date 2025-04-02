# askai
This is a sample application that can summarize any content asked.

## Pre requisistes
Install the node and npm packages

## Getting Started
First, run the development server:
npm run dev

## Application Info
Application uses some basic food cusine data which is in the embeddings file.<br />
Text Data is in vector embedding format in the pinecone db. (Vector embeddings are handled using sentence transformers in hugging face)<br />
Application checks for information relevant to the question and summarizes and answer to the user. (Text summarization is handled by a hugging face model)
