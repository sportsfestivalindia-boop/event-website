import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "jxvpizz0",
  api_key: process.env.CLOUDINARY_API_KEY || "292298711582258",
  api_secret: process.env.CLOUDINARY_API_SECRET || "IxVi-TyfJYOIkqixdVmrRXQ6gH8",
  secure: true,
});

export { cloudinary };

/**
 * Upload a file (buffer, base64 data URI, or file path) to Cloudinary
 * @param file String (base64 URI / remote URL) or Buffer
 * @param folder Cloudinary folder name (e.g. 'athletes', 'passes', 'stalls')
 */
export async function uploadToCloudinary(
  file: string,
  folder = "sports-festival"
): Promise<{ url: string; secure_url: string; public_id: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "auto",
  });

  return {
    url: result.url,
    secure_url: result.secure_url,
    public_id: result.public_id,
  };
}
