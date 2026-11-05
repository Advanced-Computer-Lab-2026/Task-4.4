export const MAX_PHOTOS = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validatePhotoSelection(files, existingCount = 0) {
  if (existingCount + files.length > MAX_PHOTOS) return `Add up to ${MAX_PHOTOS} photos per report. Remove a photo before adding more.`;
  for (const file of files) {
    if (!supportedTypes.has(file.type)) return `${file.name}: choose a JPG, PNG or WebP image.`;
    if (file.size > MAX_FILE_BYTES) return `${file.name}: choose an image of 10 MB or smaller.`;
  }
  return '';
}

// Resize and re-encode uploads so several photos fit the standalone browser demo.
export async function preparePhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1000 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let dataUrl = canvas.toDataURL('image/jpeg', 0.75);
    if (dataUrl.length > 250000) dataUrl = canvas.toDataURL('image/jpeg', 0.45);
    if (dataUrl.length > 350000) throw new Error();
    return {id: crypto.randomUUID(), name: file.name, dataUrl};
  } catch {
    throw new Error(`${file.name}: this image could not be prepared. Try a smaller JPG, PNG or WebP file.`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
