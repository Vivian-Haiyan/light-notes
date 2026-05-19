import { Skeleton } from 'antd';

const NoteEditPageSkeleton = () => (
  <div className="content-container">
    <div className="header">
      <div className="header-left">
        <Skeleton title active />
      </div>
      <div className="header-actions">
        <Skeleton.Button active style={{ width: '100px' }} />
        <Skeleton.Button active style={{ width: '100px' }} />
      </div>
    </div>
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom: '16px' }}>
        <Skeleton.Input active style={{ width: '100%', height: '44px' }} />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <Skeleton.Input active block style={{ height: '180px' }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton.Button key={i} active style={{ width: '80px', height: '28px' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Skeleton.Button active style={{ width: '120px' }} />
        <Skeleton.Button active style={{ width: '120px' }} />
      </div>
    </div>
  </div>
);

export default NoteEditPageSkeleton;
