const vscode = require('vscode');
const math = require('mathjs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('SmartCalc extension is active!');

	// Inline calculator command
	let inlineCalcCommand = vscode.commands.registerCommand('smartcalc.calculate', async () => {
		const expression = await vscode.window.showInputBox({ prompt: 'Enter calculation expression' });
		if (expression) {
			try {
				// Evaluate the expression using mathjs (supports arithmetic, scientific, and programmer operations)
				const result = math.evaluate(expression);
				vscode.window.showInformationMessage(`Result: ${result}`);
			} catch (error) {
				vscode.window.showErrorMessage('Invalid expression.');
			}
		}
	});

	// Command to open the calculator webview panel
	let openCalcPanelCommand = vscode.commands.registerCommand('smartcalc.openCalculator', () => {
		SmartCalcPanel.createOrShow(context.extensionUri);
	});

	context.subscriptions.push(inlineCalcCommand, openCalcPanelCommand);

	// Create a status bar item for quick access to calculations
	let statusBarCalc = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarCalc.command = 'smartcalc.openCalculator';
	statusBarCalc.text = '$(calculator) 🔢 SmartCalc';
	statusBarCalc.tooltip = 'Calculate expression';
	statusBarCalc.show();
	context.subscriptions.push(statusBarCalc);
}

/**
 * Manages the SmartCalc webview panel
 */
class SmartCalcPanel {
	static currentPanel = undefined;

	static createOrShow(extensionUri) {
		const column = vscode.ViewColumn.One;

		// If we already have a panel, show it.
		if (SmartCalcPanel.currentPanel) {
			SmartCalcPanel.currentPanel.reveal(column);
			return;
		}

		// Otherwise, create a new webview panel.
		const panel = vscode.window.createWebviewPanel(
			'smartCalc',
			'SmartCalc',
			column,
			{
				enableScripts: true,
				// Restrict the webview to only load resources from the extension's `media` directory.
				localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
			}
		);

		SmartCalcPanel.currentPanel = panel;
		panel.webview.html = SmartCalcPanel.getHtmlForWebview(panel.webview, extensionUri);

		// Clean up when the panel is closed
		panel.onDidDispose(() => {
			SmartCalcPanel.currentPanel = undefined;
		});

		// Listen for messages from the webview
		panel.webview.onDidReceiveMessage(message => {
			switch (message.command) {
				case 'calculate':
					try {
						const result = math.evaluate(message.expression);
						panel.webview.postMessage({ command: 'result', result: result });
					} catch (error) {
						panel.webview.postMessage({ command: 'error', error: 'Invalid expression.' });
					}
					break;
			}
		});
	}

	static getHtmlForWebview(webview, extensionUri) {
		const nonce = getNonce();
		return `<!DOCTYPE html>
	  <html lang="en">
	  <head>
		<meta charset="UTF-8">
		<!-- Content Security Policy -->
		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>SmartCalc</title>
		<style>
		  /* Global Reset & Compact Layout */
		  body {
			margin: 0;
			padding: 0;
			font-family: Arial, sans-serif;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100vh;
			transition: background 0.3s, color 0.3s;
		  }
		  .calculator {
			max-width: 320px;
			width: 100%;
			padding: 10px;
			border-radius: 8px;
			box-shadow: 0 3px 8px rgba(0,0,0,0.1);
			transition: background 0.3s, color 0.3s;
			animation: slideIn 0.5s ease-out;
		  }
		  /* Unified Header Layout */
		  .header {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 10px;
			margin-bottom: 8px;
		  }
		  .header-buttons {
			display: flex;
			gap: 6px;
			flex: 1;
		  }
		  .header-select {
			margin-left: auto;
		  }
		  .header button, .header select {
			padding: 6px 12px;
			font-size: 0.75em;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			transition: transform 0.2s, background 0.3s;
		  }
		  /* Gradient Styles for Header Buttons (GitHub Light) */
		  .github-light .header button {
			background: linear-gradient(90deg, #5cc8ff, #007acc);
			color: #ffffff;
		  }
		  .github-light .header button:hover {
			transform: scale(1.05);
			background: linear-gradient(90deg, #007acc, #005f9e);
		  }
		  /* Gradient Styles for Header Buttons (GitHub Dark) */
		  .github-dark .header button {
			background: linear-gradient(90deg, #005f9e, #007acc);
			color: #ffffff;
		  }
		  .github-dark .header button:hover {
			transform: scale(1.05);
			background: linear-gradient(90deg, #007acc, #0099ff);
		  }
		  /* Custom Dropdown Styling */
		  .header select {
			height: 32px;
			line-height: 32px;
			border: 1px solid #ccc;
			border-radius: 4px;
			padding: 0 12px;
			background: #eff3f6 url('data:image/svg+xml;utf8,<svg fill="%230072ac" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path d="M7 10l5 5 5-5z"/></svg>') no-repeat right 10px center;
			-webkit-appearance: none;
			-moz-appearance: none;
			appearance: none;
			color: inherit;
			font-size: 0.75em;
		  }
		  .header select option {
			background-color: #ffffff;
			color: #24292e;
		  }
		  .github-dark .header select {
			background: #21262d url('data:image/svg+xml;utf8,<svg fill="%23c9d1d9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path d="M7 10l5 5 5-5z"/></svg>') no-repeat right 10px center;
			border: 1px solid #30363d;
		  }
		  .github-dark .header select option {
			background-color: #161b22;
			color: #c9d1d9;
		  }
		  /* Display Styles */
		  .display {
			width: 96%;
			height: 35px;
			border: none;
			text-align: right;
			padding: 6px;
			font-size: 1.2em;
			border-radius: 4px;
			margin-bottom: 8px;
			transition: background 0.3s, color 0.3s;
		  }
		  .buttons {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			grid-gap: 6px;
		  }
		  .buttons button {
			padding: 10px;
			font-size: 1em;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			transition: transform 0.1s ease, background 0.3s, border 0.3s, color 0.3s;
		  }
		  .buttons button:active {
			transform: scale(0.95);
		  }
		  /* Animations */
		  .fade {
			animation: fadeIn 0.3s ease-out;
		  }
		  @keyframes fadeIn {
			from { opacity: 0.5; }
			to { opacity: 1; }
		  }
		  @keyframes slideIn {
			from { transform: translateY(20px); opacity: 0; }
			to { transform: translateY(0); opacity: 1; }
		  }
		  /* History Panel */
		  .history {
			margin-top: 8px;
			max-height: 100px;
			overflow-y: auto;
			border-top: 1px solid #ccc;
			padding-top: 4px;
			font-size: 0.7em;
			position: relative;
		  }
		  .history-entry {
			padding: 2px 0;
			cursor: pointer;
		  }
		  .history-entry:hover {
			background-color: rgba(0,0,0,0.1);
		  }
		  .clear-history {
			position: absolute;
			right: 4px;
			top: 4px;
			font-size: 0.7em;
			cursor: pointer;
			background: none;
			border: none;
			color: inherit;
		  }
		  /* Modal (Help) Styles */
		  .modal {
			display: none;
			position: fixed;
			z-index: 100;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			overflow: auto;
			background-color: rgba(0,0,0,0.5);
			transition: background-color 0.3s;
		  }
		  .modal-content {
			margin: 15% auto;
			padding: 15px;
			border: 1px solid #888;
			width: 90%;
			max-width: 400px;
			border-radius: 8px;
			transition: background 0.3s, color 0.3s;
		  }
		  .close {
			color: #aaa;
			float: right;
			font-size: 24px;
			font-weight: bold;
			cursor: pointer;
		  }
		  .close:hover, .close:focus {
			color: black;
		  }
		  /* GitHub Light Theme */
		  .github-light {
			background-color: #ffffff;
			color: #24292e;
		  }
		  .github-light .calculator {
			background-color: #f6f8fa;
			color: #24292e;
		  }
		  .github-light .display {
			background-color: #eaecef;
			color: #24292e;
			border: 1px solid #d1d5da;
		  }
		  .github-light .buttons button {
			background-color: #f6f8fa;
			color: #24292e;
			border: 1px solid #d1d5da;
		  }
		  .github-light .buttons button:hover {
			background-color: #eaecef;
		  }
		  .github-light .modal-content {
			background-color: #fefefe;
			color: #24292e;
		  }
		  /* GitHub Dark Theme */
		  .github-dark {
			background-color: #0d1117;
			color: #c9d1d9;
		  }
		  .github-dark .calculator {
			background-color: #161b22;
			color: #c9d1d9;
		  }
		  .github-dark .display {
			background-color: #21262d;
			color: #c9d1d9;
			border: 1px solid #30363d;
		  }
		  .github-dark .buttons button {
			background-color: #21262d;
			color: #c9d1d9;
			border: 1px solid #30363d;
		  }
		  .github-dark .buttons button:hover {
			background-color: #30363d;
		  }
		  .github-dark .modal-content {
			background-color: #1c1f26;
			color: #c9d1d9;
		  }
		  /* "=" Button Special Style */
		  #equals {
			grid-column: span 4;
			background-color: #4caf50;
			color: white;
		  }
		  #equals:hover {
			background-color: #45a045;
		  }
		  /* Responsive Adjustments */
		  @media (max-width: 360px) {
			.calculator { padding: 6px; }
			.header button, .header select { padding: 3px 6px; font-size: 0.65em; }
			.display { height: 30px; font-size: 1em; padding: 4px; }
			.buttons button { padding: 8px; font-size: 0.9em; }
		  }
		</style>
	  </head>
	  <body>
		<div class="calculator">
		  <!-- Unified Header with Two Sections -->
		  <div class="header">
			<div class="header-buttons">
			  <button id="toggleTheme">Switch Theme</button>
			  <button id="toggleAdvanced">Advanced Mode</button>
			  <button id="toggleHistory">History</button>
			  <button id="copy">Copy</button>
			  <button id="toggleHelp">Help</button>
			</div>
			<div class="header-select">
			  <select id="modeSelect">
				<option value="arithmetic">Arithmetic</option>
				<option value="scientific">Scientific</option>
				<option value="programmer">Programmer</option>
			  </select>
			</div>
		  </div>
		  <input type="text" id="display" class="display" disabled placeholder="0" />
		  <div class="buttons">
			<!-- Memory Row -->
			<button id="mc">MC</button>
			<button id="mr">MR</button>
			<button id="mPlus">M+</button>
			<button id="mMinus">M-</button>
			<!-- Operation Row -->
			<button data-value="(">(</button>
			<button data-value=")">)</button>
			<button id="del">DEL</button>
			<button id="clear">C</button>
			<!-- Constants Row -->
			<button id="const-pi" data-value="pi">π</button>
			<button id="const-e" data-value="e">e</button>
			<button id="ans">ANS</button>
			<button data-value="%">mod</button>
			<!-- Numeric and Operator Rows -->
			<button data-value="7">7</button>
			<button data-value="8">8</button>
			<button data-value="9">9</button>
			<button data-value="/">÷</button>
			<button data-value="4">4</button>
			<button data-value="5">5</button>
			<button data-value="6">6</button>
			<button data-value="*">×</button>
			<button data-value="1">1</button>
			<button data-value="2">2</button>
			<button data-value="3">3</button>
			<button data-value="-">−</button>
			<button id="plusminus">±</button>
			<button data-value="0">0</button>
			<button data-value=".">.</button>
			<button data-value="+">+</button>
			<!-- Advanced Scientific Buttons (hidden by default) -->
			<div id="advancedButtons" style="display: none; grid-column: span 4; grid-template-columns: repeat(4, 1fr); grid-gap: 6px; margin-top:6px;">
			  <button data-value="sin(">sin</button>
			  <button data-value="cos(">cos</button>
			  <button data-value="tan(">tan</button>
			  <button data-value="sqrt(">√</button>
			  <button data-value="log(">log</button>
			  <button data-value="ln(">ln</button>
			  <button data-value="exp(">exp</button>
			  <button data-value="^">^</button>
			</div>
			<!-- Equals Button -->
			<button id="equals">=</button>
		  </div>
		  <!-- History Panel (hidden by default) -->
		  <div id="historyPanel" class="history" style="display:none;">
			<button class="clear-history" id="clearHistory">Clear</button>
		  </div>
		</div>
		<!-- Help Modal -->
		<div id="helpModal" class="modal">
		  <div class="modal-content">
			<span id="closeHelp" class="close">&times;</span>
			<h2>SmartCalc Help</h2>
			<ul>
			  <li><strong>Keyboard support:</strong> Use your keyboard for numbers and operators (Backspace, Enter, and Escape are supported).</li>
			  <li><strong>Memory functions:</strong> MC, MR, M+, M-</li>
			  <li><strong>Advanced Mode:</strong> Toggle to reveal scientific functions.</li>
			  <li><strong>History:</strong> Toggle the history panel and click an entry to reuse an expression. Use "Clear" to reset history.</li>
			  <li><strong>Constants:</strong> π, e, and ANS buttons insert constant values or the last result.</li>
			  <li><strong>Copy:</strong> Copies the current result to the clipboard.</li>
			</ul>
		  </div>
		</div>
		<script nonce="${nonce}">
		  const vscode = acquireVsCodeApi();
		  const display = document.getElementById("display");
		  let expression = "";
		  let history = [];
		  let advancedMode = false;
		  let historyVisible = false;
		  let theme = "github-light";
		  let memory = 0;
		
		  // Load persistent settings from localStorage
		  const storedHistory = localStorage.getItem("calcHistory");
		  if (storedHistory) { history = JSON.parse(storedHistory); }
		  const storedTheme = localStorage.getItem("calcTheme");
		  if (storedTheme) { theme = storedTheme; }
		  document.body.classList.add(theme);
		  const toggleThemeBtn = document.getElementById("toggleTheme");
		  toggleThemeBtn.textContent = theme === "github-light" ? "Switch to GitHub Dark" : "Switch to GitHub Light";
		
		  // Helper: update persistent settings in localStorage.
		  function updateState() {
			localStorage.setItem("calcHistory", JSON.stringify(history));
			localStorage.setItem("calcTheme", theme);
		  }
		
		  // Update display with fade animation.
		  function updateDisplay() {
			display.value = expression || "0";
			display.classList.remove("fade");
			void display.offsetWidth;
			display.classList.add("fade");
		  }
		
		  // Render history panel.
		  function updateHistoryPanel() {
			const historyPanel = document.getElementById("historyPanel");
			historyPanel.innerHTML = '<button class="clear-history" id="clearHistory">Clear</button>';
			history.slice().reverse().forEach(item => {
			  const div = document.createElement("div");
			  div.textContent = item;
			  div.className = "history-entry";
			  div.addEventListener("click", () => {
				expression = item.split("=")[0].trim();
				updateDisplay();
			  });
			  historyPanel.appendChild(div);
			});
			document.getElementById("clearHistory").addEventListener("click", () => {
			  history = [];
			  updateHistoryPanel();
			  updateState();
			});
		  }
		  updateHistoryPanel();
		
		  // Button click handling for any button with data-value.
		  document.querySelectorAll('.buttons button[data-value]').forEach(button => {
			button.addEventListener("click", () => {
			  expression += button.getAttribute("data-value");
			  updateDisplay();
			});
		  });
		
		  // Memory functions.
		  document.getElementById("mc").addEventListener("click", () => { memory = 0; });
		  document.getElementById("mr").addEventListener("click", () => { expression += memory.toString(); updateDisplay(); });
		  document.getElementById("mPlus").addEventListener("click", () => {
			try { memory += eval(expression); } catch(e){}
		  });
		  document.getElementById("mMinus").addEventListener("click", () => {
			try { memory -= eval(expression); } catch(e){}
		  });
		
		  // Clear, delete, and plus/minus functions.
		  document.getElementById("clear").addEventListener("click", () => { expression = ""; updateDisplay(); });
		  document.getElementById("del").addEventListener("click", () => { expression = expression.slice(0, -1); updateDisplay(); });
		  document.getElementById("plusminus").addEventListener("click", () => {
			expression = expression.charAt(0) === "-" ? expression.slice(1) : "-" + expression;
			updateDisplay();
		  });
		
		  // ANS button.
		  document.getElementById("ans").addEventListener("click", () => {
			expression += display.value;
			updateDisplay();
		  });
		
		  // Equals: send expression for evaluation.
		  document.getElementById("equals").addEventListener("click", () => {
			vscode.postMessage({ command: "calculate", expression });
		  });
		
		  // Keyboard support.
		  document.addEventListener("keydown", (event) => {
			const allowed = ["0","1","2","3","4","5","6","7","8","9",".","+","-","*","/","(",")","^","%"];
			if (allowed.includes(event.key)) {
			  expression += event.key;
			  updateDisplay();
			} else if (event.key === "Backspace") {
			  expression = expression.slice(0, -1);
			  updateDisplay();
			} else if (event.key === "Enter") {
			  event.preventDefault();
			  vscode.postMessage({ command: "calculate", expression });
			} else if (event.key === "Escape") {
			  expression = "";
			  updateDisplay();
			}
		  });
		
		  // Listen for messages from the extension.
		  window.addEventListener("message", event => {
			const msg = event.data;
			if(msg.command === "result") {
			  history.push(expression + " = " + msg.result);
			  updateHistoryPanel();
			  expression = String(msg.result);
			  updateDisplay();
			  updateState();
			} else if(msg.command === "error") {
			  expression = "";
			  updateDisplay();
			}
		  });
		
		  // Toggle theme.
		  toggleThemeBtn.addEventListener("click", () => {
			if(document.body.classList.contains("github-light")){
			  document.body.classList.remove("github-light");
			  document.body.classList.add("github-dark");
			  toggleThemeBtn.textContent = "Switch to GitHub Light";
			  theme = "github-dark";
			} else {
			  document.body.classList.remove("github-dark");
			  document.body.classList.add("github-light");
			  toggleThemeBtn.textContent = "Switch to GitHub Dark";
			  theme = "github-light";
			}
			updateState();
		  });
		
		  // Toggle advanced mode.
		  document.getElementById("toggleAdvanced").addEventListener("click", () => {
			advancedMode = !advancedMode;
			document.getElementById("advancedButtons").style.display = advancedMode ? "grid" : "none";
			document.getElementById("toggleAdvanced").textContent = advancedMode ? "Basic Mode" : "Advanced Mode";
		  });
		
		  // Toggle history panel.
		  document.getElementById("toggleHistory").addEventListener("click", () => {
			historyVisible = !historyVisible;
			document.getElementById("historyPanel").style.display = historyVisible ? "block" : "none";
		  });
		
		  // Copy to clipboard.
		  document.getElementById("copy").addEventListener("click", () => {
			if(navigator.clipboard) {
			  navigator.clipboard.writeText(display.value).then(() => { alert("Copied to clipboard!"); });
			} else {
			  const temp = document.createElement("textarea");
			  temp.value = display.value;
			  document.body.appendChild(temp);
			  temp.select();
			  document.execCommand("copy");
			  document.body.removeChild(temp);
			  alert("Copied to clipboard!");
			}
		  });
		
		  // Help modal.
		  const helpModal = document.getElementById("helpModal");
		  document.getElementById("toggleHelp").addEventListener("click", () => { helpModal.style.display = "block"; });
		  document.getElementById("closeHelp").addEventListener("click", () => { helpModal.style.display = "none"; });
		  window.addEventListener("click", (event) => { if(event.target === helpModal) helpModal.style.display = "none"; });
		</script>
	  </body>
	  </html>`;
	  }
	  

}

// Helper function to generate a nonce
function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
};
