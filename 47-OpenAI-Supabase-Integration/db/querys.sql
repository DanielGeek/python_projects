-- Enable the pgvector extension to work with embedding vectors
create extension vector
with
  schema extensions;

-- Create a table to store your documents
create table documents (
  id bigserial primary key,
  content text, -- corresponds to Document.pageContent
  metadata jsonb, -- corresponds to Document.metadata
  embedding extensions.vector(1536) -- 1536 works for OpenAI embeddings, change if needed
);

-- Create a function to search for documents
create function match_documents (
  query_embedding extensions.vector(1536),
  match_count int default null,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

create table public.transcripts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  video_url text not null,
  transcript text not null,
  created_at timestamp with time zone null default now(),
  constraint transcripts_pkey primary key (id),
  constraint unique_user_video_transcript unique (user_id, video_url),
  constraint transcripts_user_id_fkey foreign KEY (user_id) references auth.users (id)
  on delete CASCADE
) TABLESPACE pg_default;
