'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './modal';

type CellState = 0 | 1 | 2;
type BoardState = CellState[][];

const initialBoard: BoardState = Array(8).fill(null).map(() => Array(8).fill(0));
const booleanToNumber = (value: boolean): number => Number(value);

export default function OthelloBoard() {
    const [board, setBoard] = useState<BoardState>(initialBoard);
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [status, setStatus] = useState("please select color");
    const [black, setBlack] = useState(0);
    const [white, setWhite] = useState(0);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [message, setWinnerMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [playerColor, setPlayerColor] = useState<'black' | 'white' | null>(null);
    const [isOrderSelected, setIsOrderSelected] = useState(false);

    const closeModal = () => setIsModalOpen(false);

    const isInitialBoardReceived = useRef<boolean>(false);
    const isFirst =  useRef<boolean>(false);

    useEffect(() => {
        const newSocket = new WebSocket("ws://localhost:8080/ws");

        newSocket.onmessage = (event) => {
            const gameState = JSON.parse(event.data);

            if (!isInitialBoardReceived.current) {
                setBoard(gameState.board);
                setBlack(gameState.black);
                setWhite(gameState.white);
                isInitialBoardReceived.current = true;
                return;
            }

            if (gameState.winner !== undefined) {
                setGameOver(true);
                setWinnerMessage(gameState.message);
                setIsModalOpen(true);
                return;
            }

            setBlack(gameState.black);
            setWhite(gameState.white);
            setBoard(gameState.board);

            setIsPlayerTurn(true);
            if (isFirst.current) {
                setStatus("Your turn");
                isFirst.current = false;
                return;
            }

            isFirst.current = true;
        };

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);


    const handlePlayerMove = (x: number, y: number) => {
        if (gameOver || !isPlayerTurn || board[x][y] !== 0 || !socket || socket.readyState !== WebSocket.OPEN) return;

        socket.send(JSON.stringify({ x, y, color: playerColor === 'black' ? 1 : 2 }));
        setIsPlayerTurn(false);
        setStatus("Your opponent's turn.");
    }

    const handleStartColorSelection = (color: 'black' | 'white') => {
        setPlayerColor(color);
        setStatus("first or second?");
    }

    const handleOrderSelection = (order: 'first' | 'second') => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const isStarting = order === 'first';
            isFirst.current = !isStarting;
            socket.send(JSON.stringify({ color: playerColor, turn: booleanToNumber(!isStarting) + 1, }));
            setIsPlayerTurn(isStarting);
            setStatus(isStarting ? "Your turn" : "Your opponent's turn");
            setIsOrderSelected(true);
        }
    }

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={closeModal} children={message} />

            <div className="flex flex-col items-center justify-center p-4">
                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
                    <motion.div
                        id="board"
                        className="grid grid-cols-8 gap-1 bg-green-800 rounded-2xl shadow-2xl p-4"
                        style={{
                            width: 'min(90vw, 450px)',
                            height: 'min(90vw, 450px)',
                        }}
                        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                    >
                        {board.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <motion.button
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`w-full h-full rounded-full focus:outline-none relative overflow-hidden
                                    ${cell === 0 ? 'bg-green-700 hover:bg-green-600' : ''}`}
                                    onClick={() => handlePlayerMove(rowIndex, colIndex)}
                                    whileHover={{ scale: 1.1, zIndex: 10 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <AnimatePresence>
                                        {cell !== 0 && (
                                            <motion.div
                                                className={`absolute inset-1 rounded-full ${cell === 1 ? 'bg-gray-900' : 'bg-gray-100'}`}
                                                initial={{ scale: 0, opacity: 0, rotateY: 180 }}
                                                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                                                exit={{ scale: 0, opacity: 0, rotateY: -180 }}
                                                transition={{ duration: 0.5 }}
                                                style={{
                                                    boxShadow: `0 4px 6px rgba(0, 0, 0, 0.3), 
                                                inset 0 -2px 5px rgba(0, 0, 0, 0.2),
                                                0 0 10px ${cell === 1 ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'}`,
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            ))
                        )}
                    </motion.div>

                    <div
                        id="status-card"
                        className="bg-green-700 p-6 rounded-lg shadow-2xl flex flex-col items-center text-center border border-green-500"
                        style={{ minWidth: '300px', maxWidth: '500px' }}
                    >
                        <div className="text-xl text-gray-50 font-bold mb-6 tracking-wide">
                            {status}
                        </div>

                        <div className="flex items-center justify-between w-full px-8 py-2 mb-2 bg-green-800 rounded-full shadow-md">
                            <div className="w-5 h-5 rounded-full bg-gray-900 shadow-lg transform transition duration-300 hover:scale-110"></div>
                            <div className="flex-1 text-xl text-gray-50 font-semibold text-right">{black}</div>
                        </div>

                        <div className="flex items-center justify-between w-full px-8 py-2 mt-2 bg-green-800 rounded-full shadow-md">
                            <div className="w-5 h-5 rounded-full bg-gray-100 shadow-lg transform transition duration-300 hover:scale-110"></div>
                            <div className="flex-1 text-xl text-gray-50 font-semibold text-right">{white}</div>
                        </div>

                        {playerColor && isOrderSelected && (
                            <div className='flex flex-col w-full'>
                                <div className="flex items-center justify-between w-full px-8 py-2 mb-2 bg-green-800 rounded-full shadow-md mt-4">
                                    <div className="flex-1 text-md text-gray-50 font-semibold text-left">you</div>
                                    {playerColor == 'black' && (
                                        <div className="w-5 h-5 rounded-full bg-gray-900 shadow-lg transform transition duration-300 hover:scale-110"></div>
                                    )}
                                    {playerColor == 'white' && (
                                        <div className="w-5 h-5 rounded-full bg-gray-100 shadow-lg transform transition duration-300 hover:scale-110"></div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!playerColor && (
                            <div className="flex justify-around w-full mt-4 space-x-4">
                                <button
                                    className="bg-gray-900 text-white text-md font-medium px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                                    onClick={() => handleStartColorSelection('black')}
                                >
                                    black
                                </button>
                                <button
                                    className="bg-gray-100 text-gray-900 text-md font-medium px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                                    onClick={() => handleStartColorSelection('white')}
                                >
                                    white
                                </button>
                            </div>
                        )}

                        {playerColor && !isOrderSelected && (
                            <div className="flex justify-around w-full mt-4 space-x-4">
                                <button
                                    className="bg-gray-900 text-white text-md font-medium px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                                    onClick={() => handleOrderSelection('first')}
                                >
                                    first
                                </button>
                                <button
                                    className="bg-gray-100 text-gray-900 text-md font-medium px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                                    onClick={() => handleOrderSelection('second')}
                                >
                                    second
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
