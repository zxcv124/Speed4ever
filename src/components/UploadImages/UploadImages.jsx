import { useState } from "react";
import UploadImage from "../../ui/UploadImage/UploadImage";
import ImageWrapper from "../ImageWrapper/ImageWrapper";
import styles from './UploadImages.module.scss';
import ProgressBar from "../../ui/ProgressBar/ProgressBar";
import { onDeleteFile, onUploadFile } from "../../supabase/storage";
import Trash from "../../icons/Trash";
import resizeImageHandler from "../../utils/resizeImageHandler";

const UploadImages = ({ onSubmit, images = [], id }) => {

    const [{ index, progress, files = [...images], isLoading = false }, setStatus] = useState({});

    const onChange = async e => {
        const newFiles = [...files];
        setStatus({ isLoading: true })
        for (let i = 0; i < e.target.files.length; i++) {
            const file = await resizeImageHandler(e.target.files[i]);
            newFiles.push(file);
        }
        setStatus({ files: newFiles });
    }
    const onSave = async () => {

        const newFiles = files.slice(0, 5)
        const urls = [];

        for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            if (typeof file === 'string') urls.push(file);
            else {
                await onUploadFile(newFiles[i], progress => setStatus({ files, index: i, progress, isLoading: true }), id)
                    .then(res => urls.push(res))
                    .catch(err => console.log(err.message))
            }

        }

        for (let i = 0; i < images.length; i++) if (!urls.includes(images[i])) onDeleteFile(images[i])

        onSubmit(urls);

    }

    const removeImage = file => {
        const newFiles = files.filter(f => f !== file);
        setStatus({ files: newFiles });
    }

    return (
        <>

            <div
                className={`
                    flex-1 pb-5 d-flex gap-3 flex-column ai-center jc-center overflow-hidden
                    ${styles.root}
                `}
            >
                {files.length < 5 && !isLoading && (
                    <div className={styles.uploadWrapper}>
                        <UploadImage
                            multiple={true}
                            showImage={false}
                            onChange={onChange}
                        />
                    </div>
                )}
                {files.length > 0 && (
                    <div className="d-flex gap-3 flex-wrap jc-center ai-center p-relative flex-1 overflow-auto">
                        {files.slice(0, 5).map((file, i) => (
                            <div key={i} className={`${styles.wrapper} p-relative`}>
                                {index === i && <ProgressBar progress={progress} />}
                                <ImageWrapper src={typeof file === 'string' ? file : URL.createObjectURL(file)} />
                                {!isLoading && <button className="btn-icon p-absolute tx-danger start-0 top-0" onClick={() => removeImage(file)}><Trash /></button>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {files.length > 0 && (
                <>
                    <button className="btn-primary me-md-auto mt-3 px-5 d-lg-flex d-none" onClick={onSave} loading={isLoading ? "loading" : ""}>Save</button>
                    <div className="p-absolute d-md-none start-0 mt-5 ms-md-5 ms-4 mt-4 top-0">
                        {isLoading ? <span className="loader"></span> : <button className="btn btn-text" onClick={onSave}>Save</button>}
                    </div>
                </>
            )}
        </>
    )
}

export default UploadImages;