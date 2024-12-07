from flask import Flask, jsonify, request
from user_manager import create_user, update_user, get_active_users, delete_user

app = Flask(__name__)

@app.route('/users', methods=['POST'])
def create_user_api():
    data = request.json

    # Verifica dei campi richiesti
    required_fields = ['username', 'expiry_time', 'email', 'project', 'role']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    username = data['username']
    expiry_time = data['expiry_time']
    email = data['email']
    project = data['project']
    role = data['role']

    # Creazione dell'utente
    result, status_code = create_user(username, expiry_time, email, project, role)
    return jsonify(result), status_code


@app.route('/users/<user_id>', methods=['POST'])
def update_user_api(user_id):
    data = request.json

    # Recupera i campi da aggiornare
    new_expiry_time = data.get('expiry_time')
    email = data.get('email')
    project_name = data.get('project')
    role_name = data.get('role')

    # Aggiornamento dell'utente
    result, status_code = update_user(
        user_id, 
        new_expiry_time=new_expiry_time, 
        email=email, 
        project_name=project_name, 
        role_name=role_name
    )
    return jsonify(result), status_code


@app.route('/users', methods=['GET'])
def get_users_api():
    users = get_active_users()
    return jsonify([{
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "expiry_time": user["expiry_time"],
        "project_id": user["project_id"],
        "role": user["role"],
        "openstack_user_id": user["openstack_user_id"]
    } for user in users]), 200


@app.route('/users/<user_id>', methods=['DELETE'])
def delete_user_api(user_id):
    try:
        delete_user(user_id)
        return jsonify({"message": "User deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
