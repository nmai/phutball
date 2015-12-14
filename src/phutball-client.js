'use strict'

let C = require('./constants')
let array2d = require('array2d')

// ignore, this is a quick hack to please ESLint
let JGO = window.JGO

let jboard = new JGO.Board(15, 19)
let jsetup = new JGO.Setup(jboard, JGO.BOARD.mediumBW)
let selected = new JGO.Coordinate()

let gameOver = false
let whiteCoord = new JGO.Coordinate(7,9)
let whiteMoving = false   // if white has been clicked but not placed
let whiteMoves = {}
whiteMoves.targets = []   // only accessed if whiteMoving is true
whiteMoves.jumped = []    // should be a 1:1 map of target array. or we're screwed.

let mDiv = document.getElementById('message')
let prompt1 = document.getElementById('prompt1')
let prompt2 = document.getElementById('prompt2')
let oneTurn = true
updateMessage()

// relies on all game options/vars to be already initialized
function launchGame () {
  jsetup.create('board', function(canvas) {
    jboard.setType(whiteCoord, JGO.WHITE)

    canvas.addListener('click', function(coord) {
      // Restart the game and wait for another click.
      if (gameOver) {
        restart()
        return
      }

      let type = jboard.getType(coord)
      if (!whiteMoving) {
        if (type === 0) {
          placeBlack(coord)
          switchTurns()
        } else if (type === 2) {
          // White unit clicked.
          // Calculate possible moves, if any, and draw targets

          let kim = calculateMoves(coord)
          if (kim.length > 0) {
            whiteMoving = true
            updateMessage()

            for (let possible in kim) {
              whiteMoves.targets.push( kim[possible].dest )
              whiteMoves.jumped.push( kim[possible].jumped )
            }

            renderMoves()
          }
        }
      } else {
        /* gamestate: white is about to make a move.
         * 2 scenarios:
         *  - click on invalid destination (cancel move)
         *  - click on valid destination (move, switch turns)
         */          
        if (isValidMove(coord)) {
          let relation = onBoard(coord)
          let isP1t = C.target.p1(coord), isP2t = C.target.p2(coord)

          if (relation === true) {
            if (isP1t || isP2t)
              gameOver = true
            
            destroyJumped(coord)

            clearMoves()

            // Move the white stone
            jboard.setType(whiteCoord, JGO.CLEAR)
            whiteCoord = coord
            jboard.setType(whiteCoord, JGO.WHITE)

            whiteMoving = false
            updateMessage()
          } else {
            // We have a winner, and it's off the board.
            // Now we need to calculate the nearest jump target.
            let tComp = isP1t ? C.target.p1 : C.target.p2
            let possible = []
            whiteMoves.targets.map((c) => {
              if (tComp(coord) && tComp(c))
                possible.push(c)
            })

            // Only 1 possible move? Simple.
            if (possible.length === 1) {
              destroyJumped(coord)
            } else {
              let lowestDist = void(0)
              let closestCoord = possible[0]
              possible.map((c) => {
                if (lowestDist === void(0)) {
                  lowestDist = array2d.euclidean([], c.i, c.j, coord.i, coord.j)
                } else {
                  let tempDist = array2d.euclidean([], c.i, c.j, coord.i, coord.j)
                  if (tempDist < lowestDist) {
                    lowestDist = tempDist
                    closestCoord = c
                  }
                }
              })
              destroyJumped(closestCoord)
            }

            clearMoves()
            jboard.setType(whiteCoord, JGO.CLEAR)
            whiteCoord = JGO.Coordinate (-2, -2)
            whiteMoving = false

            gameOver = true
          }

          if (gameOver) {
            if (C.target.p1(coord)) {
              setMsg(C.msg.win1)
            } else {
              setMsg(C.msg.win2)
            }
            prompt1.style.display = 'none'
            prompt2.style.display = 'none'
          } else {
          // Continue on with the game.
          switchTurns()
          }
        } else {
          whiteMoving = false
          updateMessage()
          clearMoves()
        }
      }
    })

    // For aesthetic and UX purposes. Selections have no effect on game logic.
    canvas.addListener('mousemove', function(coord) {
      unselect(selected)
      if (onBoard(coord) === true) {
        let type = jboard.getType(coord)

        if (!whiteMoving && type === JGO.CLEAR) {
          selected = coord
          select(coord)
        } else if (whiteMoving && type === JGO.DIM_WHITE) {
          selected = coord
          select(coord)
        }
      }
    })
  })
}

launchGame()

/* Pass in the matrix, coord, and direction.
 * returns an object containing the final destination,
 * and an array of all intermediate coordinates.
 * 
 * For our purposes, we assume the given loc. is valid and it will
 * be included in the list of jumped locations.
 *
 * Returns false if there is no possible jump destination.
 */
function jump (matrix, coord, dir) {
  let foundMax = false
  let jumped = []
  let dest = []
  let cvec = [coord.i, coord.j]
  while (!foundMax) {
    // perform transformation operation
    cvec = cvec.map((l, i) => { return l + C.trans[dir][i] })
    let relation = onBoard(new JGO.Coordinate(cvec[0], cvec[1]))
    
    if (relation !== false) {
      // Check if empty spot. If so, save cvec and break loop.
      dest = cvec
      if (relation === true) {
        if (matrix[cvec[0]][cvec[1]] === 0) {
          // Break loop without adding cvec to jumped.
          foundMax = true
        } else {
          // Add cvec to jumped and continue.
          jumped.push(cvec)
        }
      } else {
        // This is an off-board location (top or bottom).
        // Will never evaluate as a left/right loc because we captured
        // that case below.
        foundMax = true
      }
    } else {
      // We hit a horiz. boundary. Can't move here.
      return false
    }
  }
  
  return {
    dest: new JGO.Coordinate(dest[0], dest[1]),
    jumped: jumped.map((loc) => {
      return new JGO.Coordinate(loc[0],loc[1])
    })
  }
}

// returns an array of coords representing possible moves from a given coord
// returns empty array if no possible moves
function calculateMoves (coord) {
  // Convert the object representation to an array.
  let stones = jboard.getRaw().stones
  let board = []
  for (let row in stones) {
    let rowArr = []
    for (let col in stones[row])
      rowArr.push(stones[row][col])
    board.push(rowArr)
  }

  let neighbors = array2d.neighbors(board, coord.i, coord.j)
  let moves = []
  for (let i = 0; i < neighbors.length; i++) {
    if (neighbors[i] && neighbors[i] !== 0) {
      let m = jump(board, coord, i)
      if (m) 
        moves.push(m)
    }
  }
  
  return moves
}

/* Checks if given coord is on the board.
 * return true if on board
 * return false if horizontal (we don't care)
 * return 'top' if immediately above board
 * return 'bottom' if immediately below board
 *
 * COMPARE STRICTLY or the 2 bottom cases will evaluate to true.
 * This code is relatively efficient but not particularly safe.
 */
function onBoard (coord) {
  if (coord.j >= 19) {
    if (coord.j === 19)
      return 'bottom'
    else
      return false
  } else if (coord.j < 0) {
    if (coord.j === -1)
      return 'top'
    else
      return false
  } else if (coord.i >= 15 || coord.i < 0) {
    return false
  }

  return true
}

global.onBoard = onBoard

function setMsg (msg) {
  mDiv.innerHTML = msg
}

// Used for highlighting current selection (mouseover)
function select (coord) {
  jboard.setMark(coord, JGO.MARK.SELECTED)
}

function unselect (coord) {
  jboard.setMark(coord, JGO.MARK.NONE)
}

// Pass in the target coord. Will attempt to find it in current
// moves. If found, will clear respective set.
// NOTE: No optional support. Relies on whiteMoves. Come back to this.
function destroyJumped (target) {
  for (let c in whiteMoves.targets) {
    let coord = whiteMoves.targets[c]
    if (target.equals(coord)) {
      whiteMoves.jumped[c].map((intermediate) => {
        jboard.setType(intermediate, JGO.CLEAR)
      })
      return
    }
  }

  // was passed a bad target coord
  throw new Error('Bad target coordinate')
}

// Used for highlighting possible moves. Coords optional.
// Returns all moves that were rendered.
function renderMoves (coords) {
  let targets = coords ? coords : whiteMoves.targets
  let rendered = []
  targets.map((move) => {
    if (onBoard(move) === true) {
      rendered.push(move)
      jboard.setType(move, JGO.DIM_WHITE)
    }
  })
  return rendered
}

// Un-highlights possible moves. Also clears coord array.
function clearMoves (coords) {
  let targets = coords ? coords : whiteMoves.targets
  targets.map((move) => {
    if (onBoard(move) === true) {
      jboard.setType(move, JGO.CLEAR)
    }
  })
  whiteMoves.targets = []
  whiteMoves.jumped = []
}

// Checks if a coordinate is a valid move. Coords optional.
// This one's tricky: returns true if TOP or BOTTOM matches too.
function isValidMove (coord, coords) {
  let targets = coords ? coords : whiteMoves.targets
  for(let c in targets) {
    let move = targets[c]
    if (coord.equals(move)) {
      return true
    } else {
      let relation = onBoard(move)
      if (relation === 'bottom' || relation === 'top') {
        return true
      }
    }
  }
  return false
}

function placeBlack (coord) {
  jboard.setType(coord, JGO.BLACK)
}

function switchTurns () {
  oneTurn = !oneTurn
  whiteMoves.targets = []
  whiteMoves.jumped = []
  updateMessage()
}

function updateMessage () {
  if (gameOver) {
    prompt1.style.display = 'none'
    prompt2.style.display = 'none'
  } else {
    if (oneTurn) {
      prompt1.style.display = 'block'
      prompt2.style.display = 'none'
    } else {
      prompt1.style.display = 'none'
      prompt2.style.display = 'block'
    }
    if (whiteMoving)
      setMsg(C.msg.moving)
    else
      setMsg(C.msg.start)
  }
}

// a bit messy
function restart () {
  jboard.clear()
  selected = new JGO.Coordinate()

  gameOver = false
  whiteCoord = new JGO.Coordinate(7,9)
  whiteMoving = false   // if white has been clicked but not placed
  whiteMoves = {}
  whiteMoves.targets = []   // only accessed if whiteMoving is true
  whiteMoves.jumped = []    // should be a 1:1 map of target array. or we're screwed.
  oneTurn = true

  jboard.setType(whiteCoord, JGO.WHITE)
  updateMessage()
}
