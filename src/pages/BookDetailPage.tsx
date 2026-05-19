import { useState, useRef, useMemo } from 'react';
import { 
  ArrowLeftOutlined, 
  PlusOutlined, 
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { Card, Empty, Button, Popconfirm, message, Progress, Tabs, Tag, Skeleton } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { deleteBookById, type Book } from '../data/books';
import { deleteNote, type Note } from '../data/notes';

import BookCover from '../components/BookCover';
import EditBookModal from '../components/EditBookModal';
import { useGlobalData } from '../hooks/useGlobalData';

interface BookExcerpt {
  id: string;
  content: string;
  chapter: string;
  page: number;
}

const mockExcerpts: BookExcerpt[] = [
  { id: 'e1', content: '生命中真正重要的不是你遭遇了什么，而是你记住了哪些事，又是如何铭记的。', chapter: '第1章', page: 15 },
  { id: 'e2', content: '布恩迪亚家族七代人的故事，就像一个巨大的轮回。每个人都在重复着相似的命运，却又有着各自独特的人生轨迹。', chapter: '第3章', page: 67 },
  { id: 'e3', content: '时间是不会停留在原地的，它像流水一样不断向前。我们唯一能做的，就是在有限的时间里创造无限的回忆。', chapter: '第5章', page: 124 },
  { id: 'e4', content: '孤独是人生的必修课，每个人都需要学会与自己相处。在孤独中，我们才能真正认识自己。', chapter: '第7章', page: 189 },
  { id: 'e5', content: '死亡并不是终点，而是另一种形式的开始。那些逝去的人，依然活在我们的记忆中。', chapter: '第10章', page: 256 }
];

const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedExcerpts, setExpandedExcerpts] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const noteRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data, loading, refresh } = useGlobalData();

  const books = data?.books ?? [];
  const notesByBook = data?.notesByBook ?? {};

  const book = useMemo(() => {
    return books.find(b => b.id === id) || null;
  }, [books, id]);

  const notes = useMemo(() => {
    const bookNotes = notesByBook[id || ''] || [];
    return bookNotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [notesByBook, id]);

  const handleAddNote = () => {
    navigate(`/notes/new?bookId=${id}`);
  };

  const handleEditNote = (noteId: string) => {
    navigate(`/notes/${noteId}/edit`);
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      message.success('删除成功');
      refresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCopyNoteLink = (noteId: string) => {
    if (id) {
      const url = `${window.location.origin}/books/${id}?noteId=${noteId}`;
      navigator.clipboard.writeText(url).then(() => {
        message.success('笔记链接已复制');
      }).catch(() => {
        message.error('复制失败');
      });
    }
  };

  const handleAddToExcerpt = async (note: Note) => {
    try {
      const hasExcerptTag = note.tags.includes('摘录');
      if (!hasExcerptTag) {
        const { updateNote } = await import('../data/notes');
        await updateNote(note.id, { tags: [...note.tags, '摘录'] });
        message.success('已加入书摘');
        refresh();
      } else {
        message.info('该笔记已在书摘中');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleQuote = (excerpt: BookExcerpt) => {
    navigate(`/notes/new?bookId=${id}&quote=${encodeURIComponent(excerpt.content)}&chapter=${excerpt.chapter}&page=${excerpt.page}`);
  };

  const handleEditBook = () => {
    if (book) {
      setShowEditModal(true);
    }
  };

  const handleShareBook = () => {
    if (id) {
      const url = `${window.location.origin}/books/${id}`;
      navigator.clipboard.writeText(url).then(() => {
        message.success('书籍链接已复制，快分享给朋友吧');
      }).catch(() => {
        message.error('复制失败，请手动复制链接');
      });
    }
  };

  const handleDeleteBook = async () => {
    if (id && book) {
      try {
        await deleteBookById(id);
        message.success('删除成功');
        refresh();
        navigate('/books');
      } catch (error) {
        message.error('删除失败');
      }
    }
  };

  const getStatusLabel = (status: Book['status']) => {
    switch (status) {
      case 'want_to_read': return '想读';
      case 'reading': return '在读';
      case 'read': return '已读完';
      case 'shelved': return '搁置';
      default: return status;
    }
  };

  const getProgress = () => {
    if (!book) return 0;
    if (book.progress !== undefined) return book.progress;
    switch (book.status) {
      case 'want_to_read': return 0;
      case 'reading': return 50;
      case 'read': return 100;
      case 'shelved': return 0;
      default: return 0;
    }
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      '金句': 'gold',
      '行动清单': 'green',
      '人物': 'blue',
      '引用': 'purple',
      '感悟': 'cyan',
      '摘录': 'orange',
      '思考': 'magenta',
      '疑问': 'red',
      '心得': 'lime',
      '导入': 'gray'
    };
    return colors[tag] || 'default';
  };

  const toggleExcerpt = (excerptId: string) => {
    const newExpanded = new Set(expandedExcerpts);
    if (newExpanded.has(excerptId)) {
      newExpanded.delete(excerptId);
    } else {
      newExpanded.add(excerptId);
    }
    setExpandedExcerpts(newExpanded);
  };

  const renderSkeleton = () => (
    <div style={{ padding: '32px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Skeleton.Button active style={{ width: 100, marginBottom: '24px' }} />
        
        <Card style={{
          border: 'none',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(107, 142, 107, 0.1)',
          background: 'rgba(255, 255, 255, 0.95)'
        }}>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div style={{
              width: '200px',
              height: '280px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
            }} />
            
            <div style={{ flex: 1, minWidth: '300px' }}>
              <Skeleton title={{ width: 200 }} paragraph={{ rows: 2, width: [150, 200] }} active />
              <Skeleton title={{ width: 100 }} paragraph={{ rows: 1, width: [300] }} active />
              <Skeleton paragraph={{ rows: 3, width: ['100%'] }} active />
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
                {[1, 2, 3, 4].map(i => (
                  <Skeleton.Button key={i} active style={{ width: 100, height: 44 }} />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  if (loading && !book) {
    return renderSkeleton();
  }

  if (!book) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#757575', marginBottom: '16px' }}>书籍不存在</p>
        <Button onClick={() => navigate('/books')} style={{
          background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
          border: 'none',
          borderRadius: '12px',
          height: '44px',
          padding: '0 24px'
        }}>
          返回书架
        </Button>
      </div>
    );
  }

  const progress = getProgress();

  return (
    <>
    <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Button
            onClick={() => navigate('/books')}
            style={{
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '10px',
              height: '40px',
              padding: '0 16px',
              borderColor: '#E0E0E0'
            }}
            icon={<ArrowLeftOutlined />}
          >
            返回书架
          </Button>

          <Card style={{
            border: 'none',
            borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(107, 142, 107, 0.1)',
            background: 'rgba(255, 255, 255, 0.95)'
          }}>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{
                width: '200px',
                height: '280px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(107, 142, 107, 0.15)',
                flexShrink: 0
              }}>
                <BookCover coverUrl={book.cover_url} style={{ width: '100%', height: '100%' }} />
              </div>

              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <h1 style={{
                    fontFamily: 'Playfair Display, "Noto Serif SC", serif',
                    fontSize: '32px',
                    fontWeight: '600',
                    color: '#424242',
                    margin: 0
                  }}>
                    {book.title}
                  </h1>
                  <Tag 
                    color={book.status === 'read' ? 'blue' : book.status === 'reading' ? 'green' : book.status === 'shelved' ? 'gray' : 'orange'}
                    style={{ borderRadius: '8px', padding: '4px 12px' }}
                  >
                    {getStatusLabel(book.status)}
                  </Tag>
                </div>

                <p style={{ fontSize: '18px', color: '#757575', margin: '0 0 8px 0' }}>
                  {book.author}
                </p>
                <p style={{ fontSize: '14px', color: '#9E9E9E', margin: '0 0 24px 0' }}>
                  译者：暂无 | 字数：约 32 万字
                </p>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#616161' }}>阅读进度</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#81C784' }}>{progress}%</span>
                  </div>
                  <Progress
                    percent={progress}
                    strokeColor={{
                      '0%': '#C8E6C9',
                      '100%': '#81C784'
                    }}
                    size={8}
                    trailColor="#F0F0F0"
                  />
                </div>

                <p style={{ fontSize: '15px', color: '#616161', lineHeight: '1.7', marginBottom: '24px' }}>
                  {book.type === 'book' 
                    ? '这是一本值得细细品味的经典之作，讲述了布恩迪亚家族七代人的传奇故事，探讨了时间、记忆与命运的深刻主题。'
                    : '这是一门富有启发性的课程，涵盖了核心知识点和实践应用，帮助学习者深入理解相关领域的知识。'}
                </p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddNote}
                    style={{
                      borderRadius: '12px',
                      height: '44px',
                      padding: '0 28px',
                      fontSize: '15px',
                      fontWeight: '500',
                      background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                      boxShadow: '0 3px 12px rgba(129, 199, 132, 0.35)',
                      border: 'none'
                    }}
                  >
                    写笔记
                  </Button>
                  <Button
                    icon={<EditOutlined />}
                    onClick={handleEditBook}
                    style={{
                      borderRadius: '12px',
                      height: '44px',
                      padding: '0 20px',
                      borderColor: '#E0E0E0'
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    icon={<ShareAltOutlined />}
                    onClick={handleShareBook}
                    style={{
                      borderRadius: '12px',
                      height: '44px',
                      padding: '0 20px',
                      borderColor: '#E0E0E0'
                    }}
                  >
                    分享
                  </Button>
                  <Popconfirm
                    title="确定删除这本书及其所有笔记吗？"
                    onConfirm={handleDeleteBook}
                    okText="确定"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      style={{
                        borderRadius: '12px',
                        height: '44px',
                        padding: '0 20px'
                      }}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          </Card>

          <Tabs 
            defaultActiveKey="notes" 
            style={{ marginTop: '24px' }}
            items={[
              {
                key: 'notes',
                label: '我的笔记',
                children: (
                  <div>
                    {notes.length === 0 ? (
                      <Card style={{
                        border: 'none',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '60px 20px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.8 }}>✍️</div>
                        <Empty
                          description={
                            <div>
                              <p style={{ fontSize: '16px', fontWeight: '500', color: '#616161', marginBottom: '6px' }}>
                                还没有笔记
                              </p>
                              <p style={{ fontSize: '14px', color: '#9E9E9E' }}>
                                点击上方按钮写下第一篇笔记吧
                              </p>
                            </div>
                          }
                        />
                      </Card>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            ref={(el) => { noteRefs.current[note.id] = el; }}
                          >
                            <Card style={{
                              border: 'none',
                              borderRadius: '16px',
                              boxShadow: '0 3px 16px rgba(107, 142, 107, 0.1)',
                              background: 'rgba(255, 255, 255, 0.95)',
                              transition: 'box-shadow 0.3s, transform 0.3s'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#9E9E9E' }}>
                                      {new Date(note.created_at).toLocaleDateString('zh-CN')}
                                    </span>
                                    <Tag color="cyan" style={{ borderRadius: '6px', padding: '2px 8px', fontSize: '12px' }}>
                                      第2章
                                    </Tag>
                                  </div>
                                  <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#424242', margin: 0 }}>
                                    {note.content}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button
                                      onClick={() => handleCopyNoteLink(note.id)}
                                      size="small"
                                      icon={<LinkOutlined />}
                                      style={{ borderRadius: '8px' }}
                                      title="复制链接"
                                    />
                                    <Button
                                      onClick={() => handleAddToExcerpt(note)}
                                      size="small"
                                      style={{ borderRadius: '8px', borderColor: '#FFD700', color: '#FFA500' }}
                                    >
                                      加入书摘
                                    </Button>
                                    <Button
                                      onClick={() => handleEditNote(note.id)}
                                      size="small"
                                      icon={<EditOutlined />}
                                      style={{ borderRadius: '8px' }}
                                    />
                                    <Popconfirm
                                      title="确定删除这条笔记吗？"
                                      onConfirm={() => handleDeleteNote(note.id)}
                                      okText="确定"
                                      cancelText="取消"
                                      okButtonProps={{
                                        style: { background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)', border: 'none' }
                                      }}
                                    >
                                      <Button
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        style={{ borderRadius: '8px' }}
                                      />
                                    </Popconfirm>
                                  </div>
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {note.tags.map(tag => (
                                      <Tag 
                                        key={tag} 
                                        color={getTagColor(tag)} 
                                        style={{ borderRadius: '6px', padding: '2px 8px', fontSize: '12px' }}
                                      >
                                        {tag}
                                      </Tag>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'excerpts',
                label: '书中原文',
                children: (
                  <div id="原文" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {mockExcerpts.map((excerpt) => (
                      <div
                        key={excerpt.id}
                      >
                        <Card 
                          style={{
                            border: 'none',
                            borderRadius: '16px',
                            boxShadow: '0 3px 16px rgba(107, 142, 107, 0.08)',
                            background: 'rgba(255, 255, 255, 0.95)',
                            cursor: 'pointer'
                          }}
                          onClick={() => toggleExcerpt(excerpt.id)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '20px', color: '#81C784' }}>"</span>
                              <span style={{ fontSize: '14px', fontWeight: '500', color: '#616161' }}>{excerpt.chapter}</span>
                              <span style={{ fontSize: '13px', color: '#9E9E9E' }}>P.{excerpt.page}</span>
                            </div>
                            <span style={{ fontSize: '16px', color: '#9E9E9E' }}>
                              {expandedExcerpts.has(excerpt.id) ? '▲' : '▼'}
                            </span>
                          </div>
                          {expandedExcerpts.has(excerpt.id) && (
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F0F0F0' }}>
                              <p style={{ 
                                fontSize: '15px', 
                                lineHeight: '1.8', 
                                color: '#424242', 
                                margin: '0 0 16px 0',
                                fontStyle: 'italic',
                                paddingLeft: '24px',
                                position: 'relative'
                              }}>
                                "{excerpt.content}"
                              </p>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuote(excerpt);
                                }}
                                style={{
                                  borderRadius: '8px',
                                  background: 'rgba(129, 199, 132, 0.1)',
                                  borderColor: '#C8E6C9',
                                  color: '#6B8E6B'
                                }}
                              >
                                引用到笔记
                              </Button>
                            </div>
                          )}
                        </Card>
                      </div>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {book && (
        <EditBookModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          book={book}
          onSuccess={refresh}
        />
      )}
    </>
  );
};

export default BookDetailPage;
