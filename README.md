Versatimer
===========

A generic timer for recurring rounds for your web browser (javascript) with acoustic alarms. Based on [Round-Timer](https://github.com/mciocca/Round-Timer).

## Default behavior

Unless you turn it off, a session starts with a 10 seconds preparation with the main counter colored yellow. It plays the bell sound at the end of the preparation.

It shows the number of remaining uncompleted rounds in the rounds panel and the time left in the current round in the counter in the initial color (grey). If the round duration is more than 10 seconds and the remaining time reaches 10 seconds, it plays the ten sound. At the end of a round, it plays the gong sound.

After a round, if it’s not the last round, it switches to rest and shows the rest time left in the counter colored red. It already decrements the remaining rounds counter at the beginning of a rest. Reaching 10 remaining rest time, it plays the ten sound.

At the end of a session, it shows an alert and shows again the total rounds in the rounds counter and round duration in the main counter.

## Changes after the fork from the original Round-Timer

* add progress bar
* fixed display formatting bugs
* reduced code duplications
* get rid of custom css and use [bootstrap](http://getbootstrap.com) (responsive!)
* option to turn off preparation time
* stop button resets the timer cleanly

## Ideas for future changes

* direct textual input of round numbers and times
* define more flexible routines
* select from predefined routines

## Contribution

I’m always glad to see pull requests from you!

## License

This project still contains some contents (some code of the original project) where license is unclear, so they will be removed and I’ll add a proper license here! (probably [GNU GPL](http://www.gnu.org/licenses/gpl.html))

### Sounds

* [sounds/alert.mp3](alert.mp3): ["message.mp3"](http://freesound.org/people/Kastenfrosch/sounds/162463/) by Kastenfrosch, licensed under the [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
* [sounds/bell.mp3](bell.mp3): ["Ding.mp3"](http://freesound.org/people/payattention/sounds/80997/) by payattention, licensed under the [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
* [sounds/gong.mp3](gong.mp3): ["Bong.mp3"](http://freesound.org/people/SuperDaveOsbourne/sounds/63643/) by SuperDaveOsbourne, licensed under the [Creative Commons 0 License](http://creativecommons.org/publicdomain/zero/1.0/).
