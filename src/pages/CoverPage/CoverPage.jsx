import { Link } from 'react-router-dom';
import HeroSection from '../../components/CoverPageComponents/HeroSection/HeroSection';
import styles from './CoverPage.module.scss';
import icons from '../../assets/icons.png'
import img1 from '../../assets/Group 858.png'
import img2 from '../../assets/Group 727.png'
import Footer from '../../components/Footer/Footer';
import coverImage from '../../assets/cover-imae.jpg';
import data from '../../coverpagedata';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { signOutUser } from '../../firebase/auth';

const CoverPage = () => {
    const user = useContext(AuthContext).user
    return (
        <>
            <div className={`${styles.root} p-relative d-grid`}>
                {user === 'loading' && <div className='loader translate-middle p-absolute top-50 tx-primary end-50 z-index-5' role="status" aria-label="Loading account"></div>}
                <HeroSection />
                <div className='d-flex flex-column pt-md-5 pt-4'>
                    <div className='me-auto'>
                        <div className={`${styles.dots} p-relative mx-auto d-flex`}></div>
                        <ul className={`${styles.links} ${user === 'loading' ? 'invisible' : ''} mt-4 list-unstyled`}>
                            {user ? (
                                <>
                                    <li><button className='btn-primary bg-dark tx-light' onClick={signOutUser}>Logout</button></li>
                                    <li><Link to='/auctions' className='btn-primary'>Auctions</Link></li>
                                </>
                            ) : <li><Link to='/login' className='btn-primary bg-dark tx-light'>Login</Link></li>}
                            <li><Link to='/blogs' className='btn-primary bg-secondary'>Car Blogs</Link></li>
                            <li><Link to='/contact-us' className='btn-primary bg-dark tx-light'>Contact US</Link></li>
                            <li><Link to='/about-us' className='btn-primary'>About US</Link></li>
                        </ul>
                    </div>
                    <div className={`${styles.triangle} p-relative d-flex mt-auto overflow-hidden`}>
                        <a className='overflow-hidden d-flex' href={data.link} target='_blank' rel="noreferrer">
                            <img src={coverImage} alt='' />
                        </a>
                        <span className='m-0 p-absolute start-50 tx-light top-50 translate-middle'>{data.title}</span>
                    </div>
                </div>
            </div>
            <div className='m-lg-5 py-md-5 m-4'>
                <div className='d-flex ai-center flex-column'>
                    <div>
                        <img src={icons} alt="" className='w-100' />
                    </div>
                    <div className='mt-md-5 pt-5'>
                        <img src={img1} alt='' className={styles.img} />
                    </div>
                    <div>
                        <img src={img2} alt='' className={styles.img} />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CoverPage;
