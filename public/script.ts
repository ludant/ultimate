"use strict";

const wsUrl = 'ws://localhost:7565/';
const wsConnection = new WebSocket(wsUrl);

function $(id) {
	return document.getElementById(id);
}

$('newOfflineGameBtn').addEventListener('click', newOfflineGame);
//$('newOnlineGameBtn').addEventListener('click', () => {
//	hideOverlay();
//	$('signInOverlay').classList.remove('hidden');
//});
$('joinGameBtn').addEventListener('click', () => {
	hideOverlay();
	$('guestOverlay').classList.remove('hidden');
});
$('createOnlineGameBtn').addEventListener('click', () => {
	hideOverlay();
	$('guestOverlay').classList.remove('hidden');
});
//$('guestEnter').addEventListener('click', () => {
//	hideOverlay();
//	$('guestOverlay').classList.remove('hidden');
//});
//$('guestNoName').addEventListener('click', hideOverlay);
//$('guestYesName').addEventListener('click', () => {
//	hideOverlay();
//	const userSession = new UserSession();
//	userSession.xPlayer = "THIS IS NOT DONE";
//});
$('tutorialBtn').addEventListener('click', () => {
	hideOverlay();
	showAlert(
		"i will write a real good tutorial soon in the mean time here you go https://en.wikipedia.org/wiki/Ultimate_tic-tac-toe",
		false,
	)
});
$('chatSubmit').addEventListener('click', () => {
	chatSend($('chatInput').value, 'jesus');
});

wsConnection.onopen = () => {
  wsConnection.send('begin connection') 
}

wsConnection.onerror = (error) => {
  console.log(`WebSocket error: ${error}`)
}

wsConnection.onmessage = (msg) => {
	const message = JSON.parse(msg.data)
	switch (message.type) {
		case 'chat':
			chatWriteMessage(message);
			break;
		case 'connect':
			break;
	}
}

function UserSession() {
	this.xPlayer = null
	this.oPlayer = null
}

function hideOverlay() {
	document.querySelectorAll('.overlay').forEach((overlay) => {
		overlay.classList.add('hidden');
	});
}

function showAlert(message, binary, yesFunc=hideOverlay, noFunc=hideOverlay, yesLabel="yes", noLabel="no") {
	hideOverlay();
	$('alertOverlay').classList.remove('hidden');
	$('alertMessage').textContent = message;
	$('alertYesBtn').value = yesLabel
	$('alertNoBtn').value = noLabel
	$('alertYesBtn').addEventListener('click', yesFunc)
	$('alertNoBtn').addEventListener('click', noFunc)
	if (!binary) {
		$('alertNoBtn').classList.add('hidden');
	}
}

function Settings() {
	this.highlightOpponentCheckbox = $('highlightOpponentCheckbox');
}

function Game() {
	this.xTurn = true;
	this.player = 'X';
	this.gameWin = false;
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
	this.openSpaces = 
		[true, true, true, true, true, true, true, true, true];

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
			// horizontal check, top, mid, bottom, 
			(grid[0] !== null && grid[0] == grid[1] && grid[1] == grid[2]) ||
			(grid[3] !== null && grid[3] == grid[4] && grid[4] == grid[5]) ||
			(grid[6] !== null && grid[6] == grid[7] && grid[7] == grid[8]) ||
			// vertical check, left, center, right
			(grid[0] !== null && grid[0] == grid[3] && grid[3] == grid[6]) ||
			(grid[1] !== null && grid[1] == grid[4] && grid[4] == grid[7]) ||
			(grid[2] !== null && grid[2] == grid[5] && grid[5] == grid[8]) ||
			// diagonal check
			(grid[0] !== null && grid[0] == grid[4] && grid[4] == grid[8]) ||
			(grid[2] !== null && grid[2] == grid[4] && grid[4] == grid[6])
		) {return true}
		else {return false}
	}
}

function chatWriteMessage(json) {
	const div = document.createElement('div');
	const timestamp = document.createElement('span');
	const user = document.createElement('span');
	const message = document.createElement('span');
	div.appendChild(timestamp);
	div.appendChild(user);
	div.appendChild(message);
	//timestamp.classList.add('chat');
	//user.classList.add('chat');
	//message.classList.add('chat');
	const time = new Date(json.time)
	timestamp.textContent = `${time.toTimeString().slice(0, 5)}`
	user.textContent = `<${json.user}>  `;
	message.textContent = json.message;
	$('chatLog').appendChild(div);
}

function chatSend(msg, usr) {
	const json = {
		type: "chat",
		time: new Date(),
		message: msg,
		user: usr
	};
	wsConnection.send(JSON.stringify(json));
}

function setBoard() {
	const board = $('board');
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
			micro.addEventListener('mouseover', () => { 
				if (game.openSpaces[i] &&
					 settings.highlightOpponentCheckbox.checked) {
					highlightOpponentCell(j) 
				}
			});
			micro.addEventListener('click', () => playerMove(micro));
			micro.addEventListener('mouseleave', () => {
				document.querySelectorAll('.macro-cell').forEach((cell) => {
					cell.classList.remove('opponent-highlight')
				});
			});
			const span = document.createElement('span');
			span.classList.add('micro-cell-marker');
			micro.appendChild(span);
		}
		$(`micro${i}-4`).classList.add('micro-border');
		$(`micro${i}-3`).classList.add('micro-border', 'micro-horizontal');
		$(`micro${i}-5`).classList.add('micro-border', 'micro-horizontal');
		$(`micro${i}-1`).classList.add('micro-border', 'micro-vertical');
		$(`micro${i}-7`).classList.add('micro-border', 'micro-vertical');
	}
	$(`macro4`).classList.add('macro-border');
	$(`macro3`).classList.add('macro-border', 'macro-horizontal');
	$(`macro5`).classList.add('macro-border', 'macro-horizontal');
	$(`macro1`).classList.add('macro-border', 'macro-vertical');
	$(`macro7`).classList.add('macro-border', 'macro-vertical');
}

function highlightOpponentCell(id) {
	document.querySelectorAll('.macro-cell').forEach((cell) => {
		cell.classList.remove('opponent-highlight')
	});
	if (!game.macroBoard[id]) { 
		$(`macro${id}`).classList.add('opponent-highlight');
	} else { // else highlight all other open cells
		for (let i = 0; i < 9; i++) {
			if (!game.macroBoard[i]) { 
				$(`macro${i}`).classList.add('opponent-highlight');
			}
		}
	}
}

function markMacro(macro) {
	macro.classList.add('macro-finished');
	if (!game.xTurn) {
		macro.classList.add('macro-finished-o');
	}
	macro.classList.add('closed');
	[...macro.children].forEach(micro => {
		micro.classList.add('transparent-cell');
		micro.classList.add('marked');
	});
}

function playerMove(cell) {
	const id = [Number(cell.id[5]), Number(cell.id[7])];
	if (game.fullBoard[id[0]][id[1]] == null &&
			game.openSpaces[id[0]]
		 ){
		game.fullBoard[id[0]][id[1]] = game.player;
		const marker = cell.children[0];
		marker.textContent = game.player;
		cell.classList.add('marked');
		[...document.querySelectorAll('.open')].forEach(cell => {
			cell.classList.remove('open');
		});
		if (game.xTurn) {
			marker.classList.add('marker-x');
			$('textInfo').textContent = 'O turn';
		} else {
			marker.classList.add('marker-o');
			$('textInfo').textContent = 'X turn';
		}
		if (game.checkWin(game.fullBoard[id[0]])) {
			game.macroBoard[id[0]] = game.player;
			markMacro($(`macro${id[0]}`));
			if (game.checkWin(game.macroBoard)) {
				game.gameWin = true;
				game.openSpaces = game.openSpaces.map(x => false);
				if (game.xTurn) {
					$('container').classList.remove('x-turn')
					$('textInfo').textContent = 'X wins';
				} else {
					$('container').classList.remove('o-turn')
					$('textInfo').textContent = 'O wins';
				}
			}
		}
		document.querySelector('.last-move').classList.remove('last-move');
		cell.classList.add('last-move');
		if (!game.gameWin) {
			closeMacroCells(id);
			markOpenMicroCells();
			game.changeTurn();
		}
	} else {
		console.log("you can't play there you nincompoop!!!!")
	}
}

function closeMacroCells(lastMove) {
	const id = [lastMove[0], lastMove[1]]
	// if player is forced into an open macrogrid
	if (game.macroBoard[id[1]] == null) {
		game.openSpaces = game.openSpaces.map(x => false);
		game.openSpaces[id[1]] = true;
	} // if player is forced into a closed macrogrid
	else {
		for (let i = 0; i < 9; i++) {
			if (game.macroBoard[i] == null) {
				game.openSpaces[i] = true
			} else {
				game.openSpaces[i] = false
			}
		}
	}
	for (let i = 0; i < 9; i++) {
		const macroDiv = $(`macro${i}`)
		if (game.openSpaces[i] == macroDiv.classList.contains('closed')) {
			macroDiv.classList.toggle('closed')
		}
	}
}

function markOpenMicroCells() {
	for (let i = 0; i < 9; i++) {
		if (game.openSpaces[i]) {
			for (let j = 0; j < 9; j++) {
				if (game.fullBoard[i][j] == null) {
					$(`micro${i}-${j}`).classList.add('open');
				}
			}
		}
	}
}

function newOfflineGame() {
	game = new Game();
	$('container').classList.add('x-turn');
	$('hiddenDiv').classList.add('last-move');
	$('textInfo').textContent = 'X plays first';
	boardEmpty();
	setBoard();
	markOpenMicroCells();
}

function boardEmpty() {
	$('board').remove()
	const board = document.createElement('div');
	board.id = 'board';
	board.classList.add('board');
	$('innerRail').prepend(board);
}

function initialGameStart() {
	// i believe this function needs to be called to pull the trick of removing the event listener which calls this function.
	newOfflineGame();
	$('board').removeEventListener('click', initialGameStart);
}

// init
const settings = new Settings()
settings.highlightOpponentCheckbox.checked = true
setBoard();
let game = null
$('board').addEventListener('click', initialGameStart);
