import { useEffect, useState } from 'react';
import { getPresignedUrl } from '../api/files';

interface PresignedImageProps {
  objectKey?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const cache = new Map<string, { url: string; expiry: number }>();

function getCachedUrl(objectKey: string): string | null {
  const entry = cache.get(objectKey);
  if (entry && entry.expiry > Date.now()) return entry.url;
  cache.delete(objectKey);
  return null;
}

function setCachedUrl(objectKey: string, url: string) {
  cache.set(objectKey, { url, expiry: Date.now() + 30 * 60 * 1000 });
}

const PLACEHOLDER = 'https://placehold.co/48x48/e2e8f0/94a3b8?text=N/A';

export default function PresignedImage({ objectKey, width = 48, height = 48, style }: PresignedImageProps) {
  const [url, setUrl] = useState<string>(PLACEHOLDER);

  useEffect(() => {
    if (!objectKey) { setUrl(PLACEHOLDER); return; }
    if (objectKey.startsWith('http://') || objectKey.startsWith('https://')) { setUrl(objectKey); return; }

    const cached = getCachedUrl(objectKey);
    if (cached) { setUrl(cached); return; }

    getPresignedUrl(objectKey).then(res => {
      setCachedUrl(objectKey, res.presignedUrl);
      setUrl(res.presignedUrl);
    }).catch(() => setUrl(PLACEHOLDER));
  }, [objectKey]);

  return (
    <img
      src={url}
      width={width}
      height={height}
      style={{ objectFit: 'contain', borderRadius: 4, ...style }}
      alt=""
      onError={() => setUrl(PLACEHOLDER)}
    />
  );
}
