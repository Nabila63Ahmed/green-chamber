#!/bin/sh
nohup python3 send_pir_motion.py &
nohup python3 receive_lcd_instruction.py &
nohup python3 receive_plugwise_instruction.py &