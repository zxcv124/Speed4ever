import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import ArrowCircle from '../../icons/ArrowUp';
import Facebook from '../../icons/Facebook';
import Instagram from '../../icons/Instagram';
import Twitter from '../../icons/Twitter';
import styles from './footer.module.scss';

const Footer = () => {
    return (
        <footer className="p-lg-5 p-4 bg-dark tx-light p-relative">
            <div className='my-5 py-lg-3'>
                <Link to='/'>
                    <img alt='' src={logo} className={`${styles.logo} me-auto d-block`} />
                </Link>
                <p className='my-5'>About Us sction sdffg rg sdfgbsfdg dgfh sdfgfdg fdg sdfg dfg df Rfgdsf gdfgsdfgdfs dog fdgfdg sdfgsfdg dsfgdsfg dfgsd fgfdg  Sfdgfdsgsfdg fsdgfdsg sdfgfdsgdfsgisdfgdfg gdsfg sdfg </p>
                <ul className='list-unstyled d-flex gap-5 tx-dark jc-end'>
                    <li><a className='btn-icon bg-light' href='https://www.facebook.com/'> <Facebook /> </a></li>
                    <li><a className='btn-icon bg-light' href='https://www.twitter.com/'> <Twitter /> </a></li>
                    <li><a className='btn-icon bg-light' href='https://www.instagram.com/'> <Instagram /> </a></li>
                </ul>
                <div className='d-flex ai-end flex-column mt-5'>
                    <div className='d-grid gap-3'>
                        <div>
                            <h2 className={styles.title}>Link</h2>
                            <ul className={`list-unstyled d-grid gap-3`}>
                                <li><Link to='/car-blog'>Car Blog</Link></li>
                                <li><Link to='/auction'>Auction</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h2 className={styles.title}>Info</h2>
                            <ul className={`list-unstyled d-grid gap-3`}>
                                <li><Link to='/about-us'>Who Are WE</Link></li>
                                <li><Link to='/privacy-policy'>Privacy policy</Link></li>
                                <li><Link to='/terms-and-conditions'>Terms of use</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h2 className={styles.title}>Help desk</h2>
                            <ul className={`list-unstyled d-grid gap-3`}>
                                <li><Link to='/contact-us'>Contact us</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <p className='text-center mt-5'>Copyright speed4ever 2021</p>
            </div>
            <a href='#top' className='btn-icon h4 bottom-0 p-absolute end-0 m-2'>
                <ArrowCircle />
            </a>
        </footer>
    )
}

export default Footer;