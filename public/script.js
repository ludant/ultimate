"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var wsUrl = 'ws://localhost:7565/';
var wsConnection = new WebSocket(wsUrl);
function $(id) {
    return document.getElementById(id);
}
$('newOfflineGameBtn').addEventListener('click', newOfflineGame);
$('chatSubmit').addEventListener('click', function () {
    chatSend($('chatInput').value, 'jesus');
});
$('newOnlineGameBtn').addEventListener('click', function () {
    $('signInOverlay').classList.remove('hidden');
});
$('guestEnter').addEventListener('click', function () {
    $('signInOverlay').classList.add('hidden');
    $('guestOverlay').classList.remove('hidden');
});
$('guestNoName').addEventListener('click', function () {
    $('guestOverlay').classList.add('hidden');
});
$('guestYesName').addEventListener('click', function () {
    var userSession = new UserSession();
    userSession.xPlayer = "THIS IS NOT DONE";
    $('guestOverlay').classList.add('hidden');
});
wsConnection.onopen = function () {
    wsConnection.send('begin connection');
};
wsConnection.onerror = function (error) {
    console.log("WebSocket error: " + error);
};
wsConnection.onmessage = function (msg) {
    var message = JSON.parse(msg.data);
    switch (message.type) {
        case 'chat':
            chatWriteMessage(message);
            break;
        case 'connect':
            break;
    }
};
function UserSession() {
    this.xPlayer = null;
    this.oPlayer = null;
}
function hideOverlay() {
    document.querySelectorAll('.overlay').forEach(function (overlay) {
        overlay.classList.add('hidden');
    });
}
function showAlert(message, binary, yesLabel, noLabel, yesFunc, noFunc) {
    if (yesLabel === void 0) { yesLabel = "yes"; }
    if (noLabel === void 0) { noLabel = "no"; }
    hideOverlay();
    $('alertOverlay').classList.remove('hidden');
    $('alertMessage').textContent = message;
    $('alertYesBtn').value = yesLabel;
    $('alertNoBtn').value = noLabel;
    $('alertYesBtn').addEventListener('click', yesFunc);
    $('alertNoBtn').addEventListener('click', noFunc);
    if (!binary) {
        $('alertNoBtn').classList.add('hidden');
    }
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
    this.changeTurn = function () {
        this.xTurn = !this.xTurn;
        this.changePlayer();
    };
    this.changePlayer = function () {
        if (this.xTurn) {
            this.player = 'X';
        }
        else {
            this.player = 'O';
        }
        ;
        $('container').classList.toggle('x-turn');
        $('container').classList.toggle('o-turn');
    };
    this.checkWin = function (grid) {
        if ((grid[0] !== null && grid[0] == grid[1] && grid[1] == grid[2]) ||
            (grid[3] !== null && grid[3] == grid[4] && grid[4] == grid[5]) ||
            (grid[6] !== null && grid[6] == grid[7] && grid[7] == grid[8]) ||
            (grid[0] !== null && grid[0] == grid[3] && grid[3] == grid[6]) ||
            (grid[1] !== null && grid[1] == grid[4] && grid[4] == grid[7]) ||
            (grid[2] !== null && grid[2] == grid[5] && grid[5] == grid[8]) ||
            (grid[0] !== null && grid[0] == grid[4] && grid[4] == grid[8]) ||
            (grid[2] !== null && grid[2] == grid[4] && grid[4] == grid[6])) {
            return true;
        }
        else {
            return false;
        }
    };
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
}
function setBoard() {
    var board = $('board');
    for (var i = 0; i < 9; i++) {
        var macro = document.createElement('div');
        macro.classList.add('macro-cell', 'board');
        macro.id = "macro" + i;
        board.appendChild(macro);
        var _loop_1 = function (j) {
            var micro = document.createElement('div');
            micro.classList.add('micro-cell');
            micro.id = "micro" + i + "-" + j;
            macro.appendChild(micro);
            micro.addEventListener('click', function () { return playerMove(micro); });
            var span = document.createElement('span');
            span.classList.add('micro-cell-marker');
            micro.appendChild(span);
        };
        for (var j = 0; j < 9; j++) {
            _loop_1(j);
        }
        $("micro" + i + "-4").classList.add('micro-border');
        $("micro" + i + "-3").classList.add('micro-border', 'micro-horizontal');
        $("micro" + i + "-5").classList.add('micro-border', 'micro-horizontal');
        $("micro" + i + "-1").classList.add('micro-border', 'micro-vertical');
        $("micro" + i + "-7").classList.add('micro-border', 'micro-vertical');
    }
    $("macro4").classList.add('macro-border');
    $("macro3").classList.add('macro-border', 'macro-horizontal');
    $("macro5").classList.add('macro-border', 'macro-horizontal');
    $("macro1").classList.add('macro-border', 'macro-vertical');
    $("macro7").classList.add('macro-border', 'macro-vertical');
}
function markMacro(macro) {
    macro.classList.add('macro-finished');
    if (!game.xTurn) {
        macro.classList.add('macro-finished-o');
    }
    macro.classList.add('closed');
    __spreadArrays(macro.children).forEach(function (micro) {
        micro.classList.add('transparent-cell');
        micro.classList.add('marked');
    });
}
function playerMove(cell) {
    var id = [Number(cell.id[5]), Number(cell.id[7])];
    if (game.fullBoard[id[0]][id[1]] == null &&
        game.openSpaces[id[0]]) {
        game.fullBoard[id[0]][id[1]] = game.player;
        var marker = cell.children[0];
        marker.textContent = game.player;
        cell.classList.add('marked');
        __spreadArrays(document.querySelectorAll('.open')).forEach(function (cell) {
            cell.classList.remove('open');
        });
        if (game.xTurn) {
            marker.classList.add('marker-x');
            $('textInfo').textContent = 'O turn';
        }
        else {
            marker.classList.add('marker-o');
            $('textInfo').textContent = 'X turn';
        }
        if (game.checkWin(game.fullBoard[id[0]])) {
            game.macroBoard[id[0]] = game.player;
            markMacro($("macro" + id[0]));
            if (game.checkWin(game.macroBoard)) {
                game.gameWin = true;
                game.openSpaces = game.openSpaces.map(function (x) { return false; });
                if (game.xTurn) {
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
        if (!game.gameWin) {
            closeMacroCells(id);
            markOpenMicroCells();
            game.changeTurn();
        }
    }
    else {
        console.log("you can't play there you nincompoop!!!!");
    }
}
function closeMacroCells(lastMove) {
    var id = [lastMove[0], lastMove[1]];
    // if player is forced into an open macrogrid
    if (game.macroBoard[id[1]] == null) {
        game.openSpaces = game.openSpaces.map(function (x) { return false; });
        game.openSpaces[id[1]] = true;
    } // if player is forced into a closed macrogrid
    else {
        for (var i = 0; i < 9; i++) {
            if (game.macroBoard[i] == null) {
                game.openSpaces[i] = true;
            }
            else {
                game.openSpaces[i] = false;
            }
        }
    }
    for (var i = 0; i < 9; i++) {
        var macroDiv = $("macro" + i);
        if (game.openSpaces[i] == macroDiv.classList.contains('closed')) {
            macroDiv.classList.toggle('closed');
        }
    }
}
function markOpenMicroCells() {
    for (var i = 0; i < 9; i++) {
        if (game.openSpaces[i]) {
            for (var j = 0; j < 9; j++) {
                if (game.fullBoard[i][j] == null) {
                    $("micro" + i + "-" + j).classList.add('open');
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
    $('board').remove();
    var board = document.createElement('div');
    board.id = 'board';
    board.classList.add('board');
    $('innerRail').append(board);
}
function initialGameStart() {
    newOfflineGame();
    $('board').removeEventListener('click', initialGameStart);
}
// init
setBoard();
var game = null;
$('board').addEventListener('click', initialGameStart);
