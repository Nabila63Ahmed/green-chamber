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

# Specify the exchange and routing key for temperature and humidity
exchange_name = 'sensors-exchange'
routing_key_temperature = 'sensors.temperature'
routing_key_humidity = 'sensors.humidity'

port=7
sensor=0

# In an infinity loop temperature and humidity are gathered simultaneously from the sensor every 30 seconds
# The gathered values are published to the broker together with the current date
while True:
    [temperature,humidity]= grovepi.dht(port, sensor)
    print("Temperature = %.02f C, humidity = %.02f %%"%(temperature,humidity))
    now = int(round(time.time() * 1000)) # Current time in miliseconds
    message_temp = {
            "value": temperature,
            "createdAt": now
            }
    message_temp_json = json.dumps(message_temp)
    channel.basic_publish(exchange=exchange_name, routing_key=routing_key_temperature, body=message_temp_json)

    message_hum = {
            "value": humidity,
            "createdAt": now
            }
    message_hum_json = json.dumps(message_hum)
    channel.basic_publish(exchange=exchange_name, routing_key=routing_key_humidity, body=message_hum_json)

    time.sleep(30)