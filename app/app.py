# app.py
from flask import Flask, jsonify, request
from user_manager import create_user, update_user, get_active_users, delete_user

app = Flask(__name__)

@app.route('/users', methods=['POST'])
def create_user_api():
    data = request.json
    username = data['username']
    expiry_time = data['expiry_time']  # ISO format string
    email = data['email']  # Nuovo campo email

    user = create_user(username, expiry_time, email)
    return jsonify({
        "message": "User created",
        "user": {
            "username": username,
            "email": email,
            "expiry_time": expiry_time,
            "openstack_user_id": user.id
        }
    }), 201


@app.route('/users/<user_id>', methods=['POST'])
def update_user_api(user_id):
    data = request.json
    new_expiry_time = data.get('expiry_time')  # ISO format string
    email = data.get('email')  # Nuovo campo email

    try:
        update_user(user_id, new_expiry_time=new_expiry_time, email=email)
        return jsonify({"message": "User updated"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404

@app.route('/users', methods=['GET'])
def get_users_api():
    users = get_active_users()
    return jsonify([{
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "expiry_time": user["expiry_time"],
        "openstack_user_id": user["openstack_user_id"]
    } for user in users]), 200


@app.route('/users/<user_id>', methods=['DELETE'])
def delete_user_api(user_id):
    delete_user(user_id)
    return jsonify({"message": "User deleted"}), 200

if __name__ == '__main__':
    app.run(debug=True)
