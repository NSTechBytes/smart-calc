# SmartCalc VS Code Extension

**SmartCalc** is a Visual Studio Code extension that provides a powerful inline calculator with support for arithmetic, scientific, and programmer calculations. With a modern, responsive UI and a host of features, SmartCalc is designed to make quick calculations and complex evaluations accessible directly within VS Code.

## Features

- **Inline Calculator:**  
  Quickly evaluate expressions via the command palette or using a dedicated keybinding.

- **Webview Calculator Panel:**  
  A full-featured calculator interface with:
  - **Basic Operations:** Addition, subtraction, multiplication, and division.
  - **Memory Functions:** 
    - **MC (Memory Clear)**
    - **MR (Memory Recall)**
    - **M+ (Memory Add)**
    - **M- (Memory Subtract)**
  - **Constants:** Buttons for π and e, plus an **ANS** button to recall the last result.
  - **Advanced Scientific Functions:**  
    Toggle **Advanced Mode** to reveal extra functions like sin, cos, tan, square root (√), logarithms (log, ln), exponentiation (^), and more.
  - **Calculation History:**  
    Your previous calculations are saved (persisted via localStorage) and can be reloaded by clicking an entry in the history panel.
  - **Theme Support:**  
    Seamlessly toggle between GitHub Light and GitHub Dark themes. The selected theme is remembered across sessions.
  - **Unified Header Controls:**  
    A modern header includes:
    - Theme toggle
    - Advanced Mode toggle
    - History panel toggle
    - Copy-to-clipboard button
    - Help button (shows detailed usage instructions)
    - Mode selection dropdown (choose Arithmetic, Scientific, or Programmer modes) with custom styling that adapts to the active theme
  - **Keyboard Support:**  
    Enter numbers and operators directly with your keyboard, with support for Backspace, Enter (to evaluate), and Escape (to clear).

- **Copy to Clipboard:**  
  Quickly copy the current result with one click.

- **Help Modal:**  
  Displays detailed usage instructions and feature descriptions.

- **Responsive Design:**  
  The interface is optimized for both regular and small screens.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/NSTechBytes/smart-calc.git
   ```

2. **Install Dependencies:**

   Navigate to the project folder and run:
   
   ```bash
   npm install
   ```

3. **Launch the Extension:**

   Open the project in Visual Studio Code and press `F5` to launch a new Extension Development Host with SmartCalc loaded.

## Package Configuration Details

- **Name:** `smartcalc`
- **Version:** `0.0.1`
- **Engines:** VS Code `^1.60.0`
- **Activation Events:**
  - `onStartupFinished`
  - `onCommand:smartcalc.calculate`
  - `onCommand:smartcalc.openCalculator`
- **Commands:**
  - `smartcalc.calculate` – "SmartCalc: Calculate Expression"
  - `smartcalc.openCalculator` – "SmartCalc: Open Calculator Panel"
- **Keybindings:**
  - `ctrl+alt+c` for inline calculation
  - `ctrl+alt+shift+c` for opening the calculator panel
- **Dependencies:** Uses [mathjs](https://mathjs.org/) version `^11.12.0` for expression evaluation.

## How to Use

### Inline Calculator

- **Quick Calculation:**  
  Open the command palette by pressing `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS), then type and select **SmartCalc: Calculate Expression**. Enter your expression and hit Enter to see the result.

### Webview Calculator Panel

- **Opening the Calculator Panel:**  
  You can open the full calculator panel in several ways:
  - Via the command palette by selecting **SmartCalc: Open Calculator Panel**.
  - Using the keyboard shortcut: `Ctrl+Alt+Shift+C`.
  - Clicking the provided status bar item (if configured).

- **Using the Calculator Interface:**  
  In the calculator panel, you can:
  - **Enter Expressions:**  
    Click on-screen buttons or type directly using your keyboard.
  - **Switch Modes:**  
    - Click **Advanced Mode** to toggle extra scientific functions.
    - Use the **Mode Dropdown** to select between Arithmetic, Scientific, or Programmer modes.
  - **Memory Functions:**  
    Use the **MC**, **MR**, **M+**, and **M-** buttons for memory operations.
  - **Constants & ANS:**  
    Click the **π**, **e**, or **ANS** buttons to insert these values.
  - **History:**  
    Click **History** to toggle the history panel. Click on any previous calculation to load it, or use the **Clear** button to reset the history.
  - **Theme Toggle:**  
    Click **Switch Theme** to toggle between GitHub Light and GitHub Dark themes. Your choice is saved for future sessions.
  - **Copy:**  
    Click **Copy** to copy the current result to your clipboard.
  - **Help:**  
    Click **Help** to open a modal with detailed usage instructions.

### Keyboard Shortcuts

- **Typing:**  
  Enter numbers and operators directly via your keyboard.
- **Editing:**  
  - **Backspace:** Deletes the last character.
  - **Escape:** Clears the current expression.
- **Evaluation:**  
  Press **Enter** to evaluate your expression.

## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues](https://github.com/NSTechBytes/smart-calc/issues) or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Built using the [VS Code Extension API](https://code.visualstudio.com/api).
- Utilizes [mathjs](https://mathjs.org/) for evaluating expressions.
- Inspired by community-driven projects and modern UI/UX design principles.

