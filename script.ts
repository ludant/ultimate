"use strict";

function $(id) {
	return document.getElementById(id);
}

document.getElementById('newOfflineGameBtn').addEventListener('click', newOfflineGame);

function setBoard() {
	const board = $('board')
	for (let i = 0; i < 9; i++) {
		const macro = document.createElement('div');
		macro.classList.add('macro-cell', 'board');
		macro.id = `macro${i}`;
		board.appendChild(macro);
		for (let j = 0; j < 9; j++) {
			const micro = document.createElement('div');
			micro.classList.add('micro-cell');
			micro.id = `micro${i}-${j}`;
			macro.appendChild(micro);
			micro.addEventListener('click', () => playerMove(micro));
			const span = document.createElement('span');
			span.classList.add('micro-cell-marker');
			micro.appendChild(span);
		}
		$(`micro${i}-4`).classList.add('micro-center')
		$(`micro${i}-3`).classList.add('micro-horizontal')
		$(`micro${i}-5`).classList.add('micro-horizontal')
		$(`micro${i}-1`).classList.add('micro-vertical')
		$(`micro${i}-7`).classList.add('micro-vertical')
	}
	$(`macro4`).classList.add('macro-center')
	$(`macro3`).classList.add('macro-horizontal')
	$(`macro5`).classList.add('macro-horizontal')
	$(`macro1`).classList.add('macro-vertical')
	$(`macro7`).classList.add('macro-vertical')
}

function Game() {
	this.xTurn = true;
	this.player = 'X';
	this.fullBoard = [
		[null, null, null, null, null, null, null, null, null], 
		[null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null, null]
	];
	this.macroBoard = 
		[null, null, null, null, null, null, null, null, null];

	this.changeTurn = function() {
		this.xTurn = !this.xTurn;
		this.changePlayer();
	};

	this.changePlayer = function() {
		if (this.xTurn) {
			this.player = 'X';
		} else {
			this.player = 'O';
		};
		$('container').classList.toggle('x-turn')
		$('container').classList.toggle('y-turn')
	};
}

function playerMove(cell) {
	if (!cell.classList.contains('marked')) {
		let id = [Number(cell.id[5]), Number(cell.id[7])];
		game.fullBoard[id[0]][id[1]] = game.player;
		cell.children[0].textContent = game.player;
		cell.classList.add('marked');
		game.changeTurn();
	} else {console.log('you already played there you nincompoop!!!!')}
}

function newOfflineGame() {
	game = new Game();
	$('container').classList.add('x-turn');
	boardEmpty();
	setBoard();
}

function boardEmpty() {
	$('board').remove()
	const board = document.createElement('div');
	board.id = 'board';
	board.classList.add('board');
	$('boardContainer').append(board);
}

// init
setBoard();
let game = null
