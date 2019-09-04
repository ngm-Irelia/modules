NODE_ENV=development npm install && npm run dist && npm run bower:install && npm run build
rm -rf node_modules && NODE_ENV=production npm install

tar czvf magicube-ui-v1.tar.gz app.js  bin  build  config  LICENSE    node_modules  package.json   routes 