const resizeImageHandler = (file, cb) => {
    return new Promise((resolve, reject) => {
        if (file.size < 200000) return resolve(file);
        else {
            let width = 1100;
            let height = 1100;
            const fileName = file.name;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const natWidth = img.naturalWidth;
                    const natHeight = img.naturalHeight;
                    if (natWidth <= 500 && natHeight < 500) return cb(file);

                    if (natWidth > natHeight) {
                        const widthRatio = width / natWidth;
                        height = natHeight * widthRatio;
                    }
                    else if (natWidth < natHeight) {
                        const heightRatio = height / natHeight;
                        width = natHeight * heightRatio;
                    }
                    const elem = document.createElement('canvas');
                    elem.width = width;
                    elem.height = height;
                    const ctx = elem.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    ctx.canvas.toBlob((blob) => {
                        const file = new File([blob], fileName,
                            { type: 'image/jpeg', lastModified: Date.now() }
                        )
                        resolve(file);
                    }, 'image/jpeg', 1)
                }
                reader.onerror = error => reject(error);
            };
        }
    });
}


export default resizeImageHandler;