#!/bin/sh
########################################################
# The script is used to make bonc text package         #
#                                                      #
#                                                      #
########################################################


PKG_BASE=$(cd `dirname $0`; pwd)
MKPKG_HOME=${PKG_BASE}/../package
echo "base home is"$PKG_BASE
echo "package home is" $MKPKG_HOME

if [ ! -d "${MKPKG_HOME}" ]; then
	mkdir ${MKPKG_HOME}
fi

#Step 1: clean all of the content under package
/bin/rm -rf ${MKPKG_HOME}/*
/bin/mkdir -p ${MKPKG_HOME}

cd ${PKG_BASE}/../

#NODE_ENV=development npm install && npm run dist && npm run bower:install && npm run build
NODE_ENV=development npm install && npm run bower:install && npm run dist
rm -rf node_modules && NODE_ENV=production npm install

mkdir -p ${MKPKG_HOME}/mgc-ui
cp ${PKG_BASE}/../app.js  ${MKPKG_HOME}/mgc-ui
cp ${PKG_BASE}/../package.json  ${MKPKG_HOME}/mgc-ui
cp ${PKG_BASE}/../LICENSE  ${MKPKG_HOME}/mgc-ui
cp -r ${PKG_BASE}/../bin  ${MKPKG_HOME}/mgc-ui
cp -r ${PKG_BASE}/../build  ${MKPKG_HOME}/mgc-ui
cp -r ${PKG_BASE}/../config  ${MKPKG_HOME}/mgc-ui
cp -r ${PKG_BASE}/../node_modules  ${MKPKG_HOME}/mgc-ui
cp -r ${PKG_BASE}/../routes ${MKPKG_HOME}/mgc-ui

mkdir -p ${MKPKG_HOME}/bin
cp -r ${PKG_BASE}/../scripts/* ${MKPKG_HOME}/bin

cd ${MKPKG_HOME}
tar czvf ${PKG_BASE}/magicube-ui-v1.tar.gz ./*

#cd ${PKG_BASE}
#cp magicube-ui-v1.tar.gz ${PKG_BASE}/../../package