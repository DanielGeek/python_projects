### Put and Delete-HTTP Verbs
### Working with API's JSON

from flask import Flask, jsonify, request

app = Flask(__name__)

## Initial Data in my to do list
items = [
    {'id': 1, "name": "Item 1", "description": "This is item 1"},
    {'id': 2, "name": "Item 2", "description": "This is item 2"}
]

@app.route("/", methods=["GET"])
def home():
    return "Welcome to the sample To Do List App"

## Get: Retrieve all the items
@app.route('/items', methods=['GET'])
def get_items():
    return jsonify(items)

## Get: Retrieve all the items
@app.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    item = next((item for item in items if item['id'] == item_id), None)
    if item is None:
        return jsonify({'error': 'Item not found'}), 404
    return jsonify(item)

## Post create a new task
@app.route('/items', methods=["POST"])
def create_item():
    if not request.json or ("name" not in request.json):
        return jsonify({'error': 'Missing data'}), 400
    new_item = {
        "id": items[-1]["id"] + 1 if items else 1,
        "name": request.json["name"],
        "description": request.json["description"]
    }
    items.append(new_item)
    return jsonify(new_item), 201

# Put: Update an existing item
@app.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    if not request.json:
        return jsonify({'error': 'Missing data'}), 400
    item = next((item for item in items if item['id'] == item_id), None)
    if item is None:
        return jsonify({'error': 'Item not found'}), 404
    item["name"] = request.json["name"] if "name" in request.json else item["name"]
    item["description"] = request.json["description"] if "description" in request.json else item["description"]
    return jsonify(item)

# Delete: Delete an existing item
@app.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    item = next((item for item in items if item['id'] == item_id), None)
    if item is None:
        return jsonify({'error': 'Item not found'}), 404
    items.remove(item)
    return jsonify({'message': 'Item deleted successfully'}), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
