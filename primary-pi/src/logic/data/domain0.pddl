(define (domain green-chamber)

 (:requirements
    :adl
    :typing
    :fluents
  )

 (:types
    sensor plugwise calendar lcd - object
    temperature humidity motion - sensor
    lamp fan - plugwise
  )

 (:predicates
    (on ?a - plugwise)
    (movement ?m - motion)
    (meeting ?c - calendar)
    (occupied ?s - lcd)
    (comfort)
    (efficiency)
    (peace)
  )

 (:functions
    (current_temperature) - number
    (current_humidity) - number)

 (:action switch-on-lamp
    :parameters (?l - lamp ?m - motion)
    :precondition (and (not (on ?l)) (movement ?m))
    :effect (and (on ?l) (efficiency))
  )

 (:action switch-off-lamp
    :parameters (?l - lamp ?m - motion ?c - calendar)
    :precondition (and (on ?l) (not (movement ?m)) (not (meeting ?c)))
    :effect (and (not (on ?l)) (efficiency))
  )

 (:action switch-on-fan
    :parameters (?f - fan ?c - calendar ?m - motion)
    :precondition (and (not (on ?f)) (meeting ?c) (movement ?m) (or (> (current_temperature) 25) (> (current_humidity) 50)))
    :effect (and (on ?f) (comfort))
  )

 (:action switch-off-fan
    :parameters (?f - fan)
    :precondition (and (on ?f) (or (<= (current_temperature) 25) (<= (current_humidity) 50)))
    :effect (and (not (on ?f)) (comfort))
  )

 (:action show-occupied
    :parameters (?s - lcd ?m - motion ?c - calendar)
    :precondition (and (movement ?m) (meeting ?c))
    :effect (and (occupied ?s) (peace))
  )

 (:action show-free
    :parameters (?s - lcd ?m - motion ?c - calendar)
    :precondition (and (occupied ?s) (not (movement ?m)) (not (meeting ?c)))
    :effect (and (not (occupied ?s)) (peace))
  )

  (:action do-nothing
     :parameters (?l - lamp ?f - fan ?s - lcd ?m - motion ?c - calendar)
     :precondition (and (not (movement ?m))
                        (not (meeting ?c))
                        (not (on ?l))
                        (not (on ?f))
                        (not (occupied ?s)))
     :effect (and (comfort) (efficiency) (peace))
   )
)
