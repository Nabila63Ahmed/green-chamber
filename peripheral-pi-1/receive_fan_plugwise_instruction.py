from plugwise.api import*
import pika

DEFAULT_PORT = "/dev/ttyUSB0"
mac = "000D6F0004B1E59E"

stick = Stick(DEFAULT_PORT)
circle = Circle(mac, stick)

credentials = pika.PlainCredentials('admin', 'admin')
connection = pika.BlockingConnection(pika.ConnectionParameters('192.168.178.131', 5672, '/', credentials))
channel = connection.channel()

exchange_name = 'actuators-exchange'
routing_key_name = 'actuators.plugwise.fan'
queue_name = 'actuators.plugwise.fan.queue'

channel.exchange_declare(exchange=exchange_name, exchange_type='topic')
channel.queue_declare(queue_name, durable=True, exclusive=True)

channel.queue_bind(exchange=exchange_name, queue=queue_name, routing_key=routing_key_name)
print(' [*] Waiting for logs. To exit press CTRL+C')

def callback(ch, method, properties, body):
    message = body.decode()
    print(" [x] %r:%r" % (method.routing_key, message))
    if message == '1':
        circle.switch_on()
    else:
        circle.switch_off()

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

channel.start_consuming()
