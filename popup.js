// Executes when popup is clicked
document.addEventListener("DOMContentLoaded", async () => {
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	chrome.scripting.executeScript({
		'target': {'tabId': tab.id},
		'world': 'MAIN',
		'function': () => {
			// TESTING
			const [FILLED, EMPTY] = '◆◇';

			// Sums elements in array
			function sum(arr) {
				return arr.reduce((a,b) => a+b, 0);
			}

			// Compares elements for the maximum
			function max(a, b) {
				return a > b ? a : b;
			}

			// Mathematically fills row
			function getCol(r, col) {
				let rows = [];
				for (let strips of col) {
					let strip_skip = max(0, r+1-sum(strips)-strips.length);
					//let strip_skip = r+1-sum(strips)-strips.length;
					let leftover_strips = strips.map(x => max(0, x-strip_skip));
					let row = [];
					for (let i = 0; i < strips.length; i++) {
						let leftover_strip = leftover_strips[i];
						let skipped_strip = strips[i] - leftover_strip;
						row.push(EMPTY.repeat(skipped_strip) + FILLED.repeat(leftover_strip));
					}
					let conj_row = row.join(EMPTY);
					conj_row += EMPTY.repeat(r - conj_row.length);
					rows.push(conj_row);
				}
				return rows
			}

			// TESTING Mathematically fills and prints the filled row based on column data to the console
			function drawColConsole(r, col) {
				console.log('\n'.join(getCol(r, col)));
			}

			// TESTING Mathematically fills and prints the grid to the console
			function drawConsole(row, col) {
				let [row_mat, trans_col_mat] = [getCol(row.length, col), getCol(col.length, row)];
				let out = '';
				for (let i = 0; i < row_mat.length; i++) {
					for (let j = 0; j < trans_col_mat.length; j++) {
						out += [row_mat[i][j], trans_col_mat[j][i]].includes(FILLED) ? FILLED : EMPTY;
					}
					out += '\n'
				}
				console.log(out);
			}

			// Gets nonogram row and column data from page
			function getData() {
				let row_data, col_data;
				document.querySelectorAll('script').forEach(s => {
					if (s.text.length > 45 && s.text.slice(1,45) === "var Game = {}; var Puzzle = {}; var task = '") {
						let values = s.text.slice(45).replace(/\'[\s\S]+/, '').split('/');
						for (let i = 0; i < values.length; i++) {
							let arr = [];
							values[i].split('.').forEach(e => arr.push(parseInt(e)));
							values[i] = arr;
						}
						// Checking if grid is square before splitting list
						// if (new URLSearchParams(window.location.search).get('size') === '6') { // TODO Works until page is refreshed
						// if (values.length === 25*30) {
						// 	[row_data, col_data] = [values.slice(0, 25), values.slice(25)]
						// }
						// else {
						// 	[row_data, col_data] = [values.slice(0, values.length/2), values.slice(values.length/2)];
						// }=
						const divider = Game.currentState.cellStatus[0].length;
						[row_data, col_data] = [values.slice(0, divider), values.slice(divider)];
					}
				});
				return [row_data, col_data];
			}

			// TESTING Mathematically fills and prints the page's grid to the console
			function drawDataConsole() {
				let [row_data, col_data] = getData();
				drawConsole(row_data, col_data);
			}
			
			// Mathematically fills the page's grid
			function draw() {
				let [row, col] = getData();
				let [row_mat, trans_col_mat] = [getCol(row.length, col), getCol(col.length, row)];
				let out = [];
				for (let i = 0; i < row_mat.length; i++) {
					let new_row = [];
					for (let j = 0; j < trans_col_mat.length; j++) {
						new_row.push([row_mat[i][j], trans_col_mat[j][i]].includes(FILLED) ? 1 : 0);
					}
					out.push(new_row);
				}
				console.log(JSON.stringify(out)); // TODO TESTING
				// Saving previous grid
				Game.addCheckpoint();
				updateCheckpoints();
				// Overwriting grid
				Game.currentState.cellStatus = out;
				Game.drawCurrentState();
			}
			
			draw();
		}
	});
});
