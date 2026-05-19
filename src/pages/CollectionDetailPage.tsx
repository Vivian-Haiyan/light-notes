import { useState, useMemo } from 'react';
import { 
  Card, Empty, Button, Modal, Select, Popconfirm, message, Tag, Skeleton 
} from 'antd';
import { 
  ArrowLeftOutlined, PlusOutlined, DeleteOutlined, EditOutlined 
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  updateCollection, addBookToCollection, 
  removeBookFromCollection 
} from '../data/collections';

import BookCover from '../components/BookCover';
import { useBooks, useCollections } from '../hooks/useGlobalData';

const CollectionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  const { books: allBooks } = useBooks();
  const { collections, refresh: refreshCollections } = useCollections();

  const collection = useMemo(() => {
    return collections.find(c => c.id === id) || null;
  }, [collections, id]);

  const books = useMemo(() => {
    if (!collection) return [];
    return allBooks.filter(book => collection.bookIds.includes(book.id));
  }, [collection, allBooks]);

  const availableBooks = useMemo(() => {
    return allBooks.filter(book => !collection?.bookIds.includes(book.id));
  }, [allBooks, collection]);

  const loading = !collection && collections.length === 0;

  const handleAddBooks = () => {
    if (availableBooks.length === 0) {
      message.warning('所有书籍都已经在书单中了');
      return;
    }
    
    setSelectedBookIds([]);
    setIsAddBookModalOpen(true);
  };

  const confirmAddBooks = async () => {
    if (!id || !collection) return;
    
    try {
      for (const bookId of selectedBookIds) {
        await addBookToCollection(id, bookId);
      }
      message.success('添加成功');
      setIsAddBookModalOpen(false);
      refreshCollections();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleRemoveBook = async (bookId: string) => {
    if (!id) return;
    
    try {
      await removeBookFromCollection(id, bookId);
      message.success('移除成功');
      refreshCollections();
    } catch (error) {
      message.error('移除失败');
    }
  };

  const handleEditCollection = () => {
    if (collection) {
      setEditForm({
        name: collection.name,
        description: collection.description
      });
      setIsEditModalOpen(true);
    }
  };

  const confirmEditCollection = async () => {
    if (!id) return;
    
    try {
      await updateCollection(id, {
        name: editForm.name,
        description: editForm.description
      });
      message.success('更新成功');
      setIsEditModalOpen(false);
      refreshCollections();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'want_to_read': 'gold',
      'reading': 'green',
      'read': 'blue',
      'shelved': 'gray'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'want_to_read': '想读',
      'reading': '在读',
      'read': '已读',
      'shelved': '搁置'
    };
    return labels[status] || status;
  };

  const renderSkeleton = () => (
    <div style={{ padding: '32px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <Skeleton.Button active style={{ width: 100, marginBottom: '16px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div>
              <Skeleton title={{ width: 200 }} paragraph={{ rows: 2, width: [300, 100] }} active />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Skeleton.Button active style={{ width: 100 }} />
              <Skeleton.Button active style={{ width: 120 }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3].map(i => (
            <Card key={i} style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
              background: 'rgba(255, 255, 255, 0.95)'
            }}>
              <div style={{ height: '200px', background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', borderRadius: '16px 16px 0 0', margin: '-24px -24px 16px -24px' }} />
              <Skeleton paragraph={{ rows: 2, width: [120, 150] }} active />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && !collection) {
    return renderSkeleton();
  }

  if (!collection) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#757575', marginBottom: '16px' }}>书单不存在</p>
        <Button onClick={() => navigate('/collections')} style={{
          background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
          border: 'none',
          borderRadius: '12px',
          height: '44px',
          padding: '0 24px'
        }}>
          返回书单列表
        </Button>
      </div>
    );
  }

  return (
    <>
    <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <Button
              onClick={() => navigate('/collections')}
              icon={<ArrowLeftOutlined />}
              style={{
                marginBottom: '16px',
                borderRadius: '10px',
                borderColor: '#E0E0E0'
              }}
            >
              返回书单
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{
                  fontFamily: 'Playfair Display, "Noto Serif SC", serif',
                  fontSize: '32px',
                  fontWeight: '600',
                  color: '#424242',
                  margin: '0 0 8px 0'
                }}>
                  {collection.name}
                </h1>
                <p style={{ fontSize: '16px', color: '#757575', margin: 0 }}>
                  {collection.description || '暂无描述'}
                </p>
                <p style={{ fontSize: '14px', color: '#9E9E9E', margin: '8px 0 0 0' }}>
                  {books.length} 本书
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  icon={<EditOutlined />}
                  onClick={handleEditCollection}
                  style={{ borderRadius: '12px', height: '44px' }}
                >
                  编辑
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddBooks}
                  style={{
                    borderRadius: '12px',
                    height: '44px',
                    padding: '0 24px',
                    background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                    boxShadow: '0 3px 12px rgba(129, 199, 132, 0.35)',
                    border: 'none'
                  }}
                >
                  添加书籍
                </Button>
              </div>
            </div>
          </div>

          {books.length === 0 ? (
            <Card style={{
              border: 'none',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '80px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(107, 142, 107, 0.1)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.8 }}>📚</div>
              <Empty
                description={
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: '500', color: '#616161', marginBottom: '8px' }}>
                      书单还没有书籍
                    </p>
                    <p style={{ fontSize: '14px', color: '#9E9E9E' }}>
                      点击上方按钮添加书籍吧
                    </p>
                  </div>
                }
              />
            </Card>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {books.map((book) => (
                <div key={book.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/books/${book.id}`)}
                    style={{
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                      background: 'rgba(255, 255, 255, 0.95)'
                    }}
                    styles={{ body: { padding: 0 } }}
                    cover={
                      <div style={{
                        height: '200px',
                        overflow: 'hidden',
                        borderRadius: '16px 16px 0 0'
                      }}>
                        <BookCover coverUrl={book.cover_url} style={{ height: '100%', width: '100%' }} />
                      </div>
                    }
                  >
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <Tag color={getStatusColor(book.status)} style={{ borderRadius: '8px', fontSize: '12px' }}>
                          {getStatusLabel(book.status)}
                        </Tag>
                        <Popconfirm
                          title="确定从书单中移除这本书吗？"
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            handleRemoveBook(book.id);
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
                            style={{ color: '#9E9E9E' }}
                          />
                        </Popconfirm>
                      </div>

                      <h3 style={{
                        fontFamily: '"Noto Serif SC", serif',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#424242',
                        margin: '0 0 6px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {book.title}
                      </h3>
                      <p style={{
                        color: '#757575',
                        fontSize: '13px',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {book.author}
                      </p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        title="添加书籍"
        open={isAddBookModalOpen}
        onCancel={() => setIsAddBookModalOpen(false)}
        onOk={confirmAddBooks}
        centered
        style={{ top: '15%' }}
        okText="添加"
        cancelText="取消"
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
            border: 'none'
          }
        }}
      >
        <div style={{ padding: '8px 0' }}>
          {availableBooks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9E9E9E' }}>
              所有书籍都已在书单中
            </div>
          ) : (
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="选择要添加的书籍"
              value={selectedBookIds}
              onChange={setSelectedBookIds}
              options={availableBooks.map(book => ({
                value: book.id,
                label: `${book.title} - ${book.author}`
              }))}
              maxTagCount="responsive"
            />
          )}
        </div>
      </Modal>

      <Modal
        title="编辑书单"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={confirmEditCollection}
        centered
        style={{ top: '15%' }}
        okText="保存"
        cancelText="取消"
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
            border: 'none'
          }
        }}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#616161', marginBottom: '8px', display: 'block' }}>
              书单名称
            </label>
            <input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #E8E8E8',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#616161', marginBottom: '8px', display: 'block' }}>
              描述
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #E8E8E8',
                fontSize: '14px',
                resize: 'none'
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CollectionDetailPage;
