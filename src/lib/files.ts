import { env } from "@/env";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { Upload } from "@aws-sdk/lib-storage";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function getDownloadUrl(objectName: string) {
  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: objectName,
    }),
    { expiresIn: 3600 }
  );
}

export async function uploadFileToBucket(file: File, filename: string) {
  const Key = filename;
  const Bucket = env.AWS_BUCKET_NAME;

  let res;

  try {
    const parallelUploads = new Upload({
      client: s3Client,
      params: {
        Bucket,
        Key,
        Body: file.stream(),
        ACL: "public-read",
        ContentType: file.type,
      },
      queueSize: 4,
      leavePartsOnError: false,
    });

    res = await parallelUploads.done();
  } catch (e) {
    throw e;
  }

  return res;
}

export async function getPresignedPostUrl(objectName: string, contentType: string) {
  return await createPresignedPost(s3Client, {
    Bucket: env.AWS_BUCKET_NAME,
    Key: objectName,
    Conditions: [
      ["content-length-range", 0, 1024 * 1024 * 2],
      ["starts-with", "$Content-Type", contentType],
    ],
    Expires: 600, // 10 minutes
    Fields: {
      "Content-Type": contentType,
    },
  });
}

export async function getFileUrl({ key }: { key: string }) {
  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn: 3600 }
  );
  return url;
}