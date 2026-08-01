Output public/demos/getting-started.gif

Set Shell zsh
Set Width 1200
Set Height 560
Set Padding 28
Set FontSize 18
Set FontFamily "Menlo"
Set TypingSpeed 10ms
Set CursorBlink false
Set Theme { "name": "Wago", "black": "#161043", "red": "#ff9ec4", "green": "#74e0ad", "yellow": "#f3d37a", "blue": "#8c75ff", "magenta": "#c3a8ff", "cyan": "#75d8e8", "white": "#f3effd", "brightBlack": "#7d72b0", "brightRed": "#ffb4d2", "brightGreen": "#91ebc2", "brightYellow": "#ffe49a", "brightBlue": "#aa88fa", "brightMagenta": "#d6c3ff", "brightCyan": "#a4e9f2", "brightWhite": "#ffffff", "background": "#161043", "foreground": "#f3effd", "selection": "#443a8c", "cursor": "#c3a8ff" }

Hide
Type "mkdir -p /tmp/wago-docs-demo && rm -f /tmp/wago-docs-demo/fib.wasm && cd /tmp/wago-docs-demo"
Enter
Sleep 500ms
Type "curl -fsSL https://raw.githubusercontent.com/wago-org/wago/main/tests/testdata/fib.wasm -o fib.wasm"
Enter
Sleep 2s
Type "clear"
Enter
Sleep 500ms
Show

Type "wago module imports fib.wasm"
Sleep 220ms
Enter
Sleep 2s

Type "wago run fib.wam"
Sleep 260ms
Backspace
Type "sm 30"
Sleep 220ms
Enter
Sleep 3s
