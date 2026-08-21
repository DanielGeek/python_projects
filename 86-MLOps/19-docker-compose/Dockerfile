FROM python:3.7-alpine
WORKDIR /code
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=5001
COPY . .
RUN pip install -r requirements.txt
EXPOSE 5001
CMD ["flask", "run"]
