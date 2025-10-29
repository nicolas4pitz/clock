import { useEffect, useRef, useState } from "react";
import "./App.css";

function formatTime(seconds) {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}

function App() {
  //constantes pra limitar o relogio
    const DEFAULT_BREAK = 5;
    const DEFAULT_SESSION = 25;
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 60;

    const [breakLength, setBreakLength] = useState(DEFAULT_BREAK);
    const [sessionLength, setSessionLength] = useState(DEFAULT_SESSION); 
    const [timeLeft, setTimeLeft] = useState(DEFAULT_SESSION * 60); 
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState("Session"); 

    const intervalRef = useRef(null);
    const beepRef = useRef(null);

    
    useEffect(() => {
        if (!isRunning && mode === "Session") {
            setTimeLeft(sessionLength * 60);
        }
    }, [sessionLength, mode]); 

    
    useEffect(() => {
        if (!isRunning && mode === "Break") {
            setTimeLeft(breakLength * 60);
        }
    }, [breakLength, mode]); 

    useEffect(() => {
        if (isRunning) {
          //timer++
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev > 0) {
                        return prev - 1;
                    }
                  
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
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setBreakLength(DEFAULT_BREAK);
        setSessionLength(DEFAULT_SESSION);
        setMode("Session");
        setTimeLeft(DEFAULT_SESSION * 60);
        if (beepRef.current) {
            beepRef.current.pause();
            beepRef.current.currentTime = 0;
        }
    };

    const toggleStartStop = () => {
        if (isRunning) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setIsRunning(false);
        } else {
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

            {}
            <audio
                id="beep"
                ref={beepRef}
                src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
            />
        </>
    );
}

export default App;
