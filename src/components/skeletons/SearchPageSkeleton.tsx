import { Skeleton } from 'antd';

const SearchPageSkeleton = () => (
  <div className="content-container">
    <div className="header">
      <Skeleton.Input active style={{ width: '100%', maxWidth: '400px', height: '44px' }} />
    </div>
    <div style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Skeleton title active />
      </div>
      <div className="books-grid">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i}
            className="book-card"
            style={{ borderRadius: '12px', background: 'white', overflow: 'hidden' }}
          >
            <div className="book-cover-wrap">
              <div className="book-cover-wrap-inner">
                <Skeleton.Image 
                  active 
                  style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }} 
                />
              </div>
            </div>
            <div className="book-info">
              <Skeleton title active />
              <Skeleton paragraph={{ rows: 1 }} active />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Skeleton title active />
      </div>
      {[1, 2, 3].map((i) => (
        <div 
          key={i}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          <Skeleton paragraph={{ rows: 2 }} active />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {[1, 2].map((j) => (
              <Skeleton.Button key={j} active style={{ width: '40px', height: '20px' }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SearchPageSkeleton;
