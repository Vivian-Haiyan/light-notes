import { useState, useMemo } from 'react';
import { 
  PlusOutlined, 
  MoreOutlined,
  EditOutlined,
  ShareAltOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { Input, Button, Card, Empty, Dropdown, message, Skeleton } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { deleteBookById, type Book } from '../data/books';
import { useGlobalData } from '../hooks/useGlobalData';

import AddBookModal from '../components/AddBookModal';
import BookCover from '../components/BookCover';
import EditBookModal, { type EditBookModalProps } from '../components/EditBookModal';
import { useExportSelection, type ExportFormat } from '../hooks/useExportSelection';

type SelectedBookExportFormat = ExportFormat | 'pdf' | 'image';

const BooksPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<EditBookModalProps['book']>(undefined);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  const { data, loading, refresh } = useGlobalData();
  const books = data?.books ?? [];
  const notesCount = data?.notesCount ?? {};
  const notesByBook = data?.notesByBook ?? {};

  const {
    selectedIds,
    isSelectMode,
    toggleSelect,
    enterSelectMode,
    exitSelectMode,
    isSelected,
    downloadFile,
    selectedCount
  } = useExportSelection<Book>();

  const statusLabels: Record<string, string> = {
    want_to_read: '想读',
    reading: '在读',
    read: '已读',
    shelved: '搁置'
  };

  const handleBookClick = (bookId: string, e?: React.MouseEvent) => {
    if (isSelectMode && e) {
      e.stopPropagation();
      toggleSelect(bookId);
      return;
    }
    if (!isSelectMode) {
      navigate(`/books/${bookId}`);
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowEditModal(true);
  };

  const handleShareBook = (bookId: string) => {
    const url = `${window.location.origin}/books/${bookId}`;
    navigator.clipboard.writeText(url).then(() => {
      message.success('书籍链接已复制，快分享给朋友吧');
    }).catch(() => {
      message.error('复制失败，请手动复制链接');
    });
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      await deleteBookById(bookId);
      message.success('删除成功');
      refresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleExportSelected = async (format: SelectedBookExportFormat = 'json') => {
    if (selectedCount === 0) {
      message.warning('请先选择要导出的书籍');
      return;
    }

    const selectedBooks = books.filter(book => selectedIds.includes(book.id));
    try {
      const {
        buildBookExportRows,
        downloadBooksAsPdf,
        downloadBooksAsShareImage
      } = await import('../utils/bookExport');
      const exportData = buildBookExportRows(selectedBooks, notesByBook);

      if (format === 'pdf') {
        await downloadBooksAsPdf(selectedBooks, notesByBook);
      } else if (format === 'image') {
        await downloadBooksAsShareImage(selectedBooks, notesByBook);
      } else {
        downloadFile(exportData, 'books_export', format);
      }
      exitSelectMode();
    } catch {
      message.error('导出失败，请稍后重试');
    }
  };

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'json',
      label: '导出 JSON',
    },
    {
      key: 'csv',
      label: '导出 CSV',
    },
    {
      key: 'pdf',
      label: '导出 PDF',
    },
    {
      key: 'image',
      label: '导出分享图',
    },
  ];

  const handleExportMenuClick = ({ key }: { key: string }) => {
    void handleExportSelected(key as SelectedBookExportFormat);
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

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      if (activeFilter !== 'all' && book.status !== activeFilter) return false;
      if (!searchValue) return true;
      const query = searchValue.toLowerCase();
      return book.title.toLowerCase().includes(query) || 
             book.author.toLowerCase().includes(query);
    });
  }, [books, activeFilter, searchValue]);

  const getStatusCount = (status: string) => {
    return books.filter(b => b.status === status).length;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '上午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const getTodayQuote = () => {
    const quotes = [
      '读书破万卷，下笔如有神。',
      '书籍是人类进步的阶梯。',
      '读一本好书，就是和许多高尚的人谈话。',
      '书犹药也，善读之可以医愚。',
      '生活里没有书籍，就好像没有阳光。'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const renderSkeleton = () => (
    <div className="content-container">
      <div className="header">
        <div className="header-left">
          <Skeleton title={{ width: 200 }} paragraph={{ rows: 2, width: [300, 200] }} active />
        </div>
        <div className="header-actions">
          <Skeleton.Button active style={{ width: '100px' }} />
          <Skeleton.Button active style={{ width: '100px' }} />
        </div>
      </div>
      <div className="status-tabs">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton.Button key={i} active style={{ width: '100px' }} />
        ))}
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

  if (loading && books.length === 0) {
    return renderSkeleton();
  }

  return (
    <>
    <div className="content-container">
        <div className="header">
          <div className="header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{
                fontFamily: 'Playfair Display, "Noto Serif SC", serif',
                fontSize: '28px',
                fontWeight: '600',
                color: '#424242',
                margin: 0
              }}>
                {getGreeting()}，拾光读者
              </h1>
              <ClockCircleOutlined style={{ color: '#81C784' }} />
            </div>
            <p style={{ color: '#757575', fontSize: '15px', margin: 0 }}>
              {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p style={{ color: '#9E9E9E', fontSize: '14px', margin: '8px 0 0 0', fontStyle: 'italic' }}>
              《{getTodayQuote()}》
            </p>
          </div>

          <div className="header-actions">
            <Input.Search
              className="search-box"
              placeholder="搜索书名 / 作者"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ borderRadius: '12px', height: '40px' }}
              size="middle"
            />
            
            {isSelectMode ? (
              <>
                <Dropdown
                  menu={{ items: exportMenuItems, onClick: handleExportMenuClick }}
                  placement="bottom"
                >
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    style={{
                      borderRadius: '12px',
                      height: '40px',
                      padding: '0 20px',
                      background: 'linear-gradient(135deg, #1890FF 0%, #096DD9 100%)',
                      boxShadow: '0 3px 12px rgba(24, 144, 255, 0.35)',
                      border: 'none'
                    }}
                  >
                    导出选中 ({selectedCount})
                  </Button>
                </Dropdown>
                <Button
                  onClick={exitSelectMode}
                  style={{
                    borderRadius: '12px',
                    height: '40px',
                    padding: '0 20px'
                  }}
                >
                  取消
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  onClick={enterSelectMode}
                  style={{
                    borderRadius: '12px',
                    height: '40px',
                    padding: '0 20px',
                    borderColor: '#81C784',
                    color: '#6B8E6B'
                  }}
                >
                  导出
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddModal(true)}
                  style={{
                    borderRadius: '12px',
                    height: '40px',
                    padding: '0 20px',
                    background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                    boxShadow: '0 3px 12px rgba(129, 199, 132, 0.35)',
                    border: 'none'
                  }}
                >
                  添加新书
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="status-tabs">
          {[
            { key: 'all', label: '全部', count: books.length },
            { key: 'want_to_read', label: '想读', count: getStatusCount('want_to_read') },
            { key: 'reading', label: '在读', count: getStatusCount('reading') },
            { key: 'read', label: '已读', count: getStatusCount('read') },
            { key: 'shelved', label: '搁置', count: getStatusCount('shelved') }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className="status-tab"
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: activeFilter === filter.key ? '2px solid #81C784' : '2px solid #E0E0E0',
                background: activeFilter === filter.key
                  ? 'linear-gradient(135deg, rgba(129, 199, 132, 0.15) 0%, rgba(200, 230, 201, 0.2) 100%)'
                  : 'rgba(255, 255, 255, 0.8)',
                color: activeFilter === filter.key ? '#4CAF50' : '#616161',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                fontFamily: '"Noto Serif SC", "PingFang SC", "Microsoft YaHei", "SimSun", serif'
              }}
            >
              {filter.label}
              <span style={{
                fontSize: '13px',
                padding: '2px 8px',
                background: activeFilter === filter.key ? '#81C784' : '#F5F5F5',
                color: activeFilter === filter.key ? 'white' : '#757575',
                borderRadius: '10px'
              }}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {filteredBooks.length === 0 ? (
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
                    书架还是空空如也
                  </p>
                  <p style={{ fontSize: '14px', color: '#9E9E9E' }}>
                    开始添加你的第一本书吧！
                  </p>
                </div>
              }
            />
          </div>
        ) : (
          <div className="books-grid">
            {filteredBooks.map((book) => {
              const selected = isSelected(book.id);
              const statusStyle = getStatusStyle(book.status);

              return (
                <div
                  key={book.id}
                  className="book-card"
                  style={{
                    borderRadius: '12px',
                    border: selected ? '2px solid #1890FF' : 'none',
                    boxShadow: selected ? '0 4px 16px rgba(24, 144, 255, 0.3)' : '0 2px 12px rgba(0, 0, 0, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    overflow: 'hidden'
                  }}
                  onClick={(e) => handleBookClick(book.id, e)}
                >
                  <div className="book-cover-wrap">
                    <div className="book-cover-wrap-inner">
                      <BookCover
                        coverUrl={book.cover_url}
                        className="book-cover-img"
                        alt={book.title}
                      />
                    </div>
                    {isSelectMode && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(book.id);
                        }}
                        className="book-select-checkbox"
                        style={{
                          border: selected ? 'none' : '2px solid rgba(255,255,255,0.8)',
                          background: selected ? '#1890FF' : 'rgba(0,0,0,0.3)'
                        }}
                      >
                        {selected && <CheckOutlined style={{ color: 'white', fontSize: '12px' }} />}
                      </div>
                    )}
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'edit',
                            icon: <EditOutlined />,
                            label: '编辑',
                            onClick: () => handleEditBook(book)
                          },
                          {
                            key: 'share',
                            icon: <ShareAltOutlined />,
                            label: '分享',
                            onClick: () => handleShareBook(book.id)
                          },
                          {
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            label: '删除',
                            danger: true,
                            onClick: () => handleDeleteBook(book.id)
                          }
                        ]
                      }}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                        className="book-more-btn"
                      />
                    </Dropdown>
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
                        {statusLabels[book.status]}
                      </span>
                      {notesCount[book.id] > 0 && (
                        <span className="book-notes-count">
                          {notesCount[book.id]} 笔记
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddBookModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refresh}
      />

      <EditBookModal
        visible={showEditModal}
        book={editingBook}
        onClose={() => setShowEditModal(false)}
        onSuccess={refresh}
      />
    </>
  );
};

export default BooksPage;
