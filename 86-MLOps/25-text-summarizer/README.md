# Text Summarizer using  Hugging Face

## Workflow

1. Config.yaml
2. Params.yaml
3. Config entity
4. Configuration Manager
5. Update the components - Data Ingestion, Data Transformation, Model Trainer.
6. Create our Pipeline - Training Pipeline, Prediction Pipeline.
7. Front End - API's, Training API's, Batch Prediction API's.

## Conda Commands

```bash
conda create -p venv python==3.10 -y
conda activate ./venv
pip install -r requirements.txt
jupyter notebook research/text_summarizer.ipynb
```

## FastAPI Commands

```bash
uvicorn app.main:app --reload
```

## huggingface commands

```bash
rm -rf ~/.cache/huggingface/hub/models--google--pegasus-cnn_dailymail
rm -rf ~/.cache/huggingface/hub/.locks/models--google--pegasus-cnn_dailymail
hf download google/pegasus-cnn_dailymail --exclude "rust_model.ot"
```
