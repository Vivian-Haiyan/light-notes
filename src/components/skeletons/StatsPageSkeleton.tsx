import { Skeleton } from 'antd';

const StatsPageSkeleton = () => (
  <div className="content-container">
    <div className="header">
      <Skeleton title={{ width: 180 }} paragraph={{ rows: 1, width: 200 }} active />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}
        >
          <Skeleton.Avatar style={{ width: 80, height: 80, margin: '0 auto 12px' }} />
          <Skeleton title active />
          <Skeleton paragraph={{ rows: 1 }} active />
        </div>
      ))}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
      <div 
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}
      >
        <Skeleton title active style={{ marginBottom: '20px' }} />
        <div style={{ height: '200px' }}>
          <Skeleton paragraph={{ rows: 8 }} active />
        </div>
      </div>
      <div 
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}
      >
        <Skeleton title active style={{ marginBottom: '20px' }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <Skeleton.Avatar style={{ width: 100, height: 14 }} />
            <Skeleton.Avatar style={{ width: 30, height: 14 }} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default StatsPageSkeleton;
