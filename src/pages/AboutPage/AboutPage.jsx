import BackButton from '../../BackButton/BackButton';
import Footer from '../../components/Footer/Footer';
import logo from '../../assets/fulllogo.png';

const AboutPage = () => (
    <>
        <main className="p-lg-5 p-4 min-vh-100 d-flex flex-column gap-4">
            <div className="d-flex ai-center jc-between">
                <BackButton />
                <img src={logo} alt="Speed4Ever" className="logo" />
            </div>
            <section className="m-auto d-grid gap-4 col-lg-6 col-md-8 col-sm-1">
                <h1 className="m-0 tx-primary">About Speed4Ever</h1>
                <p className="m-0">
                    Speed4Ever connects car enthusiasts across the UAE through auction listings,
                    vehicle stories, and owner-submitted media.
                </p>
                <p className="m-0">
                    The platform is built around authenticated listings, owner-managed uploads,
                    public browsing, and secure bid handling for automotive parts and vehicles.
                </p>
                <div className="d-grid gap-2">
                    <strong>What we support</strong>
                    <span>Auctions for automotive items and parts</span>
                    <span>Car blogs with owner contact links</span>
                    <span>Image-backed listings and authenticated seller profiles</span>
                </div>
            </section>
        </main>
        <Footer />
    </>
);

export default AboutPage;
