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
		$('container').classList.toggle('o-turn')
	};

	this.checkWin = function(grid) {
		if (
			(grid[0] !== null && grid[0] == grid[1] && grid[1] == grid[2]) ||
			(grid[3] !== null && grid[3] == grid[4] && grid[4] == grid[5]) ||
			(grid[6] !== null && grid[6] == grid[7] && grid[7] == grid[8]) ||
			(grid[0] !== null && grid[0] == grid[3] && grid[3] == grid[6]) ||
			(grid[1] !== null && grid[1] == grid[4] && grid[4] == grid[7]) ||
			(grid[2] !== null && grid[2] == grid[5] && grid[5] == grid[6]) ||
			(grid[0] !== null && grid[0] == grid[4] && grid[4] == grid[8]) ||
			(grid[2] !== null && grid[2] == grid[4] && grid[4] == grid[6])
		) {return true}
		else {return false}
	}
}

function markMacro(macro) {
	const marker = document.createElement('span')
	marker.classList.add('macro-marker');
	if (game.xTurn) {
		macro.classList.add('macro-finished-x');
		marker.textContent = 'X';
	} else {
		macro.classList.add('macro-finished-o');
		marker.classList.add('macro-marker-o');
		marker.textContent = 'O';
	}
	[...macro.children].forEach(micro => {
		micro.classList.add('transparent-cell');
		micro.classList.add('marked');
	});
	macro.appendChild(marker);
}

function playerMove(cell) {
	const id = [cell.id[5], cell.id[7]]
	if (game.fullBoard[id[0]][id[1]] == null) {
		game.fullBoard[id[0]][id[1]] = game.player;
		const marker = cell.children[0]
		marker.textContent = game.player;
		cell.classList.add('marked');
		if (game.xTurn) {
			marker.classList.add('marker-x');
		} else {
			marker.classList.add('marker-o');
		}
		if (game.checkWin(game.fullBoard[id[0]])) {
			game.macroBoard[id[0]] = game.player;
			markMacro($(`macro${id[0]}`));
			if (game.checkWin(game.macroBoard)) {
				console.log("somebody won");
			}
		}
		game.changeTurn();
	} else {
		console.log('you already played there you nincompoop!!!!')
	}
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
