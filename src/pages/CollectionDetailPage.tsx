import { useState, useMemo } from 'react';
import { 
  Card, Empty, Button, Modal, Select, Popconfirm, message, Skeleton 
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

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      want_to_read: { bg: 'rgba(255, 193, 7, 0.15)', color: '#FF9800' },
      reading: { bg: 'rgba(129, 199, 132, 0.15)', color: '#4CAF50' },
      read: { bg: 'rgba(63, 81, 181, 0.15)', color: '#3F51B5' },
      shelved: { bg: 'rgba(158, 158, 158, 0.15)', color: '#9E9E9E' }
    };
    return styles[status] || styles.want_to_read;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      want_to_read: '想读',
      reading: '在读',
      read: '已读',
      shelved: '搁置'
    };
    return labels[status] || status;
  };

  const renderSkeleton = () => (
    <div className="content-container">
      <div className="header">
        <div className="header-left">
          <Skeleton.Button active style={{ width: 100, marginBottom: '16px' }} />
          <Skeleton title={{ width: 200 }} paragraph={{ rows: 2, width: [300, 100] }} active />
        </div>
        <div className="header-actions">
          <Skeleton.Button active style={{ width: 100 }} />
          <Skeleton.Button active style={{ width: 120 }} />
        </div>
      </div>
      <div className="books-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} style={{ 
            border: 'none', 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Skeleton.Avatar shape="square" size="large" active />
              <div style={{ flex: 1 }}>
                <Skeleton title active />
                <Skeleton paragraph={{ rows: 2 }} active />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading && !collection) {
    return renderSkeleton();
  }

  if (!collection) {
    return (
      <div className="content-container">
        <div className="empty-state">
          <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.8 }}>📚</div>
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
      </div>
    );
  }

  return (
    <>
    <div className="content-container">
        <div className="header">
          <div className="header-left">
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

          <div className="header-actions">
            <Button
              icon={<EditOutlined />}
              onClick={handleEditCollection}
              style={{ borderRadius: '12px', height: '44px', padding: '0 20px' }}
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

        {books.length === 0 ? (
          <div className="empty-state">
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(241, 248, 233, 0.8) 0%, rgba(227, 242, 253, 0.8) 100%)',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '56px'
            }}>
              📚
            </div>
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
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => {
              const statusStyle = getStatusStyle(book.status);

              return (
                <div
                  key={book.id}
                  className="book-card"
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    overflow: 'hidden'
                  }}
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <div className="book-cover-wrap">
                    <div className="book-cover-wrap-inner">
                      <BookCover
                        coverUrl={book.cover_url}
                        className="book-cover-img"
                        alt={book.title}
                      />
                    </div>
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
                        className="book-more-btn"
                      />
                    </Popconfirm>
                  </div>
                  <div className="book-info">
                    <div className="book-info-header">
                      <div className="book-info-text">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author">{book.author}</p>
                      </div>
                    </div>
                    <div className="book-info-footer">
                      <span
                        className="book-status"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color
                        }}
                      >
                        {getStatusLabel(book.status)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
