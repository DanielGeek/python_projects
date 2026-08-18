import pandas as pd
import pickle
from sklearn.metrics import accuracy_score
import yaml
import os
import mlflow
from dotenv import load_dotenv

load_dotenv()

os.environ['MLFLOW_TRACKING_URI'] = os.getenv("MLFLOW_TRACKING_URI", "")
os.environ['MLFLOW_TRACKING_USERNAME'] = os.getenv("MLFLOW_TRACKING_USERNAME", "")
os.environ['MLFLOW_TRACKING_PASSWORD'] = os.getenv("MLFLOW_TRACKING_PASSWORD", "")

# Load parameters from params.yaml
params = yaml.safe_load(open("params.yaml"))["train"]

def evaluate(data_path, model_path):
    data = pd.read_csv(data_path)
    X = data.drop(columns=["Outcome"])
    y = data["Outcome"]
    
    mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI"))

    ## Load the model from the disk
    model = pickle.load(open(model_path, "rb"))

    predictions = model.predict(X)
    accuracy = accuracy_score(y, predictions)

    ## Log metrics to MLFlow
    mlflow.log_metric("accuracy", accuracy)
    print(f"Model accuracy: {accuracy}")

if __name__=="__main__":
    evaluate(params["data"], params["model"])
