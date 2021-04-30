"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
function $(id) {
    return document.getElementById(id);
}
function Settings() {
    this.highlightOpponentCheckbox = $('highlightOpponentCheckbox');
}
function Session(clientName) {
    var _this = this;
    this.clientIDCreate = function () {
        return Math.floor(Math.random() * Math.pow(2, 40));
    };
    this.sessionIDCreate = function () {
        var id = [];
        for (var i = 0; i < 3; i++) {
            id.push(Math.floor(Math.random() * 7413));
        }
        return id;
    };
    this.chooseGuestName = function () {
        _this.clientName = guestNames[Math.floor(Math.random() * guestNames.length)];
    };
    this.sessionCode = function () {
        var str = '';
        _this.sessionID.forEach(function (code) { str = str + dicewareDict[code] + ' '; });
        return str.trim();
    };
    this.sendNewSession = function () {
        var jsonMsg = {
            type: "newSession",
            username: _this.clientName,
            userID: _this.clientID,
            sessionID: _this.sessionID
        };
        wsConnection.send(JSON.stringify(jsonMsg));
    };
    this.clientName = clientName;
    this.clientID = this.clientIDCreate();
    this.sessionID = this.sessionIDCreate();
    this.clientIsXPlayer = true;
    this.opponentName = null;
    this.opponentConnected = false;
}
function Game() {
    var _this = this;
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
    this.newOfflineGame = function () {
        $('container').classList.add('x-turn');
        $('hiddenDiv').classList.add('last-move');
        $('textInfo').textContent = 'X plays first';
        _this.boardClear();
        _this.boardGenerate();
        _this.markOpenMicroCells();
        _this.inPlay = true;
    };
    this.changeTurn = function () {
        _this.xTurn = !_this.xTurn;
        if (session.opponentConnected) {
            // probs do something idk
        }
        _this.changePlayer();
    };
    this.changePlayer = function () {
        if (_this.xTurn) {
            _this.player = 'X';
        }
        else {
            _this.player = 'O';
        }
        ;
        $('container').classList.toggle('x-turn');
        $('container').classList.toggle('o-turn');
    };
    // by using an input var instead of 'this', the func can be used on macro
    // and micro grid.  clever!!
    this.checkWin = function (grid) {
        var win = false;
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
            (grid[2] !== null && grid[2] == grid[4] && grid[4] == grid[6])) {
            win = true;
        }
        return win;
    };
    this.boardGenerate = function () {
        var board = $('board');
        var _loop_1 = function (i) {
            var macro = document.createElement('div');
            macro.classList.add('macro-cell', 'board');
            macro.id = "macro" + i;
            board.appendChild(macro);
            var _loop_2 = function (j) {
                var micro = document.createElement('div');
                micro.classList.add('micro-cell');
                micro.id = "micro" + i + "-" + j;
                macro.appendChild(micro);
                micro.addEventListener('mouseover', function () {
                    if (_this.openSpaces[i] &&
                        _this.inPlay &&
                        settings.highlightOpponentCheckbox.checked) {
                        _this.highlightOpponentCell(j);
                    }
                });
                micro.addEventListener('click', function () { return _this.playerMove(micro); });
                var macroCells = document.querySelectorAll('.macro-cell');
                micro.addEventListener('mouseleave', function () {
                    macroCells.forEach(function (cell) {
                        cell.classList.remove('opponent-highlight');
                    });
                });
                var span = document.createElement('span');
                span.classList.add('micro-cell-marker');
                micro.appendChild(span);
            };
            for (var j = 0; j < 9; j++) {
                _loop_2(j);
            }
            $("micro" + i + "-4").classList.add('micro-border');
            $("micro" + i + "-3").classList.add('micro-border', 'micro-horizontal');
            $("micro" + i + "-5").classList.add('micro-border', 'micro-horizontal');
            $("micro" + i + "-1").classList.add('micro-border', 'micro-vertical');
            $("micro" + i + "-7").classList.add('micro-border', 'micro-vertical');
        };
        for (var i = 0; i < 9; i++) {
            _loop_1(i);
        }
        $("macro4").classList.add('macro-border');
        $("macro3").classList.add('macro-border', 'macro-horizontal');
        $("macro5").classList.add('macro-border', 'macro-horizontal');
        $("macro1").classList.add('macro-border', 'macro-vertical');
        $("macro7").classList.add('macro-border', 'macro-vertical');
    };
    this.boardClear = function () {
        $('board').remove();
        var board = document.createElement('div');
        board.id = 'board';
        board.classList.add('board');
        $('innerRail').prepend(board);
    };
    this.closeMacroCells = function (lastMove) {
        var id = [lastMove[0], lastMove[1]];
        // if player is forced into an open macrogrid
        if (_this.macroBoard[id[1]] == null) {
            _this.openSpaces = _this.openSpaces.map(function (x) { return false; });
            _this.openSpaces[id[1]] = true;
        } // if player is forced into a closed macrogrid
        else {
            for (var i = 0; i < 9; i++) {
                if (_this.macroBoard[i] == null) {
                    _this.openSpaces[i] = true;
                }
                else {
                    _this.openSpaces[i] = false;
                }
            }
        }
        for (var i = 0; i < 9; i++) {
            var macroDiv = $("macro" + i);
            if (_this.openSpaces[i] == macroDiv.classList.contains('closed')) {
                macroDiv.classList.toggle('closed');
            }
        }
    };
    this.highlightOpponentCell = function (id) {
        document.querySelectorAll('.macro-cell').forEach(function (cell) {
            cell.classList.remove('opponent-highlight');
        });
        if (!_this.macroBoard[id]) {
            $("macro" + id).classList.add('opponent-highlight');
        }
        else { // else highlight all other open cells
            for (var i = 0; i < 9; i++) {
                if (!_this.macroBoard[i]) {
                    $("macro" + i).classList.add('opponent-highlight');
                }
            }
        }
    };
    this.playerMove = function (cell) {
        var id = [Number(cell.id[5]), Number(cell.id[7])];
        if (_this.fullBoard[id[0]][id[1]] !== null ||
            _this.openSpaces[id[0]] == false) {
            console.log("you can't play there you nincompoop!");
        }
        else {
            _this.fullBoard[id[0]][id[1]] = _this.player;
            var marker = cell.children[0];
            marker.textContent = _this.player;
            cell.classList.add('marked');
            __spreadArrays(document.querySelectorAll('.open')).forEach(function (cell) {
                cell.classList.remove('open');
            });
            if (_this.xTurn) {
                marker.classList.add('marker-x');
            }
            else {
                marker.classList.add('marker-o');
            }
            var turnString = _this.player + " ";
            if (session.opponentConnected) {
                turnString += "(" + session.clientName + ") ";
            }
            $('textInfo').textContent = turnString + 'turn';
            if (_this.checkWin(_this.fullBoard[id[0]])) {
                _this.macroBoard[id[0]] = _this.player;
                _this.markMacro($("macro" + id[0]));
                if (_this.checkWin(_this.macroBoard)) {
                    _this.gameWin = true;
                    _this.openSpaces = _this.openSpaces.map(function (x) { return false; });
                    if (_this.xTurn) {
                        $('container').classList.remove('x-turn');
                        $('textInfo').textContent = 'X wins';
                    }
                    else {
                        $('container').classList.remove('o-turn');
                        $('textInfo').textContent = 'O wins';
                    }
                }
            }
            document.querySelector('.last-move').classList.remove('last-move');
            cell.classList.add('last-move');
            if (!_this.gameWin) {
                _this.closeMacroCells(id);
                _this.markOpenMicroCells();
                _this.changeTurn();
            }
        }
    };
    this.markOpenMicroCells = function () {
        for (var i = 0; i < 9; i++) {
            if (_this.openSpaces[i]) {
                for (var j = 0; j < 9; j++) {
                    if (_this.fullBoard[i][j] == null) {
                        $("micro" + i + "-" + j).classList.add('open');
                    }
                }
            }
        }
    };
    this.markMacro = function (macro) {
        macro.classList.add('macro-finished');
        if (!_this.xTurn) {
            _this.classList.add('macro-finished-o');
        }
        macro.classList.add('closed');
        __spreadArrays(macro.children).forEach(function (micro) {
            micro.classList.add('transparent-cell');
            micro.classList.add('marked');
        });
    };
}
function showAlert(message, hideNoBtn, yesFunc, noFunc, yesLabel, noLabel) {
    if (yesFunc === void 0) { yesFunc = hideOverlay; }
    if (noFunc === void 0) { noFunc = hideOverlay; }
    if (yesLabel === void 0) { yesLabel = "yes"; }
    if (noLabel === void 0) { noLabel = "no"; }
    hideOverlay();
    $('alertOverlay').classList.remove('hidden');
    $('alertMessage').textContent = message;
    $('alertYesBtn').value = yesLabel;
    $('alertNoBtn').value = noLabel;
    $('alertYesBtn').addEventListener('click', yesFunc);
    $('alertNoBtn').addEventListener('click', noFunc);
    if (hideNoBtn) {
        $('alertNoBtn').classList.add('hidden');
    }
}
function fetchJsonAsset(url, store) {
    fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (json) { return store = json; });
}
function chatWriteMessage(json) {
    var div = document.createElement('div');
    var timestamp = document.createElement('span');
    var user = document.createElement('span');
    var message = document.createElement('span');
    div.appendChild(timestamp);
    div.appendChild(user);
    div.appendChild(message);
    //timestamp.classList.add('chat');
    //user.classList.add('chat');
    //message.classList.add('chat');
    var time = new Date(json.time);
    timestamp.textContent = "" + time.toTimeString().slice(0, 5);
    user.textContent = "<" + json.user + ">  ";
    message.textContent = json.message;
    $('chatLog').appendChild(div);
}
function chatSend(msg, usr) {
    var json = {
        type: "chat",
        time: new Date(),
        message: msg,
        user: usr
    };
    wsConnection.send(JSON.stringify(json));
    $('chatInput').value = null;
}
function hideOverlay() {
    document.querySelectorAll('.overlay').forEach(function (overlay) {
        overlay.classList.add('hidden');
    });
}
// there's a lot of them.  so let's make this an easy to fold section
function addEventListeners() {
    $('newOfflineGameBtn').addEventListener('click', function () {
        game = new Game();
        game.newOfflineGame();
    });
    //$('newOnlineGameBtn').addEventListener('click', () => {
    //	hideOverlay();
    //	$('signInOverlay').classList.remove('hidden');
    //});
    $('joinOnlineGameBtn').addEventListener('click', function () {
        hideOverlay();
        $('joinGameOverlay').classList.remove('hidden');
    });
    $('createOnlineGameBtn').addEventListener('click', function () {
        hideOverlay();
        $('createGameOverlay').classList.remove('hidden');
    });
    //$('guestEnter').addEventListener('click', () => {
    //	hideOverlay();
    //	$('guestOverlay').classList.remove('hidden');
    //});
    $('guestNoNameBtn').addEventListener('click', function () {
        session = new Session(null);
        session.chooseGuestName();
        $('usernameDisplay').textContent = 'guest: ' + session.clientName;
        $('sessionIDLabel').classList.remove('hidden');
        $('sessionIDDisplay').classList.remove('hidden');
        $('sessionIDDisplay').textContent = session.sessionCode();
        hideOverlay();
    });
    $('guestYesNameBtn').addEventListener('click', function () {
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
    $('chatSubmit').addEventListener('click', function () {
        chatSend($('chatInput').value, session.clientName);
    });
    $('joinSessionCancelBtn').addEventListener('click', function () { hideOverlay(); });
    document.onkeyup = function (pressEvent) {
        if (document.activeElement == $('chatInput') &&
            pressEvent.key == 'Enter') {
            chatSend($('chatInput').value.trim(), session.clientName);
        }
    };
}
function startGameWithBoardClick() {
    // this function needs to be called to pull the trick of removing the event  
    // listener which calls this function.
    game = new Game();
    game.newOfflineGame();
    $('board').removeEventListener('click', startGameWithBoardClick);
}
function main() {
    addEventListeners();
    game.boardGenerate();
    $('board').addEventListener('click', startGameWithBoardClick);
}
var dicewareDict = [];
var guestNames = [];
fetchJsonAsset('assets/diceware.json', dicewareDict);
fetchJsonAsset('assets/names.json', guestNames);
fetch('assets/diceware.json')
    .then(function (res) { return res.json(); })
    .then(function (json) { return dicewareDict = json; });
fetch('assets/names.json')
    .then(function (res) { return res.json(); })
    .then(function (json) { return guestNames = json; });
var wsUrl = 'ws://localhost:7565/';
var wsConnection = new WebSocket(wsUrl);
// the connection will connect without this func, but when i edit it later it
// might actually serve a purpose
//wsConnection.onopen = () => {}
//  wsConnection.send('begin connection') 
//}
wsConnection.onerror = function (error) {
    console.log("WebSocket error: " + error);
};
wsConnection.onmessage = function (msg) {
    console.log(msg);
    var message = JSON.parse(msg.data);
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
};
// init
var session = new Session(null);
var settings = new Settings();
var game = new Game();
main();
