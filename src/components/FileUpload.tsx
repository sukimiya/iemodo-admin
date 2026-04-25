import { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { uploadToMinIO } from '../api/files';

interface FileUploadProps {
  prefix: string;
  value?: string;
  onChange?: (objectKey: string) => void;
  accept?: string;
  maxSize?: number; // MB
}

export default function FileUpload({ prefix, value, onChange, accept = 'image/*', maxSize = 5 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  const fileList: UploadFile[] = value
    ? [{ uid: '-1', name: value.split('/').pop() || value, status: 'done', url: value }]
    : [];

  const beforeUpload = async (file: RcFile) => {
    const isLt = file.size / 1024 / 1024 < maxSize;
    if (!isLt) {
      message.error(`文件大小不能超过 ${maxSize}MB`);
      return false;
    }

    setUploading(true);
    try {
      const objectKey = await uploadToMinIO(prefix, file);
      onChange?.(objectKey);
      message.success('上传成功');
    } catch {
      message.error('上传失败');
    } finally {
      setUploading(false);
    }

    // Prevent default upload behavior
    return false;
  };

  const handleRemove = () => {
    onChange?.('');
  };

  return (
    <Upload
      fileList={fileList}
      beforeUpload={beforeUpload}
      onRemove={handleRemove}
      maxCount={1}
      accept={accept}
      showUploadList={{ showPreviewIcon: false }}
    >
      <Button icon={<UploadOutlined />} loading={uploading} disabled={uploading}>
        {uploading ? '上传中...' : (value ? '重新上传' : '上传')}
      </Button>
    </Upload>
  );
}
