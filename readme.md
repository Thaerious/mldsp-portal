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
The API servers are stored in a JSON file with key-value pairs representing the 
server name and server address.

    vim api_servers.json

## Step 3: Install SSL Certs
Install self signed certificates for development.
Install Let's Encrypt certificates for production.
Enter the Auth0 values into the .env file from the Auth0 dashboard.

### Self Signed

    mkdir .cert
    openssl req -nodes -new -x509 -keyout .cert/server.key -out .cert/server.cert

Add to .env file

    SSL_CERT=ssl/server.cert
    SSL_KEY=ssl/server.key
    CLIENT_ID=from auth0
    ISSUER_BASE_URL=from auth0
    SECRET=from auth0    

### Let's Encrypt

    sudo certbot certonly

Add to .env file

    SSL_CERT=/etc/letsencrypt/live/DOMAIN_NAME/fullchain.pem
    SSL_KEY=/etc/letsencrypt/live/DOMAIN_NAME/privkey.pem
    CLIENT_ID= from auth0
    ISSUER_BASE_URL= from auth0
    SECRET= from auth 0

## Step 3: Setup the Data Sets
Zip and copy the data sets from the hilllab/mldsp data directory to the portal 
/data/default directory.

    zip -r data/default/fungi ../mldsp/data/Fungi/*

## Step 4: Link packages to public directory

    sudo ln -s ../../node_modules/bootstrap/ bootstrap
    sudo ln -s ../../node_modules/plotly.js-dist/ plotly

## Step 4: Start the Portal Server    
If you run the server on port 80 node must be run as sudo.

    sudo npm run server

## Step 4: Add system.d info
Permits systemctl start, stop, and enable.  Use enable to autostart the service
on boot.

    sudo systemctl start mldsp-portal
    sudo systemctl stop mldsp-portal
    sudo systemctl enable mldsp-portal

To enable system control add the following to /etc/systemd/system/mldsp-portal.service

    [Unit]
    Description=MLDSP Portal Server

    [Service]
    User=ubuntu
    WorkingDirectory=/home/ubuntu/MLDSP-portal
    ExecStart=node server-src/main.js
    Restart=always

    [Install]
    WantedBy=multi-user.target
