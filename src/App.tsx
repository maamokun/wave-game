"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const randomArray = (length: number, level: number) => {
    const multiplier = level === 1 ? 10 : level === 2 ? 5 : 1;
    return Array.from({ length }, () => {
        const randomValue = Math.floor(Math.random() * 101); // Generates a number between 0 and 100
        return Math.floor(randomValue / multiplier) * multiplier;
    });
};

export default function WavePuzzle() {
    const canvasRef = useRef(null);
    const [wave1, setWave1] = useState(50);
    const [wave2, setWave2] = useState(50);
    const [wave3, setWave3] = useState(50);
    const [level, setLevel] = useState(0);
    const [targets, setTargets] = useState<number[][]>([]);
    const [currentTarget, setCurrentTarget] = useState(0);
    const [isCleared, setIsCleared] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);

    const targetAmplitudes = targets[currentTarget];

    const drawWave = (
        ctx: {
            beginPath: () => void;
            lineTo: (arg0: number, arg1: number) => void;
            strokeStyle: string;
            stroke: () => void;
        },
        amplitudes: number[],
        color: string,
    ) => {
        ctx.beginPath();
        for (let x = 0; x <= 600; x++) {
            const t = (x / 600) * 2 * Math.PI;
            const y =
                amplitudes.reduce(
                    (sum, amp, i) => sum + amp * Math.sin((i + 1) * t),
                    0,
                ) / 3;
            ctx.lineTo(x, 100 - y);
        }
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            //@ts-expect-error
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, 600, 200);
                drawWave(ctx, targetAmplitudes, "red");
                drawWave(ctx, [wave1, wave2, wave3], "blue");
            }
        }
    }, [wave1, wave2, wave3, targetAmplitudes]);

    useEffect(() => {
        if (timeLeft > 0 && !isCleared) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, isCleared]);

    const checkMatch = () => {
        const isMatch = targetAmplitudes.every(
            (target, i) => Math.abs(target - [wave1, wave2, wave3][i]) < 5,
        );
        if (isMatch) {
            if (currentTarget + 1 < targets.length) {
                toast.success("Correct! Next level!");
                setCurrentTarget(currentTarget + 1);
            } else {
                setIsCleared(true);
            }
        } else {
            toast.error("Not quite right. Try again!");
        }
    };

    const restart = () => {
        setWave1(50);
        setWave2(50);
        setWave3(50);
        setLevel(0);
        setCurrentTarget(0);
        setIsCleared(false);
        setTimeLeft(300);
    };

    const startLevel = (level: number) => {
        setLevel(level);
        setTargets([
            randomArray(3, level),
            randomArray(3, level),
            randomArray(3, level),
        ]);
        setCurrentTarget(0);
        setIsCleared(false);
        setTimeLeft(300);
        console.log(randomArray(3, level));
    };

    if (level === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
                <h1 className="text-4xl font-bold mb-6 text-center text-yellow-300 drop-shadow-lg">
                    Wave Synthesis Puzzle
                </h1>
                <div className="text-lg font-bold text-yellow-400 mb-4">
                    Select a level
                </div>
                <div className="flex flex-row space-x-5">
                    <button
                        onClick={() => startLevel(1)}
                        className="btn btn-info text-white"
                    >
                        Normal
                    </button>
                    <button
                        onClick={() => startLevel(2)}
                        className="btn btn-warning text-white"
                    >
                        Hard
                    </button>
                    <button
                        onClick={() => startLevel(3)}
                        className="btn btn-error text-white"
                    >
                        Impossible
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
            <h1 className="text-4xl font-bold mb-6 text-center text-yellow-300 drop-shadow-lg">
                Wave Synthesis Puzzle
            </h1>
            {timeLeft <= 0 && !isCleared && (
                <div>
                    <h2 className="text-3xl font-bold mb-4">Time's up! ⏰</h2>
                    <button
                        onClick={restart}
                        className="mt-6 px-6 py-3 btn btn-warning text-white"
                    >
                        Try Again
                    </button>
                </div>
            )}
            {isCleared ? (
                <div>
                    <h2 className="text-3xl font-bold mb-4">
                        You cleared all levels! 🎉
                    </h2>
                    <p className="text-xl">
                        Level:{" "}
                        {level === 1
                            ? "Normal"
                            : level === 2
                                ? "Hard"
                                : "Impossible"}
                    </p>
                    <p className="text-xl">Final Score: {timeLeft}</p>
                    <div className={"flex flex-row space-x-5"}>
                        <button
                            onClick={restart}
                            className="mt-6 px-6 py-3 btn btn-warning text-white"
                        >
                            Restart
                        </button>
                        <a
                            href={`https://twitter.com/intent/tweet?text=I%20just%20scored%20${timeLeft}%20in%20Wave%20Synthesis%20Puzzle!%0A%0Ahttps%3A//wavepuzzle.sachade.co/`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <button className="mt-6 px-6 py-3 btn btn-info text-white">
                                Share on Twitter
                            </button>
                        </a>
                    </div>
                </div>
            ) : (
                <>
                    <div className="text-lg font-bold text-yellow-400 mb-4">
                        Time Left: {timeLeft}s
                    </div>
                    <canvas
                        ref={canvasRef}
                        width="600"
                        height="200"
                        className="border-4 border-red-500 bg-gray-700 rounded-lg shadow-md mb-4"
                    ></canvas>

                    <div className="w-full max-w-md space-y-4">
                        {[wave1, wave2, wave3].map((wave, index) => (
                            <div key={index}>
                                <label
                                    htmlFor={`wave${index + 1}`}
                                    className="block mb-2"
                                >{`Wave ${index + 1} Amplitude`}</label>
                                <input
                                    id={`wave${index + 1}`}
                                    type="range"
                                    min="0"
                                    max="100"
                                    step={
                                        level === 1
                                            ? "10"
                                            : level === 2
                                                ? "5"
                                                : "1"
                                    }
                                    value={wave}
                                    onChange={(e) =>
                                        [setWave1, setWave2, setWave3][index](
                                            Number(e.target.value),
                                        )
                                    }
                                    className="w-full range range-success"
                                />
                                <p className="text-center mt-1">{wave}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={checkMatch}
                        className="mt-6 px-6 py-3 btn btn-success text-white"
                    >
                        Check Match
                    </button>
                </>
            )}
            <footer className="text-center py-10">
                <div className={"flex flex-col space-y-5"}>
                    <p>
                        Original code by
                        <a
                            href={
                                "https://github.com/peta-lite/wave-app"
                            }
                            className={"text-blue-400"}
                        >
                            {" "}
                            petalite
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
