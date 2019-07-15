from grove_rgb_lcd import *
import pika
import json
from config import *

# Build a connection to the broker using the data from the configuration file
credentials = pika.PlainCredentials(username, password)
connection = pika.BlockingConnection(pika.ConnectionParameters(ip, port, host, credentials))
channel = connection.channel()

# Specify the exchange, routing key and queue for LCD screen
exchange_name = 'actuators-exchange'
routing_key_name = 'actuators.lcd'
queue_name = 'actuators.lcd.queue'

channel.queue_declare(queue_name, durable=True, exclusive=True)
channel.queue_bind(exchange=exchange_name, queue=queue_name, routing_key=routing_key_name)
print(' [*] Waiting for logs. To exit press CTRL+C')

# Show the received message on the screen
def callback(ch, method, properties, body):  
    message = body.decode()
    message_JSON = json.loads(message)
    print(" [x] %r:%r" % (method.routing_key, message_JSON))
    setRGB(0,255,0)
    setText(message_JSON['value'])

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

channel.start_consuming()
