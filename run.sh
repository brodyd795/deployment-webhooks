#!/usr/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd ${DIR}

source /root/.nvm/nvm.sh
nvm use v12.18.3

LOGS_PATH="$(sudo cat ${DIR}/.env | grep LOGS_PATH= | cut -d '=' -f2)"
node ${DIR}/index.js > ${LOGS_PATH} 2>&1
