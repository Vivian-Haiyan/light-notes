import { Skeleton } from 'antd';

const InspirationsPageSkeleton = () => (
  <div className="content-container">
    <div className="header">
      <div className="header-left">
        <Skeleton title={{ width: 180 }} paragraph={{ rows: 1, width: 240 }} active />
      </div>
      <Skeleton.Button active style={{ width: 120 }} />
    </div>
    <div className="inspirations-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => {
        const rotation = Math.random() * 4 - 2;
        return (
          <div 
            key={i} 
            className="inspiration-card"
            style={{
              borderRadius: '16px',
              padding: '20px',
              background: 'linear-gradient(135deg, #FFF8E1 0%, #E8F5E9 100%)',
              transform: `rotate(${rotation}deg)`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Skeleton.Avatar style={{ width: 60, height: 20 }} />
              <Skeleton.Button active style={{ width: 28, height: 28 }} />
            </div>
            <Skeleton paragraph={{ rows: 3 }} active />
          </div>
        );
      })}
    </div>
  </div>
);

export default InspirationsPageSkeleton;
