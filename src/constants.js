'use strict'

module.exports = {
  NORTHWEST: 0,
  NORTH: 1,
  NORTHEAST: 2,
  WEST: 3,
  EAST: 4,
  SOUTHWEST: 5,
  SOUTH: 6,
  SOUTHEAST: 7,
  trans: {
    0: [-1, -1],
    1: [-1,  0],
    2: [-1,  1],
    3: [ 0, -1],
    4: [ 0,  1],
    5: [ 1, -1],
    6: [ 1,  0],
    7: [ 1, -1]
  }
}
