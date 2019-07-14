(define (problem problem-green-chamber)
  (:domain green-chamber)

  (:objects
   calendar_o - calendar
   temperature_o - temperature
   humidity_o - humidity
   motion_o - motion
   lamp_o - lamp
   fan_o - fan)

  (:init
   (= (current_temperature) 30)
   (= (current_humidity) 35)
   (meeting calendar_o)
   (movement motion_o))

  (:goal
    (and (comfort)
         (efficiency)
    )))
