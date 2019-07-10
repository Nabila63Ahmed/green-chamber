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
   (on fanO)
   (movement motionO)
   (meeting calendarO))

  (:goal
    (and (on lampO)
          (occupied lcdO)
          (not (on fanO)))))
