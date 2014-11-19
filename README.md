node-cm11a
==========

A node module for the X10 Smarthome interface aka CM11A and CP10.

The primary goal of this module is to get X10 events on and off the power line. Therefore standard transmission and reception are the first priority. Extended transmission and reception is the second priority. All other features of the CM11A and CP10, like macros and timers, are the lowest priority.

node-x10
========

A library to encapsulate the logic of the [X10 Protocol|http://en.wikipedia.org/wiki/X10_(industry_standard)]. Notably, converting addresses, house codes, unit codes and function codes from hexadecimal to standard JavaScript types including string and JSON.

Used to pipe X10 events between different modules, like from the W800 to the CM11A.

Needs to be broken out.