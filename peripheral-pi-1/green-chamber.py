import threading
import time
import grovepi
import pika
import json
from config import *
from grove_rgb_lcd import *
from plugwise.api import*

# Used to build a connection to the broker with data from the configuration file
credentials = pika.PlainCredentials(username, password)

# Two exchanges are used for sensors and actuators
exchange_sensors = 'sensors-exchange'
exchange_actuators = 'actuators-exchange'

# Temperature and humidity thread class
# In an infinity loop temperature and humidity are gathered simultaneously from the sensor every 30 seconds
# The gathered values are published to the broker together with the current date
class temperature_humidity (threading.Thread):
   def __init__(self, threadID, name):
      threading.Thread.__init__(self)
      global ip
      global port
      global host
      global credentials
      self.threadID = threadID
      self.name = name
      self.temp_hum_port = 7
      self.temp_hum_sensor = 0
      self.routing_key_temperature = 'sensors.temperature'
      self.routing_key_humidity = 'sensors.humidity'
      self.connection = pika.BlockingConnection(pika.ConnectionParameters(ip, port, host, credentials))
      self.channel = self.connection.channel()
   def run(self):
      global grovepi
      global exchange_sensors
      while True:
          threadLock.acquire()
          [temperature,humidity] = grovepi.dht(self.temp_hum_port, self.temp_hum_sensor)
          threadLock.release()
          print("Temperature = %.02f C, humidity = %.02f %%"%(temperature,humidity))
          now = int(round(time.time() * 1000)) # Current time in miliseconds
          message_temp = {
                        "value": temperature,
                        "createdAt": now
                        }
          message_temp_json = json.dumps(message_temp)
          self.channel.basic_publish(exchange=exchange_sensors, routing_key=self.routing_key_temperature, body=message_temp_json)

          message_hum = {
                      "value": humidity,
                      "createdAt": now
                      }
          message_hum_json = json.dumps(message_hum)
          self.channel.basic_publish(exchange=exchange_sensors, routing_key=self.routing_key_humidity, body=message_hum_json)

          time.sleep(30)

# Motion thread class
# In an infinity loop motion data is gathered from the motion sensor every second.
# If a motion is registered and the last published value was not 1, value 1 is published immediately to the broker.
# In case the last published value was 1, a timer of 30 seconds is started.
# Every motion in the meantime starts the timer again.
# If there was no motion for 30 seconds, value 0 is published.
class motion (threading.Thread):
   def __init__(self, threadID, name):
      threading.Thread.__init__(self)
      global grovepi
      global ip
      global port
      global host
      global credentials
      self.threadID = threadID
      self.name = name
      self.pir_sensor = 8
      self.timer = 30
      self.last_motion_message = 0
      self.motion = 0
      self.routing_key_motion = 'sensors.motion'
      self.connection = pika.BlockingConnection(pika.ConnectionParameters(ip, port, host, credentials))
      self.channel = self.connection.channel()
      grovepi.pinMode(self.pir_sensor,"INPUT")
   def run(self):
      global grovepi
      global exchange_sensors
      while True:
          try:
              threadLock.acquire()
              self.motion=grovepi.digitalRead(self.pir_sensor)
              threadLock.release()
              if self.motion==0 or self.motion==1:
                  if self.motion==1:
                      print("Motion = 1")
                      if self.last_motion_message==0:
                          now = int(round(time.time() * 1000)) # Current time in miliseconds
                          message = {
                                  "value": 1,
                                  "createdAt": now
                                  }
                          message_json = json.dumps(message)
                          self.channel.basic_publish(exchange=exchange_sensors, routing_key=self.routing_key_motion, body=message_json)
                          print("---------- Sent %r:%r" % (self.routing_key_motion, message_json))
                          self.last_motion_message = 1
                          self.timer = 30
                      else:
                          self.timer = 30
                  else:
                      print("Motion = 0")
                      if self.last_motion_message==1:
                          if self.timer==0:
                              now = int(round(time.time() * 1000)) # Current time in miliseconds
                              message = {
                                      "value": 0,
                                      "createdAt": now
                                      }
                              message_json = json.dumps(message)
                              self.channel.basic_publish(exchange=exchange_sensors, routing_key=self.routing_key_motion, body=message_json)
                              print("---------- Sent %r:%r" % (self.routing_key_motion, message_json))
                              self.last_motion_message = 0
                  if self.last_motion_message==1 and self.timer > 0:
                      self.timer = self.timer - 1
                      print("Motion timer = " + str(self.timer) + "\n")
              time.sleep(1)
          except:
              print ("Error")
              self.connection.close()
              
# LCD thread class
# Consumes and shows the received messages on the LCD screen
class lcd (threading.Thread):
   def __init__(self, threadID, name):
      threading.Thread.__init__(self)
      global ip
      global port
      global host
      global credentials
      global exchange_actuators
      self.threadID = threadID
      self.name = name
      self.routing_key_lcd = 'actuators.lcd'
      self.queue_lcd = 'actuators.lcd.queue'
      self.connection = pika.BlockingConnection(pika.ConnectionParameters(ip, port, host, credentials))
      self.channel = self.connection.channel()
      self.channel.queue_declare(self.queue_lcd, durable=True, exclusive=True)
      self.channel.queue_bind(exchange=exchange_actuators, queue=self.queue_lcd, routing_key=self.routing_key_lcd)
      self.channel.basic_consume(queue=self.queue_lcd, on_message_callback=self.callback_lcd, auto_ack=True)
   def callback_lcd(self, ch, method, properties, body):
      message = body.decode()
      message_JSON = json.loads(message)
      threadLock.acquire()
      setRGB(0,255,0)
      setText(message_JSON['value'])
      threadLock.release()
      print("---------- Set LCD message %r" % message_JSON['value']) 
   def run(self):
      print("Waiting for LCD messages. To exit press CTRL+C")
      self.channel.start_consuming()
      
# Plugwise thread class for lamp and fan
# Turns the plugwise on or off, with the respect to the received instruction
class plugwise (threading.Thread):
   def __init__(self, threadID, name, mac, routing_key, queue, device_name):
      threading.Thread.__init__(self)
      global ip
      global port
      global host
      global credentials
      global exchange_actuators
      self.threadID = threadID
      self.name = name
      self.device_name = device_name
      self.default_port = "/dev/ttyUSB0"
      self.mac = mac
      self.stick = Stick(self.default_port)
      self.circle = Circle(self.mac, self.stick)
      self.circle.switch_off()
      self.routing_key_plugwise = routing_key
      self.queue_plugwise = queue
      self.connection = pika.BlockingConnection(pika.ConnectionParameters(ip, port, host, credentials))
      self.channel = self.connection.channel()
      self.channel.queue_declare(self.queue_plugwise, durable=True, exclusive=True)
      self.channel.queue_bind(exchange=exchange_actuators, queue=self.queue_plugwise, routing_key=self.routing_key_plugwise)
      self.channel.basic_consume(queue=self.queue_plugwise, on_message_callback=self.callback_plugwise, auto_ack=True)
   def callback_plugwise(self, ch, method, properties, body):
      message = body.decode()
      message_JSON = json.loads(message)
      if message_JSON['value'] == True:
        self.circle.switch_on()
        print("---------- %r is on" % self.device_name)
      else:
        self.circle.switch_off()
        print("---------- %r is off" % self.device_name)
   def run(self):
      print("Waiting for %r instructions. To exit press CTRL+C" % self.device_name)
      self.channel.start_consuming()

# The locker enables isolated access on the I2C bus
threadLock = threading.Lock()

# Create and starrt the threads
thread_lcd = lcd(1, "lcd_thread")
thread_lamp = plugwise(2, "plugwise_lamp_thread", "000D6F000567156D", "actuators.plugwise.lamp", "actuators.plugwise.lamp.queue", "LAMP")
thread_fan = plugwise(3, "plugwise_fan_thread", "000D6F0004B1E59E", "actuators.plugwise.fan", "actuators.plugwise.fan.queue", "FAN")
thread_temp_hum = temperature_humidity(4, "temperature_humidity_thread")
thread_motion = motion(5, "motion_thread")

thread_lcd.start()
thread_lamp.start()
thread_fan.start()
thread_temp_hum.start()
thread_motion.start()