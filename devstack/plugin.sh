#!/bin/bash

# Install plugin dependencies function
function install_dependencies {
    echo "Installing plugin dependencies..."
    
    # venv creation
    if [[ ! -d "$APP_DIR/.venv" ]]; then
        python3 -m venv "$APP_DIR/.venv"
    fi

    # venv activation
    source "$APP_DIR/.venv/bin/activate" 

    # install requirements
    if [[ -f "$APP_DIR/requirements.txt" ]]; then
        pip install -r "$APP_DIR/requirements.txt" || { echo "Failed to install dependencies"; exit 1; }
    else
        echo "requirements.txt not found!"
        exit 1
    fi

    # venv deactivation
    deactivate
 }

# Move service file function
function copy_service_file {
    echo "Moving service file to systemd directory..."
    sudo cp "$SERVICE_DIR/guest-stack.service" "$SYSTEMD_DIR" || { echo "Failed to copy service file"; exit 1; }
    sudo systemctl enable guest-stack.service || { echo "Failed to enable systemd plugin service"; exit 1; }
    sudo systemctl daemon-reload || { echo "Failed to reload systemd daemon"; exit 1; }
}

# Start plugin
function start_plugin {
    echo "Starting Flask service..."
    sudo systemctl start guest-stack.service || { echo "Failed to start service"; exit 1; }
}
   
# Configure plugin
function configure_plugin {
    echo "Configuring Plugin service..."
    # Add configuration here
}

if is_service_enabled guest-stack; then

    if [[ "$1" == "stack" && "$2" == "pre-install" ]]; then
        echo_summary "No additional packages to install for Openstack Plugin."

    elif [[ "$1" == "stack" && "$2" == "install" ]]; then
        echo_summary "Installing Plugin"
        install_dependencies
        copy_service_file

    elif [[ "$1" == "stack" && "$2" == "post-config" ]]; then
        echo_summary "Configuring Plugin"
        configure_plugin

    elif [[ "$1" == "stack" && "$2" == "extra" ]]; then
        echo_summary "Initializing Plugin"
        start_plugin
    fi

    if [[ "$1" == "unstack" ]]; then
        echo_summary "Stopping service..."
        sudo systemctl stop guest-stack.service || { echo "Failed to stop service"; exit 1; }
    fi

    if [[ "$1" == "clean" ]]; then
        sudo systemctl disable guest-stack.service || { echo "Failed to stop service"; exit 1; }
        sudo rm "$SYSTEMD_DIR/guest-stack.service"
    fi
fi

