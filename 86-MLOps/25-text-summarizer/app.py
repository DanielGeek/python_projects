import os

import uvicorn
from fastapi import FastAPI
from fastapi.responses import Response
from starlette.responses import RedirectResponse

from src.textSummarizer.pipeline.prediction_pipeline import PredictionPipeline

text: str = """A tiny brown sparrow lived in a dry old tree. The summer sun was hot.
    The grass was brown and crunching. The little bird wanted a drink of cool water.
    He flew down to a big stone bowl in a garden.
    The bowl was deep, and the water sat far at the bottom. The sparrow tried to reach it,
    but his short beak could not touch the wet surface. He felt sad and tired. Then, he saw a small,
    round pebble on the dirt. He grabbed it in his beak and carried it to the bowl. Plop! The pebble sank to the bottom.
    The water rose just a tiny bit. The smart sparrow flew down again. He found another pebble and dropped it in.
    Plop! The water rose more. He worked hard for a long time. He brought many small stones and dropped them into the bowl one by one.
    At last, the water reached the very top.The happy bird drank until he was full.
    He fluffed his feathers and sang a bright song to the sky."""

app = FastAPI()


@app.get("/", tags=["authentication"])
async def index():
    return RedirectResponse(url="/docs")


@app.get("/train")
async def training():
    try:
        os.system("python main.py")
        return Response("Training successful!!")

    except Exception as e:
        return Response(f"Error Occurred! {e}")


@app.post("/predict")
async def predict_route(text):
    try:
        obj = PredictionPipeline()
        text = obj.predict(text)
        return text
    except Exception as e:
        raise e


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
