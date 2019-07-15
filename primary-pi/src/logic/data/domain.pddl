(define (domain green-chamber)

 (:requirements
    :adl
    :typing
    :fluents
  )

 (:types
    sensor plugwise calendar - object
    temperature humidity motion - sensor
    lamp fan - plugwise
  )

 (:predicates
    (on ?a - plugwise)
    (movement ?m - motion)
    (meeting ?c - calendar)
    (comfort)
    (efficiency)
  )

 (:functions
    (current_temperature) - number
    (current_humidity) - number)

 (:action switch-on-lamp
    :parameters (?l - lamp ?m - motion ?c - calendar)
    :precondition (and (not (on ?l)) (or (movement ?m) (meeting ?c)))
    :effect (and (on ?l) (efficiency))
  )

 (:action switch-off-lamp
    :parameters (?l - lamp ?m - motion ?c - calendar)
    :precondition (and (on ?l) (not (movement ?m)) (not (meeting ?c)))
    :effect (and (not (on ?l)) (efficiency))
  )

 (:action switch-on-fan
    :parameters (?f - fan ?c - calendar ?m - motion)
    :precondition (and (not (on ?f))
                       (or (meeting ?c) (movement ?m))
                       (or (> (current_temperature) 25) (> (current_humidity) 50)))
    :effect (and (on ?f) (comfort))
  )

 (:action switch-off-fan
    :parameters (?f - fan ?c - calendar ?m - motion)
    :precondition (and (on ?f)
                       (or (and (not (movement ?m)) (not (meeting ?c)))
                           (and (<= (current_temperature) 25) (<= (current_humidity) 50))))
    :effect (and (not (on ?f)) (comfort))
  )

  (:action do-nothing-comfort
     :parameters (?f - fan ?m - motion ?c - calendar)
     :precondition (or (and (or (meeting ?c) (movement ?m)) (or (> (current_temperature) 25) (> (current_humidity) 50)) (on ?f))
                       (and (<= (current_temperature) 25) (<= (current_humidity) 50) (not (on ?f)))
                       (and (not (movement ?m)) (not (meeting ?c)) (not (on ?f))))
     :effect (and (comfort))
   )

   (:action do-nothing-efficiency
      :parameters (?l - lamp ?m - motion ?c - calendar)
      :precondition (or (and (not (movement ?m)) (not (meeting ?c)) (not (on ?l)))
                        (and (or (movement ?m) (meeting ?c)) (on ?l)))
      :effect (and (efficiency))
    )
)
