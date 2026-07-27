import styles from './ProgressBar.module.scss';

const ProgressBar = ({ progress = 0 }) => (
    <div className={`p-absolute p-5 d-flex start-0 top-0 end-0 bottom-0 ${styles.root}`}>
        <div className={`flex-1 my-auto p-relative tx-primary overflow-hidden ${styles.bar}`}>
            <div style={{ width: `${progress}%` }}
                className='bg-primary tx-light d-flex ai-center jc-center'
            >
                <span className='translate-middle top-50 start-50 p-absolute'>{progress.toFixed()}%</span>
            </div>
        </div>
    </div>
)

export default ProgressBar;