import { useCallback, useEffect } from "react";

const useCSSHeightListener = ({ key, value, ref }) => {
    const cb = useCallback(() => {
        if ((ref && !ref.current) && !value) return;
        const doc = document.documentElement
        doc.style.setProperty(key, `${value || ref.current.offsetHeight}px`);
    }, [key, value, ref]);

    useEffect(() => {
        cb();
        window.addEventListener('resize', cb);
        window.addEventListener('orientationchange', cb);
        return () => {
            window.removeEventListener('resize', cb);
            window.removeEventListener('orientationchange', cb);
        }
    }, [cb]);
}

export default useCSSHeightListener;
