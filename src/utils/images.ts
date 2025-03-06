
import { ImageData } from "@/types/types";

// Generate a unique ID for images
export const generateImageId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Convert a file to base64 for storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Create a thumbnail from a base64 image
export const createThumbnail = (
  base64Image: string,
  maxWidth = 200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Calculate the new dimensions
      const ratio = img.width / img.height;
      const width = Math.min(maxWidth, img.width);
      const height = width / ratio;

      // Set canvas dimensions and draw the image
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Get the thumbnail as a base64 string
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
  });
};

// Process uploaded files into ImageData objects
export const processImageFiles = async (
  files: FileList
): Promise<ImageData[]> => {
  const results: ImageData[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith("image/")) continue;

    try {
      const base64 = await fileToBase64(file);
      const thumbnail = await createThumbnail(base64);
      results.push({
        id: generateImageId(),
        url: base64,
        thumbnail,
        caption: file.name,
      });
    } catch (error) {
      console.error("Error processing image:", error);
    }
  }

  return results;
};
