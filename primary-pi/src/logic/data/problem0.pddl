(define (problem problem-green-chamber)
  (:domain green-chamber)

  (:objects
   calendarO - calendar
   temperatureO - temperature
   humidityO - humidity
   motionO - motion
   lcdO - lcd
   lampO - lamp
   fanO - fan)

  (:init
   (= (current_temperature) 30)
   (= (current_humidity) 35)
   (meeting calendarO)
   (movement motionO))

  (:goal
    (and (comfort)
         (efficiency)
         (peace)
    )))
