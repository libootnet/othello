package main

import (
	"fmt"
	"net/http"
)

func handleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer conn.Close()

	gameState := initializeGameState()

	err = conn.WriteJSON(gameState)
	if err != nil {
		fmt.Println(err)
		return
	}

	var conf StartConf
	err = conn.ReadJSON(&conf)
	if err != nil {
		fmt.Println(err)
		return
	}

	playerColor := 1

	if conf.Color == "white" {
		playerColor = 2
	}

	opponent := white
	if conf.Color == "white" {
		opponent = black
	}

	isPlayerTurn := conf.Turn == 1
	isvaild := conf.Turn == 2
	gameState.Turn = playerColor

	write := func() {
		gameState.Black, gameState.White = countPieces(gameState.Board)

		err = conn.WriteJSON(gameState)
		if err != nil {
			fmt.Println(err)
			return
		}
	}

	for {
		if checkGameOver(gameState.Board) {
			gameResult := determineWinner(gameState)
			err := conn.WriteJSON(gameResult)
			if err != nil {
				fmt.Println(err)
				return
			}
			var reset ResetAPI
			err = conn.ReadJSON(&reset)
			if err != nil {
				fmt.Println(err)
				return
			}
			if reset.Reset {
				gameState = initializeGameState()
			}
			continue
		}

		if isPlayerTurn && gameState.Turn == playerColor && !isvaild {
			var move Move
			err = conn.ReadJSON(&move)
			if err != nil {
				fmt.Println(err)
				break
			}

			isvaild = isValidMove(gameState.Board, move.X, move.Y, playerColor)
			if isvaild {
				placeMove(&gameState.Board, move.X, move.Y, playerColor)
				gameState.Turn = 3 - playerColor
				isPlayerTurn = false
			}

			if len(findValidMoves(gameState.Board, opponent)) == 0 {
				isvaild = false
				isPlayerTurn = true
				gameState.Turn = playerColor
			}

			if isPlayerTurn {
				write()
			}
		} else if isvaild {
			isvaild = false
			mode := &Mode{
				Color: opponent,
			}

			cx, cy := mode.computerMove(&gameState.Board)
			if cx != -1 && cy != -1 {
				placeMove(&gameState.Board, cx, cy, 3-playerColor)
				gameState.Turn = playerColor
				isPlayerTurn = true
			} else if checkGameOver(gameState.Board) {
				continue
			}
		}

		write()
	}
}
