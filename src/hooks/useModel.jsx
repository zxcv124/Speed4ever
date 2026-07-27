import { useEffect } from 'react';

const useModel = (props = {}) => {
    const { shouldWork = true } = props;
    useEffect(() => {
        if (!shouldWork) return;
        const overflow = document.body.style.overflow;
        if (overflow !== 'hidden') {
            document.body.style.overflow = 'hidden'
            return () => document.body.style.overflow = '';
        };
    }, [shouldWork]);
    return null;
}

export default useModel;
