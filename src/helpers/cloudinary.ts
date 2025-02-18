/** @format */

import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";
import * as streamifier from "streamifier";

cloudinary.config(process.env.CLOUDINARY_URL!);

interface CloudinaryUploadOptions {
  userId?: string; // Optional userId for profile images
  folder: "profile" | "event" | "organizer" | "transactions"; // Folder option
}

export const cloudinaryUpload = ({
  userId,
  folder,
  file,
}: CloudinaryUploadOptions & { file: { buffer: Buffer } }): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    if (!userId) return reject(new Error("userId is required"));

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${folder}/${userId}`, // Membuat folder berdasarkan userId di dalam folder utama
      },
      (error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) {
          return reject(error); // Error dari Cloudinary
        }
        if (!result) {
          return reject(new Error("Upload failed: No result returned.")); // Error jika tidak ada hasil
        }

        console.log("Cloudinary result:", result); // Log response dari Cloudinary untuk memastikan upload berhasil
        resolve(result); // Mengembalikan result jika ada
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });

export const extractPublicFromURL = (url: string): string => {
  const regex = /\/v\d+\/(.*)\.(jpg|jpeg|png|gif|webp)/; // Menangkap public_id dengan memperhitungkan versi dan ekstensi gambar
  const match = url.match(regex);
  return match ? match[1] : ""; // Mengembalikan public_id jika ditemukan
};
