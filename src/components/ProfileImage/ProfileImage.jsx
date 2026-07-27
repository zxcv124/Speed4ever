import styles from './ProfileImage.module.scss';
import user from '../../assets/user-logo.svg';

const ProfileImage = ({src, username, className}) => (
    <div className={`${styles.root} d-flex flex-column gap-1 ai-center`}>
        <img alt='' src={src || user} className={className} />
        {username}
    </div>
)

export default ProfileImage;