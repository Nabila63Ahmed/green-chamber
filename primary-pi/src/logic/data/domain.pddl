(define (domain green-chamber)

 (:requirements 
    :strips 
    :typing
  )

 (:types
    sensor plugwise calendar lcd - object
    temperature humidity motion - sensor
    lamp fan - plugwise
  )

 (:predicates
    (on ?a - plugwise)
    (movement ?m - motion)
    (hot ?t - temperature)
    (damp ?h - humidity)
    (meeting ?c - calendar)
    (occupied ?s - lcd)
  )

 (:action switch-on-lamp
    :parameters (?l - lamp ?m - motion)
    :precondition (and (not (on ?l)) (movement ?m))
    :effect (on ?l)
  )

 (:action switch-off-lamp
    :parameters (?l - lamp ?m - motion)
    :precondition (and (on ?l) (not (movement ?m)))
    :effect (not (on ?l))
  )

 (:action switch-on-fan
    :parameters (?f - fan ?t - temperature ?h - humidity)
    :precondition (and (not (on ?f)) (hot ?t) (damp ?h))
    :effect (and (on ?f))
  )

 (:action switch-off-fan
    :parameters (?f - fan ?t - temperature ?h - humidity)
    :precondition (and (on ?f) (not (hot ?t)) (not (damp ?h)))
    :effect  (not (on ?f))
  )

 (:action show-occupied
    :parameters (?s - lcd ?m - motion ?c - calendar)
    :precondition (and (movement ?m) (meeting ?c))
    :effect (occupied ?s)
  )

 (:action show-free
    :parameters (?s - lcd ?m - motion ?c - calendar)
    :precondition (and (occupied ?s) (not (movement ?m)) (not (meeting ?c)))
    :effect (not (occupied ?s))
  )
)
