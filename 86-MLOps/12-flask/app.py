from flask import Flask
'''
It creates an instance of the Flask class,
which will be your WSGI (Web Server Gateway Interface) application.
'''

app = Flask(__name__)

@app.route("/", methods=["GET"])
def welcome():
    return "Welcome to this best Flask course. This should be an amazing course"

@app.route("/index", methods=["GET"])
def index():
    return "Welcome to the index page"

if __name__=="__main__":
    app.run(debug=True)
