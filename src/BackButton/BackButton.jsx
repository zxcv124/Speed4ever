import useGoBack from "../hooks/useGoBack";
import ArrowBack from "../icons/ArrowBack";

const BackButton = () => <button className='btn-icon no-spacing' onClick={useGoBack()}><ArrowBack /></button>

export default BackButton;