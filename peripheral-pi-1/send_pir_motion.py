import time
import grovepi
import pika
import json
import time
from config import *

# Build a connection to the broker using the data from the configuration file
credentials = pika.PlainCredentials(username, password)
connection = pika.BlockingConnection(pika.ConnectionParameters(ip, port, host, credentials))
channel = connection.channel()

# Specify the exchange and routing key for motion
exchange_name = 'sensors-exchange'
routing_key_name = 'sensors.motion'

pir_sensor = 8
timer = 30
last_motion_message = 0
motion = 0
grovepi.pinMode(pir_sensor,"INPUT")

# In an infinity loop motion data is gathered from the motion sensor every second.
# If a motion is registered and the last published value was not 1, value 1 is published immediately to the broker.
# In case the last published value was 1, a timer of 30 seconds is started.
# Every motion in the meantime starts the timer again.
# If there was no motion for 30 seconds, value 0 is published.
while True:
    try:
        motion=grovepi.digitalRead(pir_sensor)
        if motion==0 or motion==1:
            if motion==1:
                print ('1')
                if last_motion_message==0:
                    now = int(round(time.time() * 1000)) # Current time in miliseconds
                    message = {
                            "value": 1,
                            "createdAt": now
                            }
                    message_json = json.dumps(message)
                    channel.basic_publish(exchange=exchange_name, routing_key=routing_key_name, body=message_json)
                    print(" [x] Sent %r:%r" % (routing_key_name, message_json))
                    last_motion_message = 1
                    timer = 30
                else:
                    timer = 30
            else:
                print ('0')
                if last_motion_message==1:
                    if timer==0:
                        now = int(round(time.time() * 1000)) # Current time in miliseconds
                        message = {
                                "value": 0,
                                "createdAt": now
                                }
                        message_json = json.dumps(message)
                        channel.basic_publish(exchange=exchange_name, routing_key=routing_key_name, body=message_json)
                        print(" [x] Sent %r:%r" % (routing_key_name, message_json))
                        last_motion_message = 0
            if last_motion_message==1 and timer > 0:
                timer = timer - 1
                print("Timer: " + str(timer))
        time.sleep(1)
    except IOError:
        print ("Error")
        connection.close()