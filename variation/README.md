# Pelicans Study, another attempt 6/3/23 (Javascript)

### Goal

The goal of this project is to still creating the phenomenon of
v-formation flocking. The lead "bird" will be followed slightly behind
and to the left and right by follower birds.  The lead bird will
"tire" and fall back, letting other birds take the lead for a while.

### This variation

In this variation, I will use a spring mass model to "tractor-beam" in and stabilize follower birds,
and the lead bird will use a different steering model: turn, then propel, then coast, then turn, then repeat.

See original Daniel Schiffman explanation of these mechanisms from
Nature of Code series,
[here](https://www.youtube.com/watch?v=ujsR2vcJlLk).


