import evaluate
import pandas as pd
import torch
from datasets import load_from_disk
from tqdm import tqdm
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

from src.textSummarizer.entity import ModelEvaluationConfig

device = (
    "cuda"
    if torch.cuda.is_available()
    else "mps"
    if torch.backends.mps.is_available()
    else "cpu"
)


class ModelEvaluation:
    def __init__(self, config: ModelEvaluationConfig):
        self.config = config

    def generate_batch_sized_chunks(self, list_of_elements, batch_size):
        """Split the dataset into smaller batches that we can process simultaneously
        Yield successive batch-sized chunks from list_of_elements."""
        for i in range(0, len(list_of_elements), batch_size):
            yield list_of_elements[i : i + batch_size]

    def calculate_metric_on_test_ds(
        self,
        dataset,
        metric,
        model,
        tokenizer,
        batch_size=16,
        device=device,
        column_text="dialogue",
        column_summary="summary",
    ):
        model_device = next(model.parameters()).device
        article_batches = list(
            self.generate_batch_sized_chunks(dataset[column_text], batch_size)
        )
        target_batches = list(
            self.generate_batch_sized_chunks(dataset[column_summary], batch_size)
        )

        for article_batch, target_batch in tqdm(
            zip(article_batches, target_batches), total=len(article_batches)
        ):
            inputs = tokenizer(
                article_batch,
                max_length=512,
                truncation=True,
                padding="max_length",
                return_tensors="pt",
            )

            summaries = model.generate(
                input_ids=inputs["input_ids"].to(model_device),
                attention_mask=inputs["attention_mask"].to(model_device),
                length_penalty=0.8,
                num_beams=8,
                max_length=128,
            )
            """ Parameter for length penalty ensures that the model does not generate sequences that are too long. """

            # Finally, we decode the generated texts,
            # replace the token, and add the decoded texts with the references to the metric.
            decoded_summaries = [
                tokenizer.decode(
                    s, skip_special_tokens=True, clean_up_tokenization_spaces=True
                )
                for s in summaries
            ]

            #   decoded_summaries = [d.replace("", " ") for d in decoded_summaries]

            metric.add_batch(predictions=decoded_summaries, references=target_batch)

        # Finally compute and return the ROUGE scores.
        score = metric.compute()
        return score

    def evaluate(self):
        tokenizer = AutoTokenizer.from_pretrained(self.config.tokenizer_path)
        model_pegasus = AutoModelForSeq2SeqLM.from_pretrained(
            self.config.model_path
        ).to(device)

        # load dataset from disk
        dataset_samsum_pt = load_from_disk(self.config.data_path)

        rouge_names = ["rouge1", "rouge2", "rougeL", "rougeLsum"]

        rouge_metric = evaluate.load("rouge")

        score = self.calculate_metric_on_test_ds(
            dataset_samsum_pt["test"].select(range(10)),
            rouge_metric,
            model_pegasus,
            tokenizer,
            batch_size=2,
            column_text="dialogue",
            column_summary="summary",
        )

        # Directly use the scores without accessing fmeasure or mid
        rouge_dict = {rn: score[rn] for rn in rouge_names}

        # Convert the dictionary to a DataFrame for easy visualization
        df = pd.DataFrame(rouge_dict, index=["pegasus"])
        df.to_csv(self.config.metric_file_name, index=False)
