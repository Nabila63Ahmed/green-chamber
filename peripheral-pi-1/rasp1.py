from grove_rgb_lcd import *

setText("Hello world\nLCD test")
setRGB(0,128,64)

# Slowly change the colors every 0.01 seconds.
for c in range(0,255):
    setRGB(c,255-c,0)
    time.sleep(0.01)

setRGB(0,255,0)
setText("Bye bye, this should wrap")
