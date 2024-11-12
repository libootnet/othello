package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

const (
	size  = 8
	empty = 0
	black = 1
	white = 2
)

type Mode struct {
	Color int
}

type Move struct {
	X     int `json:"x"`
	Y     int `json:"y"`
	Color int `json:"color"`
}

type GameState struct {
	Board [size][size]int `json:"board"`
	Turn  int             `json:"turn"`
	Black int             `json:"black"`
	White int             `json:"white"`
}

type GameResult struct {
	Winner  int    `json:"winner"`
	Message string `json:"message"`
}

type ResetAPI struct {
	Reset bool `json:"reset"`
}

type StartConf struct {
	Color string `json:"color"`
	Turn  int    `json:"turn"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func determineWinner(gameState GameState) GameResult {
	blackCount, whiteCount := countPieces(gameState.Board)

	if blackCount > whiteCount {
		return GameResult{
			Winner:  black,
			Message: "black win",
		}
	} else if whiteCount > blackCount {
		return GameResult{
			Winner:  white,
			Message: "white win",
		}
	} else {
		return GameResult{
			Winner:  0,
			Message: "draw",
		}
	}
}

func main() {
	http.HandleFunc("/ws", handleConnections)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
