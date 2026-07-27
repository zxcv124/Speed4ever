import BackButton from '../../BackButton/BackButton';
import Footer from '../../components/Footer/Footer';
import logo from '../../assets/fulllogo.png';

const supportEmail = 'm.ubaidbadar@gmail.com';

const ContactPage = () => (
    <>
        <main className="p-lg-5 p-4 min-vh-100 d-flex flex-column gap-4">
            <div className="d-flex ai-center jc-between">
                <BackButton />
                <img src={logo} alt="Speed4Ever" className="logo" />
            </div>
            <section className="m-auto d-grid gap-4 col-lg-6 col-md-8 col-sm-1">
                <h1 className="m-0 tx-primary">Contact Speed4Ever</h1>
                <p className="m-0">
                    For auction support, account questions, or listing issues, contact the
                    Speed4Ever team by email.
                </p>
                <a className="btn-primary bg-dark tx-light me-auto" href={`mailto:${supportEmail}`}>
                    Email Support
                </a>
                <div className="d-grid gap-2">
                    <strong>Before contacting support</strong>
                    <span>Include your username and the listing or blog link.</span>
                    <span>For auction issues, include the product title and bid amount.</span>
                    <span>Never send passwords or one-time passcodes by email.</span>
                </div>
            </section>
        </main>
        <Footer />
    </>
);

export default ContactPage;
