"""
We'll define a DAG where the tasks are as follows:

Task 1: Start with an initial number (e.g., 10).
Task 2: Add 5 to the number.
Task 3: Multiply the result by 2.
Task 4: Subtract 3 from the result.
Task 5: Compute the square of the result.

"""

from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

## Define function for each task

def start_number(**context):
    context["ti"].xcom_push(key="current_value", value=10)
    print("Starting number 10")


def add_five(**context):
    current_val = context["ti"].xcom_pull(key="current_value", task_ids="start_task")
    new_value = current_val + 5
    context["ti"].xcom_push(key="current_value", value=new_value)
    print(f"Added 5 to {current_val} to get {new_value}")


def multiply_by_two(**context):
    current_val = context["ti"].xcom_pull(key="current_value", task_ids="add_five_task")
    new_value = current_val * 2
    context["ti"].xcom_push(key="current_value", value=new_value)
    print(f"Multiplied {current_val} by 2 to get {new_value}")

def subtract_three(**context):
    current_val = context["ti"].xcom_pull(key="current_value", task_ids="multiply_by_two_task")
    new_value = current_val - 3
    context["ti"].xcom_push(key="current_value", value=new_value)
    print(f"Subtracted 3 from {current_val} to get {new_value}")

def square_number(**context):
    current_val = context["ti"].xcom_pull(key="current_value", task_ids="subtract_three_task")
    new_value = current_val * current_val
    context["ti"].xcom_push(key="current_value", value=new_value)
    print(f"Squared {current_val}^2 to get {new_value}")


## Define the DAG
with DAG(
    dag_id="maths_sequence_dag",
    start_date=datetime(2023, 1, 1),
    schedule="@once",
    catchup=False,
) as dag:
    start_task = PythonOperator(
        task_id="start_task",
        python_callable=start_number,
    )

    add_five_task = PythonOperator(
        task_id="add_five_task",
        python_callable=add_five,
    )

    multiply_by_two_task = PythonOperator(
        task_id="multiply_by_two_task",
        python_callable=multiply_by_two,
    )

    subtract_three_task = PythonOperator(
        task_id="subtract_three_task",
        python_callable=subtract_three,
    )

    square_number_task = PythonOperator(
        task_id="square_number_task",
        python_callable=square_number,
    )

    ## Dependencies
    start_task >> add_five_task >> multiply_by_two_task >> subtract_three_task >> square_number_task
