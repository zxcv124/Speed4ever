import styles from './CarImage.module.scss';

const CarImage = ({ className, ...props }) => <img alt="" className={`${styles.root} ${className}`} {...props} />

export default CarImage;