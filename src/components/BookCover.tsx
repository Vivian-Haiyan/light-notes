import { useState } from 'react';
import { BookOutlined } from '@ant-design/icons';

interface BookCoverProps {
  coverUrl: string | null;
  style?: React.CSSProperties;
  className?: string;
  alt?: string;
  fit?: 'cover' | 'contain';
}

const BookCover = ({
  coverUrl,
  style = {},
  className = '',
  alt = '书籍封面',
  fit = 'cover'
}: BookCoverProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const isCoverValid = coverUrl && !imageError;

  return (
    <div
      className={className}
      style={{
        ...style,
        background: isCoverValid
          ? `url(${coverUrl})`
          : 'linear-gradient(135deg, #C8E6C9 0%, #E3F2FD 100%)',
        backgroundSize: fit,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {!isCoverValid && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.5
        }}>
          <BookOutlined style={{ fontSize: '48px', color: '#6B8E6B' }} />
        </div>
      )}
      {isCoverValid && (
        <img
          src={coverUrl}
          alt={alt}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: fit,
            display: 'none'
          }}
        />
      )}
    </div>
  );
};

export default BookCover;
