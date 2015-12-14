(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

// ignore, this is a quick hack to please ESLint

var JGO = window.JGO;

var jboard = new JGO.Board(15, 19);
var jsetup = new JGO.Setup(jboard, JGO.BOARD.medium);
var selected = new JGO.Coordinate();
var oneTurn = true; // is player 1's turn

// CLEANUP.
global.jboard = jboard;
global.jsetup = jsetup;

var mDiv = document.getElementById('message');
function setMsg(msg) {
  mDiv.innerHTML = msg;
}

function select(coord) {
  jboard.setMark(coord, JGO.MARK.SELECTED);
}

function unselect(coord) {
  jboard.setMark(coord, JGO.MARK.NONE);
}

function placeBlack(coord) {
  jboard.setType(coord, JGO.BLACK);
}

function switchTurns() {
  oneTurn = !oneTurn;
  var pNum = oneTurn ? 1 : 2;
  setMsg("Player " + pNum + "'s turn. Click anywhere to place a unit.");
}

// selects an array of coords representing possible moves
function drawTargets(coords) {}

setMsg("Player 1's turn. Click anywhere to place a unit.");

jsetup.create('board', function (canvas) {
  jboard.setType(new JGO.Coordinate(7, 9), JGO.WHITE);

  canvas.addListener('click', function (coord, ev) {
    var type = jboard.getType(coord);
    console.log(type);
    if (type === 0) {
      placeBlack(coord);
      switchTurns();
    } else if (type === 2) {}
    // white unit clicked
    // calculate possible moves, if any, and draw targets

    // we can ignore clicks on black stones
  });

  // mostly for aesthetic and UX purposes
  canvas.addListener('mousemove', function (coord, ev) {
    unselect(selected);
    if (jboard.getType(coord) === JGO.CLEAR) {
      selected = coord;
      select(coord);
    }
  });
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
