import { Skeleton } from 'antd';

const BooksPageSkeleton = () => (
  <div className="content-container">
    <div className="header">
      <div className="header-left">
        <Skeleton 
          title={{ width: 200 }} 
          paragraph={{ rows: 2, width: [300, 200] }} 
          active 
        />
      </div>
      <div className="header-actions">
        <Skeleton.Button active style={{ width: '100px' }} />
        <Skeleton.Button active style={{ width: '100px' }} />
      </div>
    </div>
    <div className="status-tabs">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton.Button key={i} active style={{ width: '100px' }} />
      ))}
    </div>
    <div className="books-grid">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="book-card"
          style={{ 
            borderRadius: '12px',
            background: 'white',
            overflow: 'hidden'
          }}
        >
          <div className="book-cover-wrap">
            <div className="book-cover-wrap-inner">
              <Skeleton.Image 
                active 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
                }} 
              />
            </div>
          </div>
          <div className="book-info">
            <Skeleton title active />
            <Skeleton paragraph={{ rows: 1 }} active />
            <div style={{ marginTop: '8px' }}>
              <Skeleton.Button active style={{ width: '60px', height: '24px' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default BooksPageSkeleton;
