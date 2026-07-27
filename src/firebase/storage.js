import { getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import { auth } from './auth';

const storage = getStorage();

const getRef = path => ref(storage, path);

export const onUploadFile = (file, onUploading, itemId) => {
    const path = `${`${auth.currentUser.uid}${itemId ? `/${itemId}` : ''}`}/${new Date().getTime() + file.name}`;
    const uploadTask = uploadBytesResumable(getRef(path), file);
    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            snapshot => onUploading && onUploading((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            reject,
            () => {
                getDownloadURL(uploadTask.snapshot.ref)
                    .then(resolve)
            }
        )
    })

}


export const onDeleteFile = url => deleteObject(getRef(url.split('?alt')[0].split('/o/')[1].replace(/%2F/g, '/')))