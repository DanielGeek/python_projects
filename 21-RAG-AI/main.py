import logging
from fastapi import FastAPI
import inngest
import inngest.fast_api
from inngest.experimental import ai
from dotenv import load_dotenv
import uuid
import os
import datetime
from data_loader import load_and_chunk_pdf, embed_texts
from vector_db import QdrantStorage
from custom_types import RAQQueryResult, RAGSearchResult, RAGUpsertResult, RAGChunkAndSrc
# from google import genai
# from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
# from llama_index.llms.google_genai import GoogleGenAI

load_dotenv()

inngest_client = inngest.Inngest(
    app_id="rag_app",
    logger=logging.getLogger("uvicorn"),
    is_production=False,
    serializer=inngest.PydanticSerializer()
)

@inngest_client.create_function(
    fn_id="RAG: Ingest PDF",
    trigger=inngest.TriggerEvent(event="rag/ingest_pdf"),
)
async def rag_ingest_pdf(ctx: inngest.Context):
    def _load(ctx: inngest.Context) -> RAGChunkAndSrc:
        pdf_path = ctx.event.data["pdf_path"]
        source_id = ctx.event.data.get("source_id", pdf_path)
        chuncks = load_and_chunk_pdf(pdf_path)
        return RAGChunkAndSrc(chunks=chuncks, source_id=source_id)

    def _upsert(chuncks_and_src: RAGChunkAndSrc) -> RAGUpsertResult:
        chunks = chuncks_and_src.chunks
        source_id = chuncks_and_src.source_id
        vecs = embed_texts(chunks)
        ids = [str(uuid.uuid5(uuid.NAMESPACE_URL, f"{source_id}:{i}")) for i in range(len(chunks))]
        payloads = [{"source": source_id, "text": chunks[i]} for i in range(len(chunks))]
        QdrantStorage().upsert(ids, vecs, payloads)
        return RAGUpsertResult(ingested=len(chunks))

    chuncks_and_src = await ctx.step.run("load-and-chunck", lambda: _load(ctx), output_type=RAGChunkAndSrc)
    ingested = await ctx.step.run("embed-and-upsert", lambda: _upsert(chuncks_and_src), output_type=RAGUpsertResult)
    return ingested.model_dump()


app = FastAPI()

inngest.fast_api.serve(app, inngest_client, [rag_ingest_pdf])
