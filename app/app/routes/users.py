from flask import Blueprint, jsonify, request
from app.user_manager import UserManager
from datetime import datetime
from config import Config

user_manager = UserManager(**Config.OPENSTACK)

users_bp = Blueprint('users', __name__, url_prefix=Config.API_PREFIX)

@users_bp.route('/users', methods=['POST'])
def create_user_api():
    data = request.json
    required_fields = ['username', 'expiry_time', 'email', 'project', 'role']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    result, status_code = user_manager.create_user(**data)
    return jsonify(result), status_code


@users_bp.route('/users/<user_id>', methods=['POST'])
def update_user_api(user_id):
    data = request.json
    allowed_fields = {"expiry_time", "email", "project", "role"}
    fields_to_update = {key: value for key, value in data.items() if key in allowed_fields}

    if not fields_to_update:
        return jsonify({"error": "No valid fields provided for update"}), 400

    invalid_fields = [key for key in data if key not in allowed_fields]
    if invalid_fields:
        return jsonify({"error": f"Invalid fields: {', '.join(invalid_fields)}"}), 400

    result, status_code = user_manager.update_user(user_id, **fields_to_update)
    return jsonify(result), status_code


@users_bp.route('/users', methods=['GET'])
def get_users_api():
    users = user_manager.get_temp_users()
    today = datetime.now().date()

    # Add 'status' for each users
    for user in users:
        expiry_date = datetime.fromisoformat(user['expiry_time'].replace("Z", "+00:00")).date()
        user['status'] = (
            'expiring soon' if expiry_date == today else
            'expired' if expiry_date < today else
            'active'
        )
    
    expiring_soon = sum(1 for user in users if user['status'] == 'expiring soon')
    expired = sum(1 for user in users if user['status'] == 'expired')

    response = {
        "users": users,
        "stats": {
            "users": len(users),
            "expiring_soon": expiring_soon,
            "expired": expired
        }
    }

    return jsonify(response), 200

@users_bp.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = user_manager.get_temp_users_by_id(user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404  
    return jsonify(user), 200

@users_bp.route('/users/<user_id>', methods=['DELETE'])
def delete_user_api(user_id):
    result, status_code = user_manager.delete_user(user_id)
    return jsonify(result), status_code

