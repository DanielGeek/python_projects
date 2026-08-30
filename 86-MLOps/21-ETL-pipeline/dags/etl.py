from airflow import DAG
from airflow.providers.http.operators.http import HttpOperator as SimpleHttpOperator
from airflow.decorators import task
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.utils.dates import days_ago
import json


## Define the DAG
with DAG(
    dag_id = "nasa_apod_postgres",
    start_date = days_ago(1),
    schedule = "@daily",
    catchup = False,
) as dag:

    ## Step 1: Create the table if it doesn't exists.

    ## Step 2: Extract the NASA API Data(APOD)-Astronomy Picture of the Day[Extract pipeline]

    ## Step 3: Transform the data(Pick the information that i need to save)

    ## Step 4: Load the data into Postgres SQL

    ## Step 5: Verify the data DBViewer

    ## Step 6: Define the task dependencies
