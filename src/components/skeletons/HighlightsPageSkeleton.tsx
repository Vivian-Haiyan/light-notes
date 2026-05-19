import { Skeleton } from 'antd';

const HighlightsPageSkeleton = () => (
  <div className="content-container">
    <div className="header">
      <div className="header-left">
        <Skeleton title={{ width: 180 }} paragraph={{ rows: 1, width: 200 }} active />
      </div>
    </div>
    <div className="highlights-list">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <div 
              className="bookmark-clip"
              style={{
                width: '12px',
                background: 'linear-gradient(180deg, #81C784 0%, #66BB6A 100%)',
                borderRadius: '3px 0 0 3px'
              }}
            />
            <div style={{ flex: 1 }}>
              <Skeleton paragraph={{ rows: 3 }} active />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
                <Skeleton.Avatar style={{ width: 80, height: 14 }} />
                <Skeleton.Button active style={{ width: 80 }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default HighlightsPageSkeleton;
