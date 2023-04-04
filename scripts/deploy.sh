#!/bin/bash

if [ $# -lt 2 ]; then
    echo 'Not enough parameters! Pass username and password of studio superadmin.'
    exit 1
fi

username=$1
password=$2

# LOGIN
login_return=$(curl -f -X PUT -d "{\"n\":\"$username\",\"p\":\"$password\"}" https://teststudio.iqb.hu-berlin.de/api/login.php)
token=$(echo $login_return | jq ".token")

# EDITOR
curl -f -X POST \
  -F "t=$token" \
  -F "name=verona-module" \
  -F "verona-module=@./dist/iqb-editor-aspect-nightly.html" \
  https://teststudio.iqb.hu-berlin.de/api/php_superadmin/uploadVeronaModule.php

## PLAYER
curl -f -X POST \
  -F "t=$token" \
  -F "name=verona-module" \
  -F "verona-module=@./dist/iqb-player-aspect-nightly.html" \
  https://teststudio.iqb.hu-berlin.de/api/php_superadmin/uploadVeronaModule.php
