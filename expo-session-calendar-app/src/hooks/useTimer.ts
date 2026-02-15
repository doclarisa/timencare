import { useEffect, useState } from 'react';

const useTimer = (initialTime: number) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }

        return () => clearInterval(timer);
    }, [isActive, timeLeft]);

    const startTimer = () => {
        setIsActive(true);
    };

    const stopTimer = () => {
        setIsActive(false);
    };

    const resetTimer = () => {
        setTimeLeft(initialTime);
        setIsActive(false);
    };

    return { timeLeft, isActive, startTimer, stopTimer, resetTimer };
};

export default useTimer;