import time
import grovepi
import pika
import json
import time
from config import *

credentials = pika.PlainCredentials(username, password)
connection = pika.BlockingConnection(pika.ConnectionParameters(ip, port, host, credentials))
channel = connection.channel()

exchange_name = 'sensors-exchange'
routing_key_name = 'sensors.motion'

pir_sensor = 8
timer = 30
last_motion_message = 0
motion = 0
grovepi.pinMode(pir_sensor,"INPUT")

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
                    motion_in_between = False
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