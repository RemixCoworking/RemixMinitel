#!/bin/sh

./node_modules/.bin/babel index.js -o out.js
rsync -avz --exclude node_modules . pi@192.168.240.22:/home/pi/bl/