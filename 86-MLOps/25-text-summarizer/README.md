# Text Summarizer

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
