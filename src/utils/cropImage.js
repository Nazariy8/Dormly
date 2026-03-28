export const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  return new Promise((resolve) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Встановлюємо розмір результату (наприклад, 400x400 для аватара)
      canvas.width = 400;
      canvas.height = 400;

      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, 400, 400
      );

      // Стискаємо до JPEG, щоб точно вписатися в ліміти Firebase
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};