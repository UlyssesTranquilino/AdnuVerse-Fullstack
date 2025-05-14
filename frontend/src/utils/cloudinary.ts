// cloudinary.ts
import axios from "axios";

export const uploadFile = async (
  fileType: "image" | "video",
  file: File
): Promise<string> => {
  const data = new FormData();
  data.append("file", file);
  data.append(
    "upload_preset",
    fileType === "image" ? "image_preset" : "video_preset"
  );

  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const resourceType = fileType;
    const api = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const res = await axios.post(api, data);
    return res.data.secure_url;
  } catch (error) {
    console.error(`Error uploading ${fileType}:`, error);
    return "";
  }
};
