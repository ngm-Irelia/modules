#! /bin/bash
# Description: stop the magicube_ui project
# Author: liyanjun
# Date: 2017/10/18

MGC_UI_SERVER="node"

function stop() {
    mgc_ui_status=`ps -ef|grep ${MGC_UI_SERVER}|grep -v grep|wc -l`
    if [ ${mgc_ui_status} -ge 1 ]; then
        for sid in `ps -ef|grep ${MGC_UI_SERVER} |grep -v grep |awk '{print $2}'`
        do
            kill -9 ${sid}
        done
        echo "magicube_ui service is stopped!"
    else
        echo "magicube_ui service is not running, needn't stop it!"
    fi
}

stop
