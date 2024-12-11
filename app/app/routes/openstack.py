from flask import Blueprint, jsonify, request
from config import Config
from app.openstack_client import get_keystone_client
import logging


openstack_bp = Blueprint('openstack', __name__, url_prefix=Config.API_PREFIX)


@openstack_bp.route('/openstack/projects-roles', methods=['GET'])
def openstack_projects_roles_api():
    try:
        # get openstack params
        auth_url = Config.OPENSTACK["auth_url"]
        username = Config.OPENSTACK["username"]
        password = Config.OPENSTACK["password"]
        user_domain_name = Config.OPENSTACK["user_domain_name"]
        project_name = Config.OPENSTACK["project_name"]
        project_domain_name = Config.OPENSTACK["project_domain_name"]
        
        # get keyston client
        keystone = get_keystone_client(
            auth_url=auth_url,
            username=username,
            password=password,
            user_domain_name=user_domain_name,
            project_name=project_name,
            project_domain_name=project_domain_name
        )
        
        # project list
        projects = [project.name for project in keystone.projects.list()]
        
        # role list
        roles = [role.name for role in keystone.roles.list()]
        
        return jsonify({"projects": projects.sort(), "roles": roles.sort()})
    
    except Exception as e:
        # Gestione degli errori
        return jsonify({"error": str(e)}), 500
