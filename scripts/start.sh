#!/bin/bash

TTY=$(tty)

if [ "$TTY" == "/dev/ttyUSB0" ]
then
  export LC_ALL=C

  stty -F "/dev/ttyUSB0" 1200 istrip cs7 parenb -parodd brkint ignpar icrnl ixon ixany opost onlcr cread hupcl isig icanon echo echoe echok;
  stty cols 40
  stty rows 24
  stty -ixon

  screen -S minitel -t first bash -c "/home/pi/.nvm/versions/node/v8.4.0/bin/node /home/pi/bl/out.js; bash"
fi