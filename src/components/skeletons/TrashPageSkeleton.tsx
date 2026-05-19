import { Skeleton } from 'antd';

const TrashPageSkeleton = () => (
  <div className="content-container">
    <div className="header">
      <div className="header-left">
        <Skeleton title={{ width: 180 }} paragraph={{ rows: 1, width: 200 }} active />
      </div>
      <Skeleton.Button active style={{ width: 120 }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      <div 
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}
      >
        <Skeleton title active style={{ marginBottom: '16px' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
            <Skeleton.Image active style={{ width: '60px', height: '80px' }} />
            <div style={{ flex: 1 }}>
              <Skeleton title active />
              <Skeleton paragraph={{ rows: 1 }} active />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Skeleton.Button active style={{ width: '60px' }} />
                <Skeleton.Button active style={{ width: '60px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div 
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}
      >
        <Skeleton title active style={{ marginBottom: '16px' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <Skeleton paragraph={{ rows: 2 }} active />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Skeleton.Button active style={{ width: '60px' }} />
              <Skeleton.Button active style={{ width: '60px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default TrashPageSkeleton;
