// Build with: GOOS=wasip1 GOARCH=wasm go build -o command.wasm main.go
package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	fmt.Println("args:", strings.Join(os.Args[1:], ", "))
	fmt.Println("greeting:", os.Getenv("GREETING"))
}
