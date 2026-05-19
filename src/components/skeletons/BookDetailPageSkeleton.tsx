import { Skeleton } from 'antd';

const BookDetailPageSkeleton = () => (
  <div className="content-container">
    <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
      <div style={{ width: '200px', height: '260px', background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', borderRadius: '12px' }}>
        <Skeleton.Image active style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{ flex: 1 }}>
        <Skeleton title={{ width: 300 }} active />
        <Skeleton paragraph={{ rows: 3, width: [250, 200, 150] }} active />
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <Skeleton.Button active style={{ width: '100px' }} />
          <Skeleton.Button active style={{ width: '100px' }} />
        </div>
      </div>
    </div>
    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <Skeleton title active />
      <Skeleton paragraph={{ rows: 5 }} active />
    </div>
  </div>
);

export default BookDetailPageSkeleton;
