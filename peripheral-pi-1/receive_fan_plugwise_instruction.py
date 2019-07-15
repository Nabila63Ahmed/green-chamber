from plugwise.api import*
import pika
import json
from config import *

DEFAULT_PORT = "/dev/ttyUSB0"
mac = "000D6F0004B1E59E" # MAC address of circle plugwise which contains the fan

# Initiate the circle and turn it off at start
stick = Stick(DEFAULT_PORT)
circle = Circle(mac, stick)
circle.switch_off()

# Build a connection to the broker using the data from the configuration file
credentials = pika.PlainCredentials(username, password)
connection = pika.BlockingConnection(pika.ConnectionParameters(ip, port, host, credentials))
channel = connection.channel()

# Specify the exchange, routing key and queue for the fan plugwise
exchange_name = 'actuators-exchange'
routing_key_name = 'actuators.plugwise.fan'
queue_name = 'actuators.plugwise.fan.queue'

channel.queue_declare(queue_name, durable=True, exclusive=True)
channel.queue_bind(exchange=exchange_name, queue=queue_name, routing_key=routing_key_name)
print(' [*] Waiting for logs. To exit press CTRL+C')

# Turn the plugwise on or off, with the respect to the received instruction
def callback(ch, method, properties, body):
    message = body.decode()
    message_JSON = json.loads(message)
    print(" [x] %r:%r" % (method.routing_key, message_JSON))
    if message_JSON['value'] == True:
        circle.switch_on()
    else:
        circle.switch_off()

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

channel.start_consuming()
