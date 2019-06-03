from plugwise.api import*
import pika

DEFAULT_PORT = "/dev/ttyUSB0"
mac = "000D6F000567156D"

stick = Stick(DEFAULT_PORT)
circle = Circle(mac, stick)

credentials = pika.PlainCredentials('admin', 'admin')
connection = pika.BlockingConnection(pika.ConnectionParameters('192.168.178.131', 5672, '/', credentials))
channel = connection.channel()

channel.exchange_declare(exchange='topic_data', exchange_type='topic')

result = channel.queue_declare('', exclusive=True)
queue_name = result.method.queue

channel.queue_bind(exchange='topic_data', queue=queue_name, routing_key='actuator.plugwise+')
print(' [*] Waiting for logs. To exit press CTRL+C')


def callback(ch, method, properties, body):
    print(" [x] %r:%r" % (method.routing_key, body))
    if body == '1':
        circle.switch_on()
    else:
        circle.switch_off()

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

channel.start_consuming()
