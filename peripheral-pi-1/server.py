import pika

connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

exchange_name = 'sensors-exchange'
routing_key_name = 'sensors.motion'
queue_name = 'sensors.motion.queue'

channel.exchange_declare(exchange=exchange_name, exchange_type='topic')
channel.queue_declare(queue_name, durable=True, exclusive=True)

channel.queue_bind(exchange=exchange_name, queue=queue_name, routing_key=routing_key_name)

print(' [*] Waiting for logs. To exit press CTRL+C')

def callback(ch, method, properties, body):
    print(" [x] %r:%r" % (method.routing_key, body.decode()))
    channel.basic_publish(exchange='actuators-exchange', routing_key='actuators.lcd', body='Room occupied!!!')
    channel.basic_publish(exchange='actuators-exchange', routing_key='actuators.plugwise.lamp', body='0')
    print(" [x] Sent 'actuators.lcd' and 'actuators.plugwise.lamp'")

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

channel.start_consuming()
