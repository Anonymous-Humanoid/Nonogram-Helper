// Injecting script into DOM when popup is clicked, if allowed
document.addEventListener("DOMContentLoaded", async () => {
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	chrome.scripting.executeScript({
		'target': {'tabId': tab.id},
		'world': 'MAIN',
		'function': () => {
			// Internal values
			const [FILLED, EMPTY] = '◆◇';

			// Sums elements in array
			function sum(arr) {
				return arr.reduce((acc, x) => acc + x, 0);
			}

			// Mathematically fills row
			function getCol(r, col) {
				let rows = [];
				
				for (let strips of col) {
					let strip_skip = Math.max(0, r+1-sum(strips)-strips.length);
					let leftover_strips = strips.map(x => Math.max(0, x-strip_skip));
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

			// Gets nonogram row and column data from page
			function getData() {
				let row_data, col_data;
				
				document.querySelectorAll('script').forEach(s => {
					if (s.text.length > 45 && s.text.slice(1, 45) === "var Game = {}; var Puzzle = {}; var task = '") {
						let values = s.text.slice(45).replace(/\'[\s\S]+/, '').split('/');
						
						for (let i = 0; i < values.length; i++) {
							let arr = [];
							values[i].split('.').forEach(e => arr.push(parseInt(e)));
							values[i] = arr;
						}
						
						// Getting grid dimensions before dividing values
						const divider = Game.currentState.cellStatus[0].length;
						[row_data, col_data] = [values.slice(0, divider), values.slice(divider)];
					}
				});
				return [row_data, col_data];
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
				
				// Saving previous grid
				Game.addCheckpoint();
				updateCheckpoints();
				
				// Overwriting grid
				Game.currentState.cellStatus = out;
				Game.drawCurrentState();
			}
			
			// Running program
			draw();
		}
	});
});
