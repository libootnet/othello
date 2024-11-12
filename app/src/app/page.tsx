// import Image from "next/image";
import OthelloBoard from '../components/w-board';
// import { Button } from "@/components/ui/button";


export default function Home() {
  return (
    <>
      <header className="flex p-2 px-12 justify-between border-b border-green-600">
        <div className="flex">
          <h1 className="flex text-3xl font-bold text-gray-600">Othello</h1>
        </div>
        <div className="flex">
        </div>
      </header>
      <div className="flex flex-col justify-center items-center bg-gray-50 p-6">
        <OthelloBoard />
      </div>
    </>
  );
}
