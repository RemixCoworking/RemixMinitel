#!/bin/sh

# sample script to update remote code

./node_modules/.bin/babel index.js -o out.js
rsync -avz --exclude .git --exclude node_modules . pi@192.168.240.70:/home/pi/bl/
