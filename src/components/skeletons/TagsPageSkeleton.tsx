import { Skeleton } from 'antd';

const TagsPageSkeleton = () => (
  <div className="content-container">
    <div className="search-box-wrapper" style={{ marginBottom: '24px' }}>
      <Skeleton.Input active style={{ width: '100%', height: '44px' }} />
    </div>
    <div className="tags-tabs-skeleton" style={{ marginBottom: '24px' }}>
      <div className="ant-tabs-nav-wrap">
        <div className="ant-tabs-nav-list" style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="ant-tabs-tab"
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                minWidth: '80px',
                flexShrink: 0
              }}
            >
              <Skeleton.Avatar style={{ width: 60, height: 16 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="notes-list-skeleton">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
          }}
        >
          <Skeleton paragraph={{ rows: 2 }} active />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2].map((j) => (
                <Skeleton.Button key={j} active style={{ width: '50px', height: '24px' }} />
              ))}
            </div>
            <Skeleton.Avatar style={{ width: 60, height: 14 }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TagsPageSkeleton;
