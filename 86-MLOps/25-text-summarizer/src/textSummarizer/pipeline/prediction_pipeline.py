import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

from src.textSummarizer.config.configuration import ConfigurationManager


class PredictionPipeline:
    def __init__(self):
        self.config = ConfigurationManager().get_model_evaluation_config()

    def predict(self, text):
        try:
            device = (
                "cuda"
                if torch.cuda.is_available()
                else "mps"
                if torch.backends.mps.is_available()
                else "cpu"
            )
            tokenizer = AutoTokenizer.from_pretrained(self.config.tokenizer_path)
            model = AutoModelForSeq2SeqLM.from_pretrained(self.config.model_path).to(
                device
            )

            inputs = tokenizer(
                text,
                max_length=512,
                truncation=True,
                return_tensors="pt",
            ).to(device)

            summary_ids = model.generate(
                inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                length_penalty=0.8,
                num_beams=8,
                max_length=64,
                min_length=10,
                no_repeat_ngram_size=3,
            )
            output = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            output = output.replace("<n>", " ").strip()

            print("Dialogue: \n", text)
            print("\nModel Summary: \n", output)
            return output
        except Exception as e:
            raise e
