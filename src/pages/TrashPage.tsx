
import { 
  Card, Empty, Button, Popconfirm, message, Tabs, Tag, Skeleton 
} from 'antd';
import { 
  RollbackOutlined, DeleteOutlined, ExclamationCircleOutlined 
} from '@ant-design/icons';

import { 
  getDeletedBooks, restoreDeletedBook, permanentlyDeleteBook, type DeletedBook 
} from '../data/deletedBooks';
import { 
  getDeletedNotes, restoreDeletedNote, restoreDeletedNotesByBookId, permanentlyDeleteNote, type DeletedNote 
} from '../data/deletedNotes';
import { addBook, type Book } from '../data/books';
import { addNote, type Note } from '../data/notes';

import BookCover from '../components/BookCover';
import { useCachedFetch } from '../hooks/useCachedFetch';
import { globalDataStore } from '../lib/globalDataStore';

interface TrashData {
  deletedBooks: DeletedBook[];
  deletedNotes: DeletedNote[];
}

const TrashPage = () => {
  const fetchTrashData = async (): Promise<TrashData> => {
    const [books, notes] = await Promise.all([
      getDeletedBooks(),
      getDeletedNotes()
    ]);
    return {
      deletedBooks: books.sort((a, b) => 
        new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
      ),
      deletedNotes: notes.sort((a, b) => 
        new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime()
      )
    };
  };

  const { data: trashData, loading, refresh } = useCachedFetch<TrashData>(
    'trash',
    fetchTrashData
  );

  const deletedBooks = trashData?.deletedBooks || [];
  const deletedNotes = trashData?.deletedNotes || [];

  const handleRestoreBook = async (book: DeletedBook) => {
    try {
      await restoreDeletedBook(book.id);
      
      const restoredBook: Omit<Book, 'created_at' | 'updated_at'> = {
        id: book.id,
        title: book.title,
        author: book.author,
        cover_url: book.cover_path ?? book.cover_url,
        cover_path: book.cover_path,
        status: book.status,
        type: book.type,
        progress: book.progress,
        rating: book.rating,
        tags: book.tags
      };
      
      await addBook(restoredBook);
      const restoredNotes = await restoreDeletedNotesByBookId(book.id);
      await Promise.all(
        restoredNotes.map((note) =>
          addNote({
            id: note.id,
            book_id: note.book_id,
            content: note.content,
            tags: note.tags
          })
        )
      );
      await globalDataStore.refreshAll();
      
      message.success('书籍已恢复');
      refresh();
    } catch (error) {
      message.error('恢复失败');
    }
  };

  const handlePermanentlyDeleteBook = async (bookId: string) => {
    try {
      await permanentlyDeleteBook(bookId);
      message.success('书籍已永久删除');
      refresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleRestoreNote = async (note: DeletedNote) => {
    try {
      await restoreDeletedNote(note.id);
      
      const restoredNote: Omit<Note, 'created_at' | 'updated_at'> = {
        id: note.id,
        book_id: note.book_id,
        content: note.content,
        tags: note.tags
      };
      
      await addNote(restoredNote);
      await globalDataStore.refreshAll();
      
      message.success('笔记已恢复');
      refresh();
    } catch (error) {
      message.error('恢复失败');
    }
  };

  const handlePermanentlyDeleteNote = async (noteId: string) => {
    try {
      await permanentlyDeleteNote(noteId);
      message.success('笔记已永久删除');
      refresh();
    } catch (error) {
      message.error('删除失败');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSkeleton = () => (
    <div style={{ padding: '32px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <Skeleton title={{ width: 180 }} paragraph={{ rows: 1, width: 280 }} active />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <Skeleton.Button active style={{ width: 100 }} />
          <Skeleton.Button active style={{ width: 100, marginLeft: 8 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ border: 'none', borderRadius: '16px', background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }} styles={{ body: { padding: 0 } }}>
              <div style={{ height: 160, background: '#E0E0E0' }} />
              <div style={{ padding: '16px' }}>
                <Skeleton paragraph={{ rows: 4, width: [60, '80%', '60%', '70%'] }} active />
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <Skeleton.Button active style={{ flex: 1 }} />
                  <Skeleton.Button active style={{ flex: 1 }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const tabItems = [
    {
      key: 'books',
      label: `书籍 (${deletedBooks.length})`,
      children: (
        <div>
          {deletedBooks.length === 0 ? (
            <Card style={{
              border: 'none',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(107, 142, 107, 0.1)'
            }}>
              <Empty
                description={
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: '#616161', marginBottom: '8px' }}>
                      回收站里没有书籍
                    </p>
                  </div>
                }
              />
            </Card>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {deletedBooks.map((book) => (
                <div
                  key={book.id}
                >
                  <Card style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 4px 16px rgba(107, 142, 107, 0.1)',
                    background: 'rgba(255, 255, 255, 0.95)'
                  }}
                  styles={{ body: { padding: 0 } }}
                  cover={
                    <div style={{
                      height: '160px',
                      overflow: 'hidden',
                      borderRadius: '16px 16px 0 0',
                      opacity: 0.7
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
                      </div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#424242',
                        margin: '0 0 4px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {book.title}
                      </h3>
                      <p style={{
                        color: '#757575',
                        fontSize: '13px',
                        margin: '0 0 12px 0'
                      }}>
                        {book.author}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#9E9E9E',
                        margin: '0 0 12px 0'
                      }}>
                        删除于 {formatDate(book.deleted_at)}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          icon={<RollbackOutlined />}
                          onClick={() => handleRestoreBook(book)}
                          style={{
                            flex: 1,
                            borderRadius: '10px',
                            borderColor: '#81C784',
                            color: '#81C784'
                          }}
                        >
                          恢复
                        </Button>
                        <Popconfirm
                          title="确定要永久删除这本书吗？此操作无法撤销。"
                          onConfirm={() => handlePermanentlyDeleteBook(book.id)}
                          okText="确定"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                          icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                        >
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            style={{
                              flex: 1,
                              borderRadius: '10px'
                            }}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'notes',
      label: `笔记 (${deletedNotes.length})`,
      children: (
        <div>
          {deletedNotes.length === 0 ? (
            <Card style={{
              border: 'none',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '60px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(107, 142, 107, 0.1)'
            }}>
              <Empty
                description={
                  <div>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: '#616161', marginBottom: '8px' }}>
                      回收站里没有笔记
                    </p>
                  </div>
                }
              />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deletedNotes.map((note) => (
                <div
                  key={note.id}
                >
                  <Card style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 4px 16px rgba(107, 142, 107, 0.1)',
                    background: 'rgba(255, 255, 255, 0.95)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, marginRight: '16px' }}>
                        <p style={{
                          fontSize: '12px',
                          color: '#9E9E9E',
                          margin: '0 0 8px 0'
                        }}>
                          删除于 {formatDate(note.deleted_at)} · {note.book_title || '未知书籍'}
                        </p>
                        <p style={{
                          fontSize: '14px',
                          color: '#424242',
                          margin: '0 0 8px 0',
                          lineHeight: '1.6',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {note.content}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {note.tags.map(tag => (
                            <Tag key={tag} style={{ borderRadius: '6px', fontSize: '11px', margin: 0 }}>
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Button
                          icon={<RollbackOutlined />}
                          onClick={() => handleRestoreNote(note)}
                          style={{
                            borderRadius: '8px',
                            borderColor: '#81C784',
                            color: '#81C784'
                          }}
                        >
                          恢复
                        </Button>
                        <Popconfirm
                          title="确定要永久删除这条笔记吗？此操作无法撤销。"
                          onConfirm={() => handlePermanentlyDeleteNote(note.id)}
                          okText="确定"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                          icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                        >
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            style={{ borderRadius: '8px' }}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
  ];

  if (loading && !trashData) {
    return renderSkeleton();
  }

  return (
    <>
    <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontFamily: 'Playfair Display, "Noto Serif SC", serif',
              fontSize: '32px',
              fontWeight: '600',
              color: '#424242',
              margin: '0 0 8px 0'
            }}>
              🗑️ 回收站
            </h1>
            <p style={{ fontSize: '16px', color: '#757575', margin: 0 }}>
              共 {deletedBooks.length + deletedNotes.length} 个项目，可恢复或永久删除
            </p>
          </div>

          <Tabs
            items={tabItems}
            defaultActiveKey="books"
            size="large"
            style={{ marginTop: '16px' }}
          />
        </div>
      </div>
    </>
  );
};

export default TrashPage;
