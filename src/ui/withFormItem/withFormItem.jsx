import styles from './withFormItem.module.scss';


const withFormItem = WrappedComponent => ({label, className, helperText, errorText, ...props}) => {
    return (
        <label className={`${styles.root} d-grid gap-1 ${className}`}>
            <WrappedComponent {...props} className={styles.formfield} />
            {label && <span className={styles.label}>{label} {props.required && <span className='tx-danger'>*</span>}</span>}
            {helperText && <small className={styles.helperText}>{helperText}</small>}
            {errorText && <small className={`tx-danger d-none ${styles.errorText}`}>{errorText}</small>}
        </label>
    )
}

export default withFormItem;