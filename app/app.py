from flask import Flask, jsonify, request
from user_manager import UserManager
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Initialize UserManager with OpenStack configuration
user_manager = UserManager(**Config.OPENSTACK)

@app.route('/users', methods=['POST'])
def create_user_api():
    data = request.json
    required_fields = ['username', 'expiry_time', 'email', 'project', 'role']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    result, status_code = user_manager.create_user(**data)
    return jsonify(result), status_code


@app.route('/users/<user_id>', methods=['POST'])
def update_user_api(user_id):
    """
    Aggiorna email, ruolo o progetto di un utente.
    È possibile inviare uno o più campi contemporaneamente, ma non il username.
    """
    data = request.json
    allowed_fields = {"expiry_time","email", "project", "role"}
    fields_to_update = {key: value for key, value in data.items() if key in allowed_fields}

    if not fields_to_update:
        return jsonify({"error": "No valid fields provided for update"}), 400

    invalid_fields = [key for key in data if key not in allowed_fields]
    if invalid_fields:
        return jsonify({"error": f"Invalid fields: {', '.join(invalid_fields)}"}), 400

    # Chiama l'aggiornamento dinamico
    result, status_code = user_manager.update_user(user_id, **fields_to_update)
    return jsonify(result), status_code

@app.route('/users', methods=['GET'])
def get_users_api():
    users = user_manager.get_temp_users()
    return jsonify(users), 200


@app.route('/users/<user_id>', methods=['DELETE'])
def delete_user_api(user_id):
    try:
        user_manager.delete_user(user_id)
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=Config.DEBUG)
