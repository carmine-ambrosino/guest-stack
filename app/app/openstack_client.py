from keystoneauth1 import loading, session
from keystoneclient.v3 import client


def get_keystone_client(auth_url, username, password, user_domain_name, project_name, project_domain_name):
    loader = loading.get_plugin_loader('password')
    auth = loader.load_from_options(
        auth_url=auth_url,
        username=username,
        password=password,
        user_domain_name=user_domain_name,
        project_name=project_name,
        project_domain_name=project_domain_name
    )
    sess = session.Session(auth=auth)
    return client.Client(session=sess)
