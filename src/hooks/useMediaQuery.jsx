import { useEffect, useState } from "react"

const useMediaQuery = (size, cb) => {
    const [isMatched, setIsMatched] = useState(false);
    useEffect(() => {
        const x = window.matchMedia(`(max-width: ${size}px)`);
        const callBack = () => {
            cb && cb(x.matches);
            setIsMatched(x.matches);
        }
        callBack();
        x.addEventListener('change', callBack);
    }, [])
    return isMatched;
}

export default useMediaQuery;