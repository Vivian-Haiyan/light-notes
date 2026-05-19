import { Skeleton } from 'antd';

const ProfilePageSkeleton = () => (
  <div className="content-container">
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
      <Skeleton.Avatar style={{ width: '120px', height: '120px' }} />
      <Skeleton title active style={{ marginTop: '16px' }} />
      <Skeleton paragraph={{ rows: 1 }} active />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {[1, 2, 3].map((i) => (
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
          <Skeleton title active />
          <Skeleton paragraph={{ rows: 1 }} active />
        </div>
      ))}
    </div>
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <Skeleton title active style={{ marginBottom: '16px' }} />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Skeleton.Avatar style={{ width: 150, height: 14 }} />
          <Skeleton.Button active style={{ width: '80px' }} />
        </div>
      ))}
    </div>
  </div>
);

export default ProfilePageSkeleton;
