import styles from './HeroSection.module.scss';
import logo from '../../../assets/fulllogo.png'
import heroImg from '../../../assets/homepage-img.png';
import User from '../../../icons/User';
import { useContext } from 'react';
import AuthContext from '../../../context/AuthContext';

const HeroSection = () => {
    const user = useContext(AuthContext).user
    return (
        <div className='p-relative z-index-1'>
            <img alt='' src={heroImg} className='w-100 d-block' id='top' />
            <div className={`end-0 top-0 p-absolute ${styles.main}`}>
                <div className='bg-light'>
                    <div className={`${styles.logoContainer} py-2 pe-3 ps-5 bg-light`}>
                        <img src={logo} alt="" className='w-100' />
                    </div>
                </div>
                {user && user !== 'loading' && (
                    <div className='d-flex gap-md-3 gap-2 ai-center me-md-4 m-3 mt-md-5'>
                        <User className={styles.user} />
                        {user.displayName}
                    </div>
                )}
            </div>
        </div>
    )
}

export default HeroSection;