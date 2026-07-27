import styles from './Layout.module.scss'

const Layout = ({children}) => {
    return (
        <div className={styles.root}>
            <div className={`bottom-0 d-flex overflow-hidden p-absolute top-0 end-0 start-0`}>
                <div className={`${styles.lines} d-flex gap-3`}>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
            <div className='p-relative z-index-1'>{children}</div>
        </div>
    )
}


export default Layout;