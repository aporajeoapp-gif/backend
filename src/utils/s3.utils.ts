import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import path from "path";

console.log("DEBUG: Initializing S3 Client with region:", process.env.AWS_REGION || "ap-south-1");
console.log("DEBUG: AWS_ACCESS_KEY_ID exists:", !!process.env.AWS_ACCESS_KEY_ID);
console.log("DEBUG: AWS_SECRET_ACCESS_KEY exists:", !!process.env.AWS_SECRET_ACCESS_KEY);

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "";

export const uploadToS3 = async (
  fileBuffer: Buffer,
  folder: string,
  fileName: string,
  contentType: string
): Promise<{ secure_url: string; public_id: string }> => {
  console.log("DEBUG: S3_BUCKET_NAME from env:", process.env.S3_BUCKET_NAME);
  console.log("DEBUG: BUCKET_NAME constant:", BUCKET_NAME);

  if (!BUCKET_NAME) {
    throw new Error("S3_BUCKET_NAME is not defined in environment variables");
  }

  const key = `${folder}/${Date.now()}_${path.basename(fileName)}`;

  console.log("DEBUG: Uploading to bucket:", BUCKET_NAME, "with key:", key);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    },
  });

  await upload.done();


  // Construct the URL. Note: If you use CloudFront, use that domain instead.
  const secure_url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return {
    secure_url,
    public_id: key,
  };
};

export const deleteFromS3 = async (urlOrKey: string): Promise<void> => {
  try {
    let key = urlOrKey;
    if (urlOrKey.startsWith("http")) {
      // Extract key from URL
      // https://bucket.s3.region.amazonaws.com/folder/filename
      const parts = urlOrKey.split(".amazonaws.com/");
      if (parts.length > 1) {
        key = parts[1];
      }
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error("S3 Delete Error:", error);
  }
};
