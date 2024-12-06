# openstack_client.py
from keystoneclient.v3 import client as keystone_client
from keystoneauth1 import session
from keystoneauth1.identity import v3

def get_keystone_session(auth_url, username, password, user_domain_name, project_name, project_domain_name):
    auth = v3.Password(
        auth_url=auth_url,
        username=username,
        password=password,
        user_domain_name=user_domain_name,
        project_name=project_name,
        project_domain_name=project_domain_name
    )
    return session.Session(auth=auth)

def get_keystone_client(auth_url, username, password, user_domain_name, project_name, project_domain_name):
    sess = get_keystone_session(auth_url, username, password, user_domain_name, project_name, project_domain_name)
    return keystone_client.Client(session=sess)
