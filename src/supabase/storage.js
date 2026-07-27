import { auth } from './auth';
import supabase from './client';

const bucket = process.env.REACT_APP_SUPABASE_STORAGE_BUCKET || 'speed4ever-images';

const sanitizeFileName = name => String(name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '-');

const pathFromPublicUrl = url => {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(marker);
    return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

export const onUploadFile = async (file, onUploading, itemId) => {
    const user = auth.currentUser;
    if (!user) throw Error('You need to login again.');

    const path = `${user.uid}${itemId ? `/${itemId}` : ''}/${Date.now()}-${sanitizeFileName(file.name)}`;
    onUploading && onUploading(10);

    const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '31536000',
            contentType: file.type,
            upsert: false
        });

    if (error) throw error;
    onUploading && onUploading(100);

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

export const onDeleteFile = async url => {
    const path = pathFromPublicUrl(url);
    if (!path) return;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
}
