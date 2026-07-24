from flask import Flask
'''
It creates an instance of the Flask class,
which will be your WSGI (Web Server Gateway Interface) application.
'''

### WSGI Application
app = Flask(__name__)

@app.route("/", methods=["GET"])
def welcome():
    return "<html><H1>Welcome to the flask course</H1></html>"

@app.route("/index", methods=["GET"])
def index():
    return "Welcome to the index page"

if __name__=="__main__":
    app.run(debug=True)
