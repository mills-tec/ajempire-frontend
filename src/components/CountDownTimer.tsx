import { getCountdown } from "@/lib/utils";
import { useEffect, useState } from "react";

const CountdownTimer = ({ endTime }: { endTime: string }) => {
    const [countDown, setCountDown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });


    useEffect(() => {
        const timer = setInterval(() => {
            const { days, hours, minutes, seconds } = getCountdown(endTime);
            setCountDown({ days, hours, minutes, seconds });
        }, 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    return <span>{countDown.days.toString().padStart(2, "0")}:{countDown.hours.toString().padStart(2, "0")}:{countDown.minutes.toString().padStart(2, "0")}:{countDown.seconds.toString().padStart(2, "0")}</span>
}

export default CountdownTimer