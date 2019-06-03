import pika

connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

channel.exchange_declare(exchange='topic_data', exchange_type='topic')

result = channel.queue_declare('', exclusive=True)
queue_name = result.method.queue

channel.queue_bind(exchange='topic_data', queue=queue_name, routing_key='sensor.pir')

print(' [*] Waiting for logs. To exit press CTRL+C')

def callback(ch, method, properties, body):
    print(" [x] %r:%r" % (method.routing_key, body))
    channel.basic_publish(exchange='topic_data', routing_key='actuator.lcd', body='Room occupied!!!')
    channel.basic_publish(exchange='topic_data', routing_key='actuator.plugwise+', body='1')
    print(" [x] Sent 'actuator.lcd' and 'actuator.plugwise+'")

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

channel.start_consuming()
