from plugwise.api import *
import grovepi
import time

port=7
sensor=0
DEFAULT_PORT= "/dev/ttyUSB0"
mac= "000D6F0004B1E59E"

stick= Stick(DEFAULT_PORT)
circle=Circle(mac, stick)

while True:
    [temperature,humidity]= grovepi.dht(port, sensor)

    if temperature >= 27.1:
        print("Temperature = %.02f C, humidity = %.02f %%"%(temperature,humidity))
        circle.switch_on()
        print("Fan has turned on")

    elif temperature <27:
        print("Temperature = %.02f C, humidity = %.02f %%"%(temperature,humidity))
        circle.switch_off()
        print("Fan has switched off")
