Output public/demos/run-fib.gif

Set Shell zsh
Set Width 1200
Set Height 190
Set Padding 28
Set FontSize 18
Set FontFamily "Menlo"
Set TypingSpeed 10ms
Set CursorBlink false
Set Theme { "name": "Wago", "black": "#161043", "red": "#ff9ec4", "green": "#74e0ad", "yellow": "#f3d37a", "blue": "#8c75ff", "magenta": "#c3a8ff", "cyan": "#75d8e8", "white": "#f3effd", "brightBlack": "#7d72b0", "brightRed": "#ffb4d2", "brightGreen": "#91ebc2", "brightYellow": "#ffe49a", "brightBlue": "#aa88fa", "brightMagenta": "#d6c3ff", "brightCyan": "#a4e9f2", "brightWhite": "#ffffff", "background": "#161043", "foreground": "#f3effd", "selection": "#443a8c", "cursor": "#c3a8ff" }

Hide
Type "find /tmp/wago-docs-run -depth -delete 2>/dev/null || true"
Enter
Type "mkdir -p /tmp/wago-docs-run/bin"
Enter
Type "cp ../website/corpora/fib.wasm /tmp/wago-docs-run/fib-source.wasm"
Enter
Type "echo IyEvYmluL3NoCmNwIC90bXAvd2Fnby1kb2NzLXJ1bi9maWItc291cmNlLndhc20gZmliLndhc20K | base64 -d > /tmp/wago-docs-run/bin/curl"
Enter
Type "chmod +x /tmp/wago-docs-run/bin/curl"
Enter
Type "export PATH=/tmp/wago-docs-run/bin:/tmp/wago-docs-install/home/.wago/bin:/Users/work/.wago/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
Enter
Type "cd /tmp/wago-docs-run"
Enter
Type "clear"
Enter
Sleep 500ms
Show

Type "curl -fsSL https://wago.sh/corpora/fib.wasm -o fib.wasm"
Sleep 220ms
Enter
Sleep 2s

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
