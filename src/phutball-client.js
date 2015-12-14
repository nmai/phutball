'use strict'

let C = require('./constants')
let array2d = require('array2d')

// ignore, this is a quick hack to please ESLint
let JGO = window.JGO

let jboard = new JGO.Board(15, 19)
let jsetup = new JGO.Setup(jboard, JGO.BOARD.mediumBW)
let selected = new JGO.Coordinate()
let oneTurn = true  // is player 1's turn

// CLEANUP.
global.jboard = jboard
global.jsetup = jsetup
global.array2d = array2d
global.C = C

let mDiv = document.getElementById('message')

setMsg("Player 1's turn. Click anywhere to place a unit.")

jsetup.create('board', function(canvas) {
  jboard.setType(new JGO.Coordinate(7,9), JGO.WHITE)

  canvas.addListener('click', function(coord) {
    let type = jboard.getType(coord)
    if (type === 0) {
      placeBlack(coord)
      switchTurns()
    } else if (type === 2) {
      // white unit clicked
      // calculate possible moves, if any, and draw targets
    }
    // we can ignore clicks on black stones
  })

  // For aesthetic and UX purposes. Selections have no effect on game logic.
  canvas.addListener('mousemove', function(coord) {
    unselect(selected)
    if (onBoard(coord) === true) {
      let type = jboard.getType(coord)

      if (type === JGO.CLEAR) {
        selected = coord
        select(coord)
      }
    }
  })
})

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
		
		console.log(cvec)
		
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

global.calculateMoves = calculateMoves

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

function setMsg (msg) {
  mDiv.innerHTML = msg
}

function select (coord) {
  jboard.setMark(coord, JGO.MARK.SELECTED)
}

function unselect (coord) {
  jboard.setMark(coord, JGO.MARK.NONE)
}

function placeBlack (coord) {
  jboard.setType(coord, JGO.BLACK)
}

function switchTurns () {
  oneTurn = !oneTurn
  let pNum = oneTurn ? 1 : 2
  setMsg('Player ' + pNum + "'s turn. Click anywhere to place a unit.")
}
