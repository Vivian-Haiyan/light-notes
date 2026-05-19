interface LogoProps {
  size?: 'small' | 'large';
  showText?: boolean;
}

const Logo = ({ size = 'small', showText = true }: LogoProps) => {
  const iconSize = size === 'large' ? 48 : 32;
  const textSize = size === 'large' ? '22px' : '16px';
  const gapSize = size === 'large' ? '10px' : '6px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: gapSize }}>
      <img 
        src="/image/logo图.png" 
        alt="拾光札记" 
        style={{ 
          width: iconSize, 
          height: iconSize, 
          objectFit: 'contain',
          borderRadius: '8px'
        }} 
      />
      {showText && (
        <span
          style={{
            fontFamily: 'Playfair Display, "Noto Serif SC", serif',
            fontSize: textSize,
            fontWeight: '600',
            color: '#2E7D32',
            letterSpacing: '2px',
            whiteSpace: 'nowrap'
          }}
        >
          拾光札记
        </span>
      )}
    </div>
  );
};

export default Logo;
