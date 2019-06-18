from grove_rgb_lcd import *
import pika

credentials = pika.PlainCredentials('admin', 'admin')
connection = pika.BlockingConnection(pika.ConnectionParameters('192.168.178.131', 5672, '/', credentials))
channel = connection.channel()

exchange_name = 'actuators-exchange'
routing_key_name = 'actuators.lcd'
queue_name = 'actuators.lcd.queue'

channel.exchange_declare(exchange=exchange_name, exchange_type='topic')
channel.queue_declare(queue_name, durable=True, exclusive=True)

channel.queue_bind(exchange=exchange_name, queue=queue_name, routing_key=routing_key_name)
print(' [*] Waiting for logs. To exit press CTRL+C')

def callback(ch, method, properties, body):
    message = body.decode()
    print(" [x] %r:%r" % (method.routing_key, message))
    setRGB(0,255,0)
    setText(message)

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

channel.start_consuming()
