"use strict";

function $(id) {
  return document.getElementById(id);
}

function init() {


}

for (let i = 0; i < 9; i++) {
	const cell = document.createElement("div");
	cell.classList.add("macro-cell");
	cell.id = `macro${i}`;
	$('board').appendChild(cell);
	for (let j = 0; j < 9; j++) {
		const cell = document.createElement("div");

		item.addEventListener("mouseenter", () => {
			changeColor(item);
		});
		item.addEventListener("touchstart", () => {
			changeColor(item);
		});
	}
}
