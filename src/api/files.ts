import client from './client';

/**
 * Request a presigned upload URL for direct browser-to-MinIO upload.
 */
export async function getPresignedUploadUrl(prefix: string, fileName: string) {
  const res = await client.post('/api/v1/files/presigned-upload', { prefix, fileName });
  return res.data?.data as { presignedUrl: string; objectKey: string };
}

/**
 * Get a presigned download URL for a previously uploaded file.
 */
export async function getPresignedUrl(objectKey: string) {
  const res = await client.get('/api/v1/files/presigned-url', { params: { objectKey } });
  return res.data?.data as { presignedUrl: string; objectKey: string };
}

/**
 * Upload a file directly to MinIO via presigned PUT URL.
 * Returns the objectKey that should be stored in the entity.
 */
export async function uploadToMinIO(prefix: string, file: File): Promise<string> {
  // 1. Get presigned upload URL from backend
  const { presignedUrl, objectKey } = await getPresignedUploadUrl(prefix, file.name);

  // 2. Upload file directly to MinIO
  const uploadRes = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
  }

  // 3. Return the objectKey to be saved with the entity
  return objectKey;
}
