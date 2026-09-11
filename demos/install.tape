Output public/demos/install.gif

Set Shell zsh
Set Width 1200
Set Height 580
Set Padding 28
Set FontSize 18
Set FontFamily "Menlo"
Set TypingSpeed 10ms
Set CursorBlink false
Set Theme { "name": "Wago", "black": "#161043", "red": "#ff9ec4", "green": "#74e0ad", "yellow": "#f3d37a", "blue": "#8c75ff", "magenta": "#c3a8ff", "cyan": "#75d8e8", "white": "#f3effd", "brightBlack": "#7d72b0", "brightRed": "#ffb4d2", "brightGreen": "#91ebc2", "brightYellow": "#ffe49a", "brightBlue": "#aa88fa", "brightMagenta": "#d6c3ff", "brightCyan": "#a4e9f2", "brightWhite": "#ffffff", "background": "#161043", "foreground": "#f3effd", "selection": "#443a8c", "cursor": "#c3a8ff" }

Hide
Type "find /tmp/wago-docs-install -depth -delete 2>/dev/null || true"
Enter
Type "mkdir -p /tmp/wago-docs-install/home /tmp/wago-docs-install/bin"
Enter
Type "echo IyEvYmluL3NoCm91dHB1dD0kKG1rdGVtcCkKaWYgL2Jpbi9zaCAiJEAiID4iJG91dHB1dCIgMj4mMTsgdGhlbiBzdGF0dXM9MDsgZWxzZSBzdGF0dXM9JD87IGZpCmNhdCAiJG91dHB1dCIKcm0gLWYgIiRvdXRwdXQiCmV4aXQgIiRzdGF0dXMiCg== | base64 -d > /tmp/wago-docs-install/bin/sh"
Enter
Type "chmod +x /tmp/wago-docs-install/bin/sh"
Enter
Type "export HOME=/tmp/wago-docs-install/home"
Enter
Type "export WAGO_HOME=/tmp/wago-docs-install/home/.wago"
Enter
Type "export WAGO_BIN_DIR=/tmp/wago-docs-install/home/.wago/bin"
Enter
Type "export WAGO_NO_TUI=1"
Enter
Type "export WAGO_NO_MODIFY_PATH=1"
Enter
Type "export WAGO_NO_COMPLETIONS=1"
Enter
Type "export NO_COLOR=1"
Enter
Type "export WAGO_VERSION=canary"
Enter
Type "export PATH=/tmp/wago-docs-install/bin:/tmp/wago-docs-install/home/.wago/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
Enter
Type "clear"
Enter
Sleep 500ms
Show

Type "curl -fsSL https://install.wago.sh/unix | sh"
Sleep 260ms
Enter
Sleep 10s

Type "wago version install --canary --profile standard --build normal --use --no-input"
Sleep 240ms
Enter
Sleep 25s
Sleep 5s
