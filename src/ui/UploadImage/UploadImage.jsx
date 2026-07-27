import { useState } from 'react';
import ImageWrapper from '../../components/ImageWrapper/ImageWrapper';
import Upload from '../../icons/Upload';
import styles from './UploadImage.module.scss';

const UploadImage = ({ className, onChange, multiple, icon = <Upload className='tx-secondary' />, showImage = true, ...props }) => {
    const [files, setFile] = useState([]);
    const onFileChange = e => {
        if (showImage) setFile([...e.target.files]);
        if (onChange) onChange(e)
    }
    return (
        <label className={`${styles.root} ${className} overflow-hidden text-center noselect d-flex flex-column cursor-pointer`}>
            <input type='file' accept="image/*" multiple={multiple} className='d-none' onChange={onFileChange} {...props} />
            <span className='d-block'>
                <ImageWrapper src={!multiple && files[0] && URL.createObjectURL(files[0])}>
                    {icon}
                </ImageWrapper>
            </span>
            <span className={styles.helperText}>
                {files[0] ? `Add different image${multiple ? 's' : ''}` : <>Add {multiple ? 'images' : 'an image'} {props.required && <span className='tx-danger'>*</span>}</>}
            </span>
        </label>
    )
}

export default UploadImage;