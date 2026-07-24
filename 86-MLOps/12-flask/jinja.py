### Building Url Dynamically
### Variable Rules
### Jinja 2 Template Engine

### Jinja2 Template Engine
'''
{{ }} expressions to print output in html
{%...%} conditions, for loops
{#...#} this is for comments
'''

from flask import Flask, render_template, request, redirect, url_for
'''
It creates an instance of the Flask class,
which will be your WSGI (Web Server Gateway Interface) application.
'''

### WSGI Application
app = Flask(__name__)

result_page = "result.html"

@app.route("/", methods=["GET"])
def welcome():
    return "<html><h1>Welcome to the flask course</h1></html>"

@app.route("/index", methods=["GET"])
def index():
    return render_template("index.html")

@app.route('/about', methods=["GET"])
def about():
    return render_template("about.html")

## Variable Rules
@app.route('/sucess/<int:score>', methods=["GET"])
def sucess(score):
    res=""
    if score >= 50:
        res="PASSED"
    else:
        res="FAILED"
    return render_template(result_page, results=res)

## Variable Rules
@app.route('/sucessres/<int:score>', methods=["GET"])
def sucessres(score):
    res=""
    if score >= 50:
        res="PASSED"
    else:
        res="FAILED"
    exp={'score': score, 'res': res}
    return render_template("sucessres.html", results=exp)

## if condition
@app.route('/sucessif/<int:score>', methods=["GET"])
def sucessif(score):
    return render_template(result_page, results=score)

@app.route('/fail/<int:score>', methods=["GET"])
def fail(score):
    return render_template(result_page, results=score)

@app.route('/submit', methods=["POST", "GET"])
def submit():
    if request.method == 'POST':
        science = float(request.form['science'])
        maths = float(request.form['maths'])
        c = float(request.form['c'])
        datascience = float(request.form['datascience'])

        total_score = (science + maths + c + datascience) / 4
        
        return redirect(url_for("sucessres", score=int(total_score)))
    
    return render_template("getresult.html")


if __name__=="__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
