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
motion=0
grovepi.pinMode(pir_sensor,"INPUT")

while True:
    try:
        motion=grovepi.digitalRead(pir_sensor)
        if motion==0 or motion==1:
            now = int(round(time.time() * 1000)) # Current time in miliseconds
            if motion==1:
                message = {
                        "value": 1,
                        "createdAt": now
                        }
                message_json = json.dumps(message)
                print ('Motion Detected')
            else:
                message = {
                        "value": 0,
                        "createdAt": now
                        }
                message_json = json.dumps(message)
                print ('-')
            channel.basic_publish(exchange=exchange_name, routing_key=routing_key_name, body=message_json)
            print(" [x] Sent %r:%r" % (routing_key_name, message_json))
        time.sleep(5)
        print(motion)
    except IOError:
        print ("Error")
        connection.close()
