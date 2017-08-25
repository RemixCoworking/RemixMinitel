#!/bin/bash

TTY=$(tty)

if [ "$TTY" == "/dev/ttyUSB0" ]
then
  /home/pi/start.sh
fi