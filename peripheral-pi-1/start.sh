#!/bin/sh
nohup python2 send_pir_motion.py &
nohup python2 receive_lcd_instruction.py &
nohup python2 receive_plugwise_instruction.py &