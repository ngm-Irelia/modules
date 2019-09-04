#! /bin/bash
# Description: start the magicube_ui project
# Author: liyanjun
# Date: 2017/10/18

BONC_USDP_HOME="${HOME}"
MGC_UI_HOME="${BONC_USDP_HOME}/magicube_ui"
LOG_HOME=${BONC_USDP_HOME}/data/log

MGC_UI_SERVER="node"

function usage() {
    echo "	The script is used for starting the magicube_ui"
    echo "Execute:"
    echo "	start-magicube_ui.sh"
    echo "	"
    echo "Example: ./start-magicube_ui.sh"
    echo ""
    exit 1
}

function start() {
    mgc_ui_status=`ps -ef|grep ${MGC_UI_SERVER}|grep -v grep|wc -l`
    if [ ${mgc_ui_status} -ge 1 ]; then
        echo "ERROR: ${MGC_UI_SERVER} is already running ... Cannot launch again!"
        exit 3
    else
        echo " Launching ${MGC_UI_SERVER} now ..."
    fi

    mkdir -p ${MGC_UI_HOME}/tmp
    NPM=`which npm`
    ln -sf ${NPM} ${MGC_UI_HOME}/tmp/${MGC_UI_SERVER}

    cd ${MGC_UI_HOME}/mgc-ui
    NODE_ENV=production nohup ${MGC_UI_HOME}/tmp/${MGC_UI_SERVER} run start >> ${LOG_HOME}/magicube_ui.log 2>&1 &

    if [ $? -eq 0 ]; then
        echo " magicube_ui launched successfully...."
    else
        echo " magicube_ui launched failed, please check log file ${LOG_HOME}/magicube_ui.log ..."
    fi
}

# check npm
if ! which npm 2>/dev/null; then
#    export NODE_HOME=/
#    export PATH=$PATH:$NODE_HOME/bin
    echo 'node is not installed'
    exit 3
fi

start
if [ $1x == "-help"x ]; then
  usage
  exit
fi