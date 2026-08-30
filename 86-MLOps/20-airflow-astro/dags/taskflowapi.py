"""
Apache Airflow introduced the TaskFlow API which allows you to create tasks
using python decorators like @task. This is a cleaner and more intuitive way
of writing tasks without needing to manually use operators like PythonOperator.
"""

from airflow import DAG
from airflow.decorators import task
from datetime import datetime


## Define the DAG

with DAG(
    dag_id='math_sequence_dag_with_taskflow',
    start_date=datetime(2023,1,1),
    schedule="@once",
    catchup=False
) as dag:

    # Task 1: Start with the initial number
    @task
    def start_number():
        initial_number = 10
        print(f"Starting number: {initial_number}")
        return initial_number

    # Task 2: Add 5 to the initial number
    @task
    def add_five(number):
        new_value = number + 5
        print(f"Adding 5: {number} + 5 = {new_value}")
        return new_value

    # Task 3: Multiply the result by 2
    @task
    def multiply_by_two(number):
        new_value = number * 2
        print(f"Multiplying by 2: {number} * 2 = {new_value}")
        return new_value

    # Task 4: Subtract 3 from the result
    @task
    def subtract_three(number):
        new_value = number - 3
        print(f"Subtracting 3: {number} - 3 = {new_value}")
        return new_value

    # Task 5: Square the final result
    @task
    def square_number(number):
        new_value = number ** 2
        print(f"Squaring the result: {number}^2 = {new_value}")
        return new_value

    ## Set task dependencies
    start_task = start_number()
    added_values = add_five(start_task)
    multiplied_values = multiply_by_two(added_values)
    subtracted_values = subtract_three(multiplied_values)
    squared_values = square_number(subtracted_values)
