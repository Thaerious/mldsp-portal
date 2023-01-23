# Installation

## Package Pre-Requisites

sudo apt install -y git certbot

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

## Step 3: Install SSL Certs

    sudo certbot certonly

Add to .env file

    SSL_CERT=/etc/letsencrypt/live/DOMAIN_NAME/fullchain.pem
    SSL_KEY=/etc/letsencrypt/live/DOMAIN_NAME/privkey.pem
    CLIENT_ID= from auth0
    ISSUER_BASE_URL= from auth0
    SECRET= from auth 0

## Step 3: Start the Portal Server    
    npm run server

