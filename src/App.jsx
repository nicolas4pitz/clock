import { useEffect, useRef, useState } from "react";
import "./App.css";

function formatTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}

function App() {
    const DEFAULT_BREAK = 5;
    const DEFAULT_SESSION = 25;
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 60;

    const [breakLength, setBreakLength] = useState(DEFAULT_BREAK); // minutes
    const [sessionLength, setSessionLength] = useState(DEFAULT_SESSION); // minutes
    const [timeLeft, setTimeLeft] = useState(DEFAULT_SESSION * 60); // seconds
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState("Session"); // "Session" or "Break"

    const intervalRef = useRef(null);
    const beepRef = useRef(null);

    // Keep timeLeft in sync if sessionLength changes while NOT running
    useEffect(() => {
        if (!isRunning && mode === "Session") {
            setTimeLeft(sessionLength * 60);
        }
    }, [sessionLength, mode]); // removed isRunning from deps to avoid running on pause

    // Keep timeLeft in sync if breakLength changes while NOT running and mode is Break
    useEffect(() => {
        if (!isRunning && mode === "Break") {
            setTimeLeft(breakLength * 60);
        }
    }, [breakLength, mode]); // removed isRunning from deps to avoid running on pause

    // Interval tick
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev > 0) {
                        return prev - 1;
                    }
                    // prev === 0 -> trigger switch and beep
                    if (beepRef.current) {
                        beepRef.current.currentTime = 0;
                        beepRef.current.play().catch(() => {});
                    }
                    if (mode === "Session") {
                        setMode("Break");
                        return breakLength * 60;
                    } else {
                        setMode("Session");
                        return sessionLength * 60;
                    }
                });
            }, 1000);
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            };
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, [isRunning, mode, breakLength, sessionLength]);

    const handleReset = () => {
        // stop timer
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        // reset values
        setBreakLength(DEFAULT_BREAK);
        setSessionLength(DEFAULT_SESSION);
        setMode("Session");
        setTimeLeft(DEFAULT_SESSION * 60);
        // reset audio
        if (beepRef.current) {
            beepRef.current.pause();
            beepRef.current.currentTime = 0;
        }
    };

    const toggleStartStop = () => {
        if (isRunning) {
            // Pause: clear the running interval and keep timeLeft as-is
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setIsRunning(false);
        } else {
            // Start/resume: set running true; interval effect will create interval
            setIsRunning(true);
        }
    };

    const changeBreak = (delta) => {
        setBreakLength(prev => {
            const next = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, prev + delta));
            return next;
        });
    };

    const changeSession = (delta) => {
        setSessionLength(prev => {
            const next = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, prev + delta));
            return next;
        });
    };

    return (
        <>
            <h1>Pomodoro Clock</h1>

            <div id="cont" style={{ display: "flex", gap: 40 }}>
                <div>
                    <div id="break-label">Break Length</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                            id="break-decrement"
                            onClick={() => changeBreak(-1)}
                            aria-label="Break decrement"
                        >
                            -
                        </button>
                        <div id="break-length">{breakLength}</div>
                        <button
                            id="break-increment"
                            onClick={() => changeBreak(1)}
                            aria-label="Break increment"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div>
                    <div id="session-label">Session Length</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                            id="session-decrement"
                            onClick={() => changeSession(-1)}
                            aria-label="Session decrement"
                        >
                            -
                        </button>
                        <div id="session-length">{sessionLength}</div>
                        <button
                            id="session-increment"
                            onClick={() => changeSession(1)}
                            aria-label="Session increment"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 24, textAlign: "center" }}>
                <div id="timer-label" style={{ fontSize: 20, marginBottom: 8 }}>
                    {mode}
                </div>
                <div id="time-left" style={{ fontSize: 36, fontWeight: "bold" }}>
                    {formatTime(timeLeft)}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
                    <button id="start_stop" onClick={toggleStartStop}>
                        {isRunning ? "Pause" : "Start"}
                    </button>
                    <button id="reset" onClick={handleReset}>Reset</button>
                </div>
            </div>

            {/* audio beep - must be id="beep" and >= 1s; using a public domain alarm sound */}
            <audio
                id="beep"
                ref={beepRef}
                src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
            />
        </>
    );
}

export default App;
