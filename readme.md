# Installation

## Package Pre-Requisites

sudo apt install -y git

## Step 1: Install MLDSP-portal from Github
It is recommended to use the latest NodeJS and NPM packages.  A script is included in the
repo to install directly from the NodeJS site as opposed to the package manager.  Replace
the verstion (18.13.0) with the desired version.

    cd ~
    git clone git@github.com:Thaerious/MLDSP.git
    cd MLDSP
    sudo bash tools/install_node.sh 18.13.0
    npm i

## Step 2: Add API Servers to api_servers.json

    vim api_servers.json

## Step 3: Start the Portal Server    
    npm run server

Browse to http://localhost:7632/ to view test page.

# Start the Portal Server
    cd MLDSP-portal
    npm run server
