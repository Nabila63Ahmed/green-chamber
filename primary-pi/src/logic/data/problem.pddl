(define (problem problem-green-chamber)
  (:domain green-chamber)

  (:objects
     cal - calendar
     temp - temperature
     hum - humidity
     mot - motion
     s - lcd
     l - lamp
     f - fan
  )

  (:init (on f)
         (movement mot)
         (meeting cal)
  )

  (:goal (and (on l) (occupied s) (not (on f))))
)
