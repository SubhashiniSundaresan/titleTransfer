#!/bin/bash

# Setup the Environment variables for the REST Server

#1. Set up the card to be used
export COMPOSER_CARD=admin@titletransfer

#2. Set up the namespace usage    always |  never
export COMPOSER_NAMESPACES=never

#3. Set up the REST server Authhentcation    true | false
export COMPOSER_AUTHENTICATION=true

#4. Set up the Passport strategy provider
export COMPOSER_PROVIDERS='{
  "linkedin": {
    "provider": "linkedin",
    "module": "passport-linkedin",
    "consumerKey": "77mqnupdegfalm",
    "consumerSecret": "1ouNE9bRGt73A0t3",
    "authPath": "/auth/linkedin",
    "callbackURL": "/auth/linkedin/callback",
    "successRedirect": "http://localhost:4200/connectNetwork",
    "failureRedirect": "http://localhost:4200/"
  }
}'

#5. Execute the REST server
composer-rest-server
