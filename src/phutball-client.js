'use strict'

// ignore, this is a quick hack to please ESLint
let JGO = window.JGO

let jboard = new JGO.Board(15, 19)
let jsetup = new JGO.Setup(jboard, JGO.BOARD.medium)
let selected = new JGO.Coordinate()
let oneTurn = true  // is player 1's turn

// CLEANUP.
global.jboard = jboard
global.jsetup = jsetup

let mDiv = document.getElementById('message')
function setMsg(msg) {
  mDiv.innerHTML = msg
}

function select(coord) {
  jboard.setMark(coord, JGO.MARK.SELECTED)
}

function unselect(coord) {
  jboard.setMark(coord, JGO.MARK.NONE)
}

function placeBlack(coord) {
  jboard.setType(coord, JGO.BLACK)
}

function switchTurns() {
  oneTurn = !oneTurn
  let pNum = oneTurn ? 1 : 2
  setMsg("Player " + pNum + "'s turn. Click anywhere to place a unit.")
}

// selects an array of coords representing possible moves
function drawTargets(coords) {

}

setMsg("Player 1's turn. Click anywhere to place a unit.")

jsetup.create('board', function(canvas) {
  jboard.setType(new JGO.Coordinate(7,9), JGO.WHITE)

  canvas.addListener('click', function(coord, ev) {
    let type = jboard.getType(coord)
    console.log(type)
    if (type === 0) {
      placeBlack(coord)
      switchTurns()
    } else if (type === 2) {
      // white unit clicked
      // calculate possible moves, if any, and draw targets
    }
    // we can ignore clicks on black stones
  })

  // mostly for aesthetic and UX purposes
  canvas.addListener('mousemove', function(coord, ev) {
    unselect(selected)
    if (jboard.getType(coord) === JGO.CLEAR) {
      selected = coord
      select(coord)
    }
  })
})
