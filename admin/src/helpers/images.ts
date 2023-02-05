const PREVIEW_WIDTH = 180; // px

const createBlob = (img: HTMLImageElement): Promise<Blob | null> =>
  new Promise((resolve) => {
    const imageAspect = img.width / img.height;

    const canvas = document.createElement('canvas');
    canvas.width = PREVIEW_WIDTH;
    canvas.height = Math.max(PREVIEW_WIDTH / imageAspect, 1);

    try {
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, PREVIEW_WIDTH, PREVIEW_WIDTH / imageAspect);
      canvas.toBlob(resolve, 'image/jpeg');
    } catch (err) {
      /**
       * Fail silently if we're unable to generate a preview image.
       * Can happen with SVGs containing `<foreignObject>` elements.
       */
      console.warn(`Unable to generate preview image:`, err);
    }
  });

const createImageEl = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve) => {
    const blobUrlLarge = window.URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      window.URL.revokeObjectURL(blobUrlLarge);
      resolve(img);
    };
    img.src = blobUrlLarge;
  });

export const generatePreviewBlobUrl = async (file: File) => {
  const imageEl = await createImageEl(file);
  const blob = await createBlob(imageEl);

  if (!blob) {
    throw Error('Unable to generate file Blob');
  }

  return window.URL.createObjectURL(blob);
};
