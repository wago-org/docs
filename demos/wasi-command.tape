Output public/demos/wasi-command.gif

Set Shell bash
Set Width 1200
Set Height 440
Set Padding 28
Set FontSize 18
Set FontFamily "DejaVu Sans Mono"
Set TypingSpeed 10ms
Set CursorBlink false
Set Theme { "name": "Wago", "black": "#161043", "red": "#ff9ec4", "green": "#74e0ad", "yellow": "#f3d37a", "blue": "#8c75ff", "magenta": "#c3a8ff", "cyan": "#75d8e8", "white": "#f3effd", "brightBlack": "#7d72b0", "brightRed": "#ffb4d2", "brightGreen": "#91ebc2", "brightYellow": "#ffe49a", "brightBlue": "#aa88fa", "brightMagenta": "#d6c3ff", "brightCyan": "#a4e9f2", "brightWhite": "#ffffff", "background": "#161043", "foreground": "#f3effd", "selection": "#443a8c", "cursor": "#c3a8ff" }

Hide
Type "source scripts/demo-session.sh"
Enter
Type "clear"
Enter
Sleep 500ms
Show

Type "curl -fsSL https://wago.sh/corpora/wasi-hello.wasm -o wasi-hello.wasm"
Enter
Sleep 500ms
Wait+Line@60s /\$ $/
Sleep 2s

Type "wago module imports wasi-hello.wasm"
Enter
Sleep 500ms
Wait+Line@60s /\$ $/
Sleep 2s

Type "wago plugins list"
Enter
Sleep 500ms
Wait+Line@60s /\$ $/
Sleep 2s

Type "wago run --locked --offline wasi-hello.wasm"
Enter
Sleep 500ms
Wait+Line@60s /\$ $/
Sleep 2s
