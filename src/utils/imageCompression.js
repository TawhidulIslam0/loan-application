export async function compressImage(
  file,
  maxWidth = 1200,
  initialQuality = 0.7
) {
  // Only compress JPG/PNG images. PDFs are returned unchanged.
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image'));

      image.src = imageUrl;
    });

    // Maintain aspect ratio with a maximum width of 1200px.
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not create canvas context');
    }

    ctx.drawImage(img, 0, 0, width, height);

    const getCompressedBlob = (quality) =>
      new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }

            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      });

    let quality = initialQuality;
    let blob = await getCompressedBlob(quality);

    // Reduce quality by 0.1 until the image is <= 2MB
    // or quality reaches 0.3.
    while (blob.size > 2 * 1024 * 1024 && quality > 0.3) {
      quality = Math.max(0.3, quality - 0.1);
      blob = await getCompressedBlob(quality);
    }

    return new File([blob], file.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

