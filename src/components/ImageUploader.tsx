import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { InboxOutlined, LoadingOutlined } from '@ant-design/icons';

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  onFileSelect?: (file: File | null) => void;
  placeholder?: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ImageUploader = ({
  value,
  onChange,
  onFileSelect,
  placeholder = '点击或拖拽上传封面'
}: ImageUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(value || '');
  }, [value]);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('请上传图片文件');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      message.error('图片大小不能超过 5MB');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setPreviewUrl(base64Url);
      onChange?.(base64Url);
      onFileSelect?.(file);
      setLoading(false);
      message.success('封面上传成功');
    };
    reader.onerror = () => {
      message.error('图片读取失败');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    setPreviewUrl('');
    onChange?.('');
    onFileSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      style={{
        width: '100%',
        height: '160px',
        border: '2px dashed #C8E6C9',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: previewUrl
          ? `url(${previewUrl}) center/cover no-repeat`
          : 'rgba(200, 230, 201, 0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(event) => {
        if (previewUrl) {
          event.currentTarget.style.filter = 'brightness(0.9)';
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.filter = 'brightness(1)';
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {!previewUrl && (
        <>
          {loading ? (
            <LoadingOutlined style={{ fontSize: '32px', color: '#81C784' }} />
          ) : (
            <>
              <InboxOutlined style={{ fontSize: '40px', color: '#81C784', marginBottom: '12px' }} />
              <div style={{ color: '#616161', fontSize: '14px', textAlign: 'center' }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>{placeholder}</div>
                <div style={{ fontSize: '12px', color: '#9E9E9E' }}>支持 JPG、PNG 格式，最大 5MB</div>
              </div>
            </>
          )}
        </>
      )}

      {previewUrl && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 10
          }}
          onClick={handleClear}
        >
          <span style={{ color: '#757575', fontSize: '16px', lineHeight: 1 }}>x</span>
        </div>
      )}

      {previewUrl && (
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '8px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
            color: 'white',
            fontSize: '12px',
            textAlign: 'center'
          }}
        >
          点击更换封面
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
