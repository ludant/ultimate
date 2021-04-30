"use strict";

function $(id) {
	return document.getElementById(id);
}

function Settings() {
	this.highlightOpponentCheckbox = $('highlightOpponentCheckbox');
}

function Session(clientName) {
	this.clientIDCreate = () => {
		return Math.floor(Math.random() * 2**40);
	}
	this.sessionIDCreate = () => {
		const id = []
		for (let i = 0; i < 3; i++) {
			id.push(Math.floor(Math.random() * 7413));
		}
		return id
	}
	this.chooseGuestName = () => {
		this.clientName = guestNames[Math.floor(Math.random() * guestNames.length)];
	}
	this.sessionCode = () => {
		let str = '';
		this.sessionID.forEach(code => {str = str + dicewareDict[code] + ' '})
		return str.trim()
	}
	this.sendNewSession = () => {
		const jsonMsg = {
			type: "newSession",
			username: this.clientName,
			userID: this.clientID,
			sessionID: this.sessionID
		};
		wsConnection.send(JSON.stringify(jsonMsg));
	}
	this.clientName = clientName
	this.clientID = this.clientIDCreate()
	this.sessionID = this.sessionIDCreate()
	this.clientIsXPlayer = true
	this.opponentName = null
	this.opponentConnected = false
}

function Game() {
	this.xTurn = true;
	this.inPlay = false;
	this.player = 'X';
	this.playerAllowed = true;
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
  
	this.newOfflineGame = () => {
		$('container').classList.add('x-turn');
		$('hiddenDiv').classList.add('last-move');
		$('textInfo').textContent = 'X plays first';
		this.boardClear();
		this.boardGenerate();
		this.markOpenMicroCells();
		this.inPlay = true
	}

	this.changeTurn = () => {
		this.xTurn = !this.xTurn;
		if (session.opponentConnected) {
			// probs do something idk
		}
		this.changePlayer();
	}

	this.changePlayer = () => {
		if (this.xTurn) {
			this.player = 'X';
		} else {
			this.player = 'O';
		};
		$('container').classList.toggle('x-turn')
		$('container').classList.toggle('o-turn')
	}

	// by using an input var instead of 'this', the func can be used on macro
	// and micro grid.  clever!!
	this.checkWin = (grid) => {
		let win = false
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
		) {win = true}
		return win
	}
	this.boardGenerate = () => {
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
					if (this.openSpaces[i] &&
							this.inPlay &&
						 settings.highlightOpponentCheckbox.checked) {
						this.highlightOpponentCell(j) 
					}
				});
				micro.addEventListener('click', () => this.playerMove(micro));
				const macroCells = document.querySelectorAll('.macro-cell');
				micro.addEventListener('mouseleave', () => {
					macroCells.forEach((cell) => {
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

	this.boardClear = () => {
		$('board').remove()
		const board = document.createElement('div');
		board.id = 'board';
		board.classList.add('board');
		$('innerRail').prepend(board);
	}

	this.closeMacroCells = (lastMove) => {
		const id = [lastMove[0], lastMove[1]]
		// if player is forced into an open macrogrid
		if (this.macroBoard[id[1]] == null) {
			this.openSpaces = this.openSpaces.map(x => false);
			this.openSpaces[id[1]] = true;
		} // if player is forced into a closed macrogrid
		else {
			for (let i = 0; i < 9; i++) {
				if (this.macroBoard[i] == null) {
					this.openSpaces[i] = true
				} else {
					this.openSpaces[i] = false
				}
			}
		}
		for (let i = 0; i < 9; i++) {
			const macroDiv = $(`macro${i}`)
			if (this.openSpaces[i] == macroDiv.classList.contains('closed')) {
				macroDiv.classList.toggle('closed')
			}
		}
	}
	this.highlightOpponentCell = (id) => {
		document.querySelectorAll('.macro-cell').forEach((cell) => {
			cell.classList.remove('opponent-highlight')
		});
		if (!this.macroBoard[id]) { 
			$(`macro${id}`).classList.add('opponent-highlight');
		} else { // else highlight all other open cells
			for (let i = 0; i < 9; i++) {
				if (!this.macroBoard[i]) { 
					$(`macro${i}`).classList.add('opponent-highlight');
				}
			}
		}
	}
	this.playerMove = (cell) => {
		const id = [Number(cell.id[5]), Number(cell.id[7])];
		if (this.fullBoard[id[0]][id[1]] !== null ||
				this.openSpaces[id[0]] == false) {
			console.log("you can't play there you nincompoop!")
		} else {
			this.fullBoard[id[0]][id[1]] = this.player;
			const marker = cell.children[0];
			marker.textContent = this.player;
			cell.classList.add('marked');
			[...document.querySelectorAll('.open')].forEach(cell => {
				cell.classList.remove('open');
			});
			if (this.xTurn) {
				marker.classList.add('marker-x');
			} else {
				marker.classList.add('marker-o');
			}
			let turnString = `${this.player} `;
			if (session.opponentConnected) {
				turnString += `(${session.clientName}) `;
			}
			$('textInfo').textContent = turnString + 'turn';
			if (this.checkWin(this.fullBoard[id[0]])) {
				this.macroBoard[id[0]] = this.player;
				this.markMacro($(`macro${id[0]}`));
				if (this.checkWin(this.macroBoard)) {
					this.gameWin = true;
					this.openSpaces = this.openSpaces.map(x => false);
					if (this.xTurn) {
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
			if (!this.gameWin) {
				this.closeMacroCells(id);
				this.markOpenMicroCells();
				this.changeTurn();
			}
		}
	}
	this.markOpenMicroCells = () => {
		for (let i = 0; i < 9; i++) {
			if (this.openSpaces[i]) {
				for (let j = 0; j < 9; j++) {
					if (this.fullBoard[i][j] == null) {
						$(`micro${i}-${j}`).classList.add('open');
					}
				}
			}
		}
	}
	this.markMacro = (macro) => {
		macro.classList.add('macro-finished');
		if (!this.xTurn) {
			this.classList.add('macro-finished-o');
		}
		macro.classList.add('closed');
		[...macro.children].forEach(micro => {
			micro.classList.add('transparent-cell');
			micro.classList.add('marked');
		});
	}
}

function showAlert(message, hideNoBtn, yesFunc=hideOverlay, noFunc=hideOverlay, yesLabel="yes", noLabel="no") {
	hideOverlay();
	$('alertOverlay').classList.remove('hidden');
	$('alertMessage').textContent = message;
	$('alertYesBtn').value = yesLabel
	$('alertNoBtn').value = noLabel
	$('alertYesBtn').addEventListener('click', yesFunc)
	$('alertNoBtn').addEventListener('click', noFunc)
	if (hideNoBtn) {
		$('alertNoBtn').classList.add('hidden');
	}
}

function fetchJsonAsset(url, store) {
	fetch(url)
		.then(res => res.json())
		.then(json => store = json);
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
	$('chatInput').value = null
}

function hideOverlay() {
	document.querySelectorAll('.overlay').forEach((overlay) => {
		overlay.classList.add('hidden');
	});
}

// there's a lot of them.  so let's make this an easy to fold section
function addEventListeners() {
	$('newOfflineGameBtn').addEventListener('click', () => {
		game = new Game();
		game.newOfflineGame();
	});
	//$('newOnlineGameBtn').addEventListener('click', () => {
	//	hideOverlay();
	//	$('signInOverlay').classList.remove('hidden');
	//});
	$('joinOnlineGameBtn').addEventListener('click', () => {
		hideOverlay();
		$('joinGameOverlay').classList.remove('hidden');
	});
	$('createOnlineGameBtn').addEventListener('click', () => {
		hideOverlay();
		$('createGameOverlay').classList.remove('hidden');
	});
	//$('guestEnter').addEventListener('click', () => {
	//	hideOverlay();
	//	$('guestOverlay').classList.remove('hidden');
	//});
	$('guestNoNameBtn').addEventListener('click', () => {
		session = new Session(null);
		session.chooseGuestName();
		$('usernameDisplay').textContent = 'guest: ' + session.clientName;
		$('sessionIDLabel').classList.remove('hidden');
		$('sessionIDDisplay').classList.remove('hidden');
		$('sessionIDDisplay').textContent = session.sessionCode();
		hideOverlay()
	});
	$('guestYesNameBtn').addEventListener('click', () => {
		session = new Session($('usernameInputField').value);
		$('usernameDisplay').textContent = 'guest: ' + session.clientName;
		$('sessionIDLabel').classList.remove('hidden');
		$('sessionIDDisplay').classList.remove('hidden');
		$('sessionIDDisplay').textContent = session.sessionCode();
		hideOverlay();
	});
	//$('tutorialBtn').addEventListener('click', () => {
	//	hideOverlay();
	//	showAlert(
	//		"i will write a real good tutorial soon in the mean time here you go https://en.wikipedia.org/wiki/Ultimate_tic-tac-toe",
	//		false,
	//	)
	//});
	$('chatSubmit').addEventListener('click', () => {
		chatSend($('chatInput').value, session.clientName);
	});
	$('joinSessionCancelBtn').addEventListener('click', () => {hideOverlay()});
	document.onkeyup = function(pressEvent) {
		if (document.activeElement == $('chatInput') &&
			 pressEvent.key == 'Enter') {
			chatSend($('chatInput').value.trim(), session.clientName);

		}
	};
}

function startGameWithBoardClick() {
	// this function needs to be called to pull the trick of removing the event  
	// listener which calls this function.
	game = new Game()
	game.newOfflineGame();
	$('board').removeEventListener('click', startGameWithBoardClick);
}

function main() {
	addEventListeners();
	game.boardGenerate();
	$('board').addEventListener('click', startGameWithBoardClick);
}

let dicewareDict = [];
let guestNames = [];

fetchJsonAsset('assets/diceware.json', dicewareDict)
fetchJsonAsset('assets/names.json', guestNames)

fetch('assets/diceware.json')
	.then(res => res.json())
	.then(json => dicewareDict = json);
fetch('assets/names.json')
	.then(res => res.json())
	.then(json => guestNames = json);

const wsUrl = 'ws://localhost:7565/';
const wsConnection = new WebSocket(wsUrl);

// the connection will connect without this func, but when i edit it later it
// might actually serve a purpose
//wsConnection.onopen = () => {}
//  wsConnection.send('begin connection') 
//}

wsConnection.onerror = (error) => {
  console.log(`WebSocket error: ${error}`)
}

wsConnection.onmessage = (msg) => {
	console.log(msg);
	const message = JSON.parse(msg.data);
	console.log(message.type);
	switch (message.type) {
		case 'chat':
			console.log('chat');
			chatWriteMessage(message);
			break;
		case 'connect':
			console.log('connect');
			break;
	}
}

// init
let session = new Session(null)
let settings = new Settings()
let game = new Game()

main()
