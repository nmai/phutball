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
    7: [ 1,  1]
  },
  target: {
    p1: (c) => { return c.j < 1  ? true : false },
    p2: (c) => { return c.j > 17 ? true : false }
  },
  msg: {
    start: 'Click anywhere to place a black stone, or click on the white stone to move it.',
    moving: 'Click any of the highlighted locations to move the white stone. Click elsewhere to cancel.<br><br><b>Note:</b> If a possible move exists above or below the board, you may click anywhere outside the top or bottom boundary to win the game.',
    win1: 'Congratulations, <b>Player 1</b>! You win! Click anywhere on the board to restart.',
    win2: 'Congratulations, <b>Player 2</b>! You win! Click anywhere on the board to restart.'
  }
}
