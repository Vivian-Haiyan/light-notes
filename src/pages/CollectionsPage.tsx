import { useState } from 'react';
import { Card, Empty, Button, Modal, Form, Input, Popconfirm, message, Skeleton } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  addCollection, updateCollection, deleteCollection, type Collection 
} from '../data/collections';

import { useGlobalData } from '../hooks/useGlobalData';

const CollectionsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { data, loading, refresh } = useGlobalData();
  const collections = data?.collections ?? [];

  const handleAddCollection = () => {
    setEditingCollection(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    form.setFieldsValue({
      name: collection.name,
      description: collection.description
    });
    setIsModalOpen(true);
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      await deleteCollection(id);
      message.success('删除成功');
      refresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCollection) {
        await updateCollection(editingCollection.id, {
          name: values.name,
          description: values.description
        });
        message.success('更新成功');
      } else {
        await addCollection({
          name: values.name,
          description: values.description,
          bookIds: []
        });
        message.success('创建成功');
      }
      
      setIsModalOpen(false);
      refresh();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getBookCount = (collection: Collection) => {
    return collection.bookIds?.length ?? 0;
  };

  const renderSkeleton = () => (
    <div className="content-container">
      <div className="header">
        <div className="header-left">
          <Skeleton title={{ width: 180 }} paragraph={{ rows: 1, width: [240] }} active />
        </div>
        <Skeleton.Button active style={{ width: 120 }} />
      </div>
      <div className="books-grid">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} style={{ border: 'none', borderRadius: '16px', background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }}>
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
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading && collections.length === 0) {
    return renderSkeleton();
  }

  return (
    <>
    <div className="content-container">
        <div className="header">
          <div className="header-left">
            <h1 style={{
              fontFamily: 'Playfair Display, "Noto Serif SC", serif',
              fontSize: '32px',
              fontWeight: '600',
              color: '#424242',
              margin: '0 0 8px 0'
            }}>
              📚 书单收藏
            </h1>
            <p style={{ fontSize: '16px', color: '#757575', margin: 0 }}>
              整理你的书籍，创建专属书单
            </p>
          </div>
          <div className="header-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCollection}
              style={{
                borderRadius: '12px',
                height: '44px',
                padding: '0 24px',
                background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                boxShadow: '0 3px 12px rgba(129, 199, 132, 0.35)',
                border: 'none'
              }}
            >
              新建书单
            </Button>
          </div>
        </div>

        {collections.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.8 }}>📖</div>
            <Empty
              description={
                <div>
                  <p style={{ fontSize: '17px', fontWeight: '500', color: '#616161', marginBottom: '8px' }}>
                    还没有书单
                  </p>
                  <p style={{ fontSize: '14px', color: '#9E9E9E' }}>
                    点击上方按钮创建你的第一个书单吧
                  </p>
                </div>
              }
            />
          </div>
        ) : (
          <div className="books-grid">
            {collections.map((collection) => (
              <Card
                key={collection.id}
                hoverable
                onClick={() => navigate(`/collections/${collection.id}`)}
                style={{
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                  background: 'rgba(255, 255, 255, 0.95)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#424242',
                    margin: 0,
                    flex: 1
                  }}>
                    {collection.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCollection(collection);
                      }}
                      style={{ color: '#757575' }}
                    />
                    <Popconfirm
                      title="确定删除这个书单吗？"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleDeleteCollection(collection.id);
                      }}
                      okText="确定"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: '#757575' }}
                      />
                    </Popconfirm>
                  </div>
                </div>

                <p style={{
                  fontSize: '14px',
                  color: '#757575',
                  margin: '0 0 16px 0',
                  lineHeight: '1.6'
                }}>
                  {collection.description || '暂无描述'}
                </p>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderTop: '1px solid #F0F0F0',
                  paddingTop: '12px'
                }}>
                  <span style={{ fontSize: '13px', color: '#9E9E9E' }}>
                    {getBookCount(collection)} 本书
                  </span>
                  <Button
                    type="text"
                    icon={<ArrowRightOutlined />}
                    style={{ color: '#81C784' }}
                  >
                    查看详情
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        title={editingCollection ? '编辑书单' : '新建书单'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        style={{ top: '20%' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ padding: '8px 0' }}
        >
          <Form.Item
            label="书单名称"
            name="name"
            rules={[{ required: true, message: '请输入书单名称' }]}
          >
            <Input
              placeholder="给书单起个名字"
              style={{ borderRadius: '10px', height: '44px' }}
            />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea
              placeholder="简单介绍一下这个书单"
              rows={4}
              style={{ borderRadius: '10px' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              style={{ flex: 1, borderRadius: '10px', height: '44px' }}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                flex: 1,
                borderRadius: '10px',
                height: '44px',
                background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                border: 'none'
              }}
            >
              保存
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CollectionsPage;
