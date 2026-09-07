Output public/demos/plugin-authoring.gif

Set Shell zsh
Set Width 1200
Set Height 360
Set Padding 28
Set FontSize 18
Set FontFamily "Menlo"
Set TypingSpeed 10ms
Set CursorBlink false
Set Theme { "name": "Wago", "black": "#161043", "red": "#ff9ec4", "green": "#74e0ad", "yellow": "#f3d37a", "blue": "#8c75ff", "magenta": "#c3a8ff", "cyan": "#75d8e8", "white": "#f3effd", "brightBlack": "#7d72b0", "brightRed": "#ffb4d2", "brightGreen": "#91ebc2", "brightYellow": "#ffe49a", "brightBlue": "#aa88fa", "brightMagenta": "#d6c3ff", "brightCyan": "#a4e9f2", "brightWhite": "#ffffff", "background": "#161043", "foreground": "#f3effd", "selection": "#443a8c", "cursor": "#c3a8ff" }

Hide
Type "find /tmp/wago-docs-plugin-authoring -depth -delete 2>/dev/null || true"
Enter
Type "mkdir -p /tmp/wago-docs-plugin-authoring"
Enter
Type "cp -R demos/fixtures/plugin-answer/. /tmp/wago-docs-plugin-authoring/"
Enter
Type "export PATH=/tmp/wago-docs-install/home/.wago/bin:/Users/work/.wago/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
Enter
Type "export WAGO_SRC=/Users/work/Code/Wago/wago"
Enter
Type "cd /tmp/wago-docs-plugin-authoring"
Enter
Type "go mod edit -replace github.com/wago-org/wago=/Users/work/Code/Wago/wago"
Enter
Type "clear"
Enter
Sleep 500ms
Show

Type "wago plugin catalog"
Enter
Sleep 3s

Type "go test ./..."
Enter
Sleep 5s

Type "wago plugin catalog --check"
Enter
Sleep 3s
