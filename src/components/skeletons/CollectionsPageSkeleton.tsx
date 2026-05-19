import { Skeleton } from 'antd';

const CollectionsPageSkeleton = () => (
  <div className="content-container">
    <div className="header">
      <div className="header-left">
        <Skeleton title={{ width: 180 }} paragraph={{ rows: 1, width: [240] }} active />
      </div>
      <Skeleton.Button active style={{ width: 120 }} />
    </div>
    <div className="books-grid">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i}
          style={{
            border: 'none',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <Skeleton.Avatar style={{ width: 60, height: 20 }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Skeleton.Button active style={{ width: 28, height: 28 }} />
              <Skeleton.Button active style={{ width: 28, height: 28 }} />
            </div>
          </div>
          <Skeleton paragraph={{ rows: 1 }} active />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F0F0F0', paddingTop: '12px' }}>
            <Skeleton.Avatar style={{ width: 80, height: 14 }} />
            <Skeleton.Button active style={{ width: 80 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CollectionsPageSkeleton;
