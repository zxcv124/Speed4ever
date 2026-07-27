import emailjs from '@emailjs/browser';

const emailHandler = (form, templateID = "template_yp5dplo") => emailjs.send("service_j8ixvec", templateID, form, "user_yjoPqa7StizDtVPCBm3PO")

export default emailHandler;