// components/Modal.tsx
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <motion.div
                        className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-1 rounded-lg shadow-xl w-80 h-80"
                        initial={{ opacity: 0, y: -100, scale: 0.5, rotate: -15 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, y: 100, scale: 0.5, rotate: 15 }}
                        transition={{
                            duration: 0.8,
                            type: "spring",
                            damping: 10,
                            stiffness: 100,
                            bounce: 0.5,
                        }}
                    >
                        <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-purple-300 h-full flex flex-col items-center justify-center">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                {children}
                            </h2>
                            <button
                                className="px-6 py-2 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 hover:shadow-lg transition-all"
                                onClick={onClose}
                            >
                                close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
