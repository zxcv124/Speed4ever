import styles from './ImageWrapper.module.scss';

const ImageWrapper = ({ src, children, className }) => (
    <span className={`p-relative d-block ${className}`}>
        <span className={`${styles.wrapper} d-block`}>
            {src ? <img alt='' src={src} /> : children}
        </span>
    </span>
)

export default ImageWrapper;