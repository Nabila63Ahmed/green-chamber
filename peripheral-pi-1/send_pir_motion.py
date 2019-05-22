import time
import grovepi
import pika

credentials = pika.PlainCredentials('admin', 'admin')
connection = pika.BlockingConnection(pika.ConnectionParameters('192.168.178.131', 5672, '/', credentials))
channel = connection.channel()

channel.exchange_declare(exchange='topic_data', exchange_type='topic')
routing_key = 'sensor.pir'
message = '1'

pir_sensor = 8
motion=0
grovepi.pinMode(pir_sensor,"INPUT")

while True:
	try:
		motion=grovepi.digitalRead(pir_sensor)
		if motion==0 or motion==1:
			if motion==1:
				print ('Motion Detected')
				channel.basic_publish(exchange='topic_data', routing_key=routing_key, body=message)
				print(" [x] Sent %r:%r" % (routing_key, message))
			else:
				print ('-')
		time.sleep(.5)
	except IOError:
		print ("Error")
		connection.close()
