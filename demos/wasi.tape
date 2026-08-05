Output public/demos/wasi.gif

Set Shell zsh
Set Width 1200
Set Height 320
Set Padding 28
Set FontSize 18
Set FontFamily "Menlo"
Set TypingSpeed 10ms
Set CursorBlink false
Set Theme { "name": "Wago", "black": "#161043", "red": "#ff9ec4", "green": "#74e0ad", "yellow": "#f3d37a", "blue": "#8c75ff", "magenta": "#c3a8ff", "cyan": "#75d8e8", "white": "#f3effd", "brightBlack": "#7d72b0", "brightRed": "#ffb4d2", "brightGreen": "#91ebc2", "brightYellow": "#ffe49a", "brightBlue": "#aa88fa", "brightMagenta": "#d6c3ff", "brightCyan": "#a4e9f2", "brightWhite": "#ffffff", "background": "#161043", "foreground": "#f3effd", "selection": "#443a8c", "cursor": "#c3a8ff" }

Hide
Type "find /tmp/wago-docs-wasi -depth -delete 2>/dev/null || true"
Enter
Type "mkdir -p /tmp/wago-docs-wasi/bin"
Enter
Type "cp ../website/corpora/wasi-hello.wasm /tmp/wago-docs-wasi/wasi-source.wasm"
Enter
Type "echo IyEvYmluL3NoCmNwIC90bXAvd2Fnby1kb2NzLXdhc2kvd2FzaS1zb3VyY2Uud2FzbSB3YXNpLWhlbGxvLndhc20K | base64 -d > /tmp/wago-docs-wasi/bin/curl"
Enter
Type "chmod +x /tmp/wago-docs-wasi/bin/curl"
Enter
Type "export PATH=/tmp/wago-docs-wasi/bin:/tmp/wago-docs-install/home/.wago/bin:/Users/work/.wago/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
Enter
Type "cd /tmp/wago-docs-wasi"
Enter
Type "wago init --run --yes --no-input"
Enter
Sleep 2s
Type "clear"
Enter
Sleep 500ms
Show

Type "wago add wago-org/wasi"
Sleep 240ms
Enter
Sleep 7s
Enter
Sleep 6s

Type "curl -fsSL https://wago.sh/corpora/wasi-hello.wasm -o wasi-hello.wasm"
Sleep 220ms
Enter
Sleep 2s

Type "wago run wasi-hello.wasm"
Sleep 220ms
Enter
Sleep 3s
