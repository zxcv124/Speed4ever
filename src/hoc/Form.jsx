import React, { useCallback, useEffect, useRef, useState } from "react";
import { getRecaptcha } from "../firebase/auth";

const Form = ({ footer, onSubmit, children, isRecaptcha = false, id, ...props }) => {
    const [{ err, isLoading, message }, setStatus] = useState({});

    const formRef = useRef();
    const isSubmittingRef = useRef(false);
    const submitHandlerRef = useRef(null);

    const onFormSubmit = useCallback(e => {
        if (isSubmittingRef.current) return;
        if (typeof e === "object") e.preventDefault();

        const form = formRef.current;
        if (!form) return;

        if (!form.classList.contains('submitted')) form.classList.add('submitted')

        const formData = new FormData(form);
        const values = {};
        for (let key of formData.keys()) {
            const { type, value, files } = form[key];
            values[key] = type === 'file' ? files : (type === 'number' ? +value : (value || formData.getAll(key)));
        }

        const isValid = form.checkValidity();
        form.classList.add('submitted');
        if (!isValid) return;
        isSubmittingRef.current = true;
        setStatus({ isLoading: true });


        if (!onSubmit) {
            isSubmittingRef.current = false;
            return;
        }
        onSubmit({
            values,
            form,
            onSuccess: message => {
                isSubmittingRef.current = false;
                form.classList.remove('submitted');
                form.reset();
                setStatus({ message });
            },
            onFailure: (err) => {
                isSubmittingRef.current = false;
                setStatus({ err })
            },
            formData,
        })
    }, [onSubmit])

    useEffect(() => {
        submitHandlerRef.current = onFormSubmit;
    }, [onFormSubmit])

    useEffect(() => {
        if (!isRecaptcha || !id) return undefined;

        let isMounted = true;
        getRecaptcha(
            id,
            () => submitHandlerRef.current && submitHandlerRef.current(),
            err => isMounted && setStatus({ err })
        ).catch(err => {
            if (isMounted) setStatus({ err });
        });

        return () => {
            isMounted = false;
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        }
    }, [id, isRecaptcha])


    return (
        <form onSubmit={onFormSubmit} {...props} noValidate="novalidate" ref={formRef}>
            {children}
            {err && <small className='tx-danger'>{err.message || err}</small>}
            {message && <small className="tx-primary">{message}</small>}
            {footer && footer(isLoading, id)}
        </form>
    )
}

export default Form;
