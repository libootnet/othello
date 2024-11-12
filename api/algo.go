package main

func initializeGameState() GameState {
	board := [size][size]int{}
	board[3][3] = white
	board[4][4] = white
	board[3][4] = black
	board[4][3] = black
	return GameState{Board: board, Turn: black, Black: 2, White: 2}
}

var directions = []struct{ dx, dy int }{
	{-1, -1}, {-1, 0}, {-1, 1},
	{0, -1}, {0, 1},
	{1, -1}, {1, 0}, {1, 1},
}

func isValidMove(board [size][size]int, x, y, color int) bool {
	if board[x][y] != empty {
		return false
	}

	opponent := white
	if color == white {
		opponent = black
	}

	for _, dir := range directions {
		nx, ny := x+dir.dx, y+dir.dy
		foundOpponent := false

		for nx >= 0 && nx < size && ny >= 0 && ny < size {
			if board[nx][ny] == opponent {
				foundOpponent = true
			} else if board[nx][ny] == color && foundOpponent {
				return true
			} else {
				break
			}
			nx += dir.dx
			ny += dir.dy
		}
	}
	return false
}

func placeMove(board *[size][size]int, x, y, color int) {
	board[x][y] = color

	opponent := white
	if color == white {
		opponent = black
	}

	for _, dir := range directions {
		nx, ny := x+dir.dx, y+dir.dy
		toFlip := []struct{ fx, fy int }{}

		for nx >= 0 && nx < size && ny >= 0 && ny < size {
			if board[nx][ny] == opponent {
				toFlip = append(toFlip, struct{ fx, fy int }{nx, ny})
			} else if board[nx][ny] == color {
				for _, f := range toFlip {
					board[f.fx][f.fy] = color
				}
				break
			} else {
				break
			}
			nx += dir.dx
			ny += dir.dy
		}
	}
}

func findValidMoves(board [size][size]int, color int) []Move {
	var moves []Move
	for x := 0; x < size; x++ {
		for y := 0; y < size; y++ {
			if isValidMove(board, x, y, color) {
				moves = append(moves, Move{X: x, Y: y, Color: color})
			}
		}
	}
	return moves
}

var evaluationBoard = [size][size]int{
	{10, -5, 5, 5, 5, 5, -5, 10},
	{-5, -7, -1, -1, -1, -1, -7, -5},
	{5, -1, 10, 1, 1, 10, -1, 5},
	{5, -1, 1, 5, 5, 1, -1, 5},
	{5, -1, 1, 5, 5, 1, -1, 5},
	{5, -1, 10, 1, 1, 10, -1, 5},
	{-5, -7, -1, -1, -1, -1, -7, -5},
	{10, -5, 5, 5, 5, 5, -5, 10}}

const maxDepth = 8

func (m *Mode) minimax(board [size][size]int, depth int, maximizingPlayer bool, alpha, beta int) (int, Move) {
	if depth == 0 || checkGameOver(board) {
		return m.evaluateBoard(board), Move{X: -1, Y: -1, Color: m.Color}
	}

	var bestMove Move
	opponentColor := black
	if m.Color == black {
		opponentColor = white
	}

	if maximizingPlayer {
		maxEval := -1000
		moves := findValidMoves(board, m.Color)
		if len(moves) == 0 {
			return m.evaluateBoard(board), Move{X: -1, Y: -1, Color: m.Color}
		}
		for _, move := range moves {
			boardCopy := board
			placeMove(&boardCopy, move.X, move.Y, m.Color)
			eval, _ := m.minimax(boardCopy, depth-1, false, alpha, beta)
			if eval > maxEval {
				maxEval = eval
				bestMove = move
			}
			alpha = max(alpha, eval)
			if beta <= alpha {
				break
			}
		}
		return maxEval, bestMove
	} else {
		minEval := 1000
		moves := findValidMoves(board, opponentColor)
		if len(moves) == 0 {
			return m.evaluateBoard(board), Move{X: -1, Y: -1, Color: opponentColor}
		}
		for _, move := range moves {
			boardCopy := board
			placeMove(&boardCopy, move.X, move.Y, opponentColor)
			eval, _ := m.minimax(boardCopy, depth-1, true, alpha, beta)
			if eval < minEval {
				minEval = eval
				bestMove = move
			}
			beta = min(beta, eval)
			if beta <= alpha {
				break
			}
		}
		return minEval, bestMove
	}
}

func (m *Mode) evaluateBoard(board [size][size]int) int {
	score := 0
	opponentColor := black
	if m.Color == black {
		opponentColor = white
	}

	for x := 0; x < size; x++ {
		for y := 0; y < size; y++ {
			if board[x][y] == m.Color {
				score += evaluationBoard[x][y]
			} else if board[x][y] == opponentColor {
				score -= evaluationBoard[x][y]
			}
		}
	}
	return score
}

func (m *Mode) computerMove(board *[size][size]int) (int, int) {
	_, bestMove := m.minimax(*board, maxDepth, true, -1000, 1000)
	if bestMove.X == -1 && bestMove.Y == -1 {
		return -1, -1
	}
	placeMove(board, bestMove.X, bestMove.Y, m.Color)
	return bestMove.X, bestMove.Y
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func countPieces(board [size][size]int) (int, int) {
	blackCount, whiteCount := 0, 0
	for x := 0; x < size; x++ {
		for y := 0; y < size; y++ {
			if board[x][y] == black {
				blackCount++
			} else if board[x][y] == white {
				whiteCount++
			}
		}
	}
	return blackCount, whiteCount
}

/*
func computerMove(board *[size][size]int) (int, int) {
	moves := findValidMoves(*board, white)
	if len(moves) == 0 {
		return -1, -1
	}

	bestMove := moves[rand.Intn(len(moves))]
	placeMove(board, bestMove.X, bestMove.Y, white)
	return bestMove.X, bestMove.Y
}
*/

func checkGameOver(board [size][size]int) bool {
	blackMoves := findValidMoves(board, black)
	whiteMoves := findValidMoves(board, white)
	return len(blackMoves) == 0 && len(whiteMoves) == 0
}
