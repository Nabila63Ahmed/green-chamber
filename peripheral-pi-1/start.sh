#!/bin/sh
nohup python3 send_temperature_humidity.py &
nohup python3 send_pir_motion.py &
nohup python3 receive_lcd_instruction.py &
nohup python3 receive_lamp_plugwise_instruction.py &
nohup python3 receive_fan_plugwise_instruction.py &