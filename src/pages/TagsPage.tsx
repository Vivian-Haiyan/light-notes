import { useState, useMemo, useCallback } from 'react';
import { Input, Tag, Card, Empty, Tooltip } from 'antd';
import { SearchOutlined, MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGlobalData } from '../hooks/useGlobalData';
import TagsPageSkeleton from '../components/skeletons/TagsPageSkeleton';
import type { Book } from '../data/books';
import type { Note } from '../data/notes';

const TagsPage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [activeTag, setActiveTag] = useState('全部');

  const { data: tagsData, loading } = useGlobalData();

  const notes = tagsData?.notes || [];
  const booksMap = useMemo(() => {
    const map: Record<string, Book> = {};
    tagsData?.books?.forEach(book => {
      map[book.id] = book;
    });
    return map;
  }, [tagsData?.books]);

  const allTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [notes]);

  const displayTags = useMemo(() => {
    const topTags = allTags.slice(0, 9);
    const hasMore = allTags.length > 9;
    return { topTags, hasMore };
  }, [allTags]);

  const getTagColor = useCallback((tag: string) => {
    const tagColors: Record<string, string> = {
      '金句': '#FFB74D',
      '感悟': '#81C784',
      '书摘': '#66BB6A',
      '灵感': '#BA68C8',
      '行动清单': '#4FC3F7',
      '人物': '#FF8A65',
    };
    const colors = [
      '#f50', '#2db7f5', '#87d068', '#108ee9', '#722ed1',
      '#eb2f96', '#fa8c16', '#13c2c2', '#52c41a', '#faad14'
    ];
    if (tagColors[tag]) return tagColors[tag];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, []);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (activeTag !== '全部' && !note.tags.includes(activeTag)) {
        return false;
      }
      if (!searchValue) return true;
      const query = searchValue.toLowerCase();
      return note.content.toLowerCase().includes(query) ||
             note.tags.some(tag => tag.toLowerCase().includes(query));
    });
  }, [notes, activeTag, searchValue]);

  const getBookTitle = (bookId: string) => {
    return booksMap[bookId]?.title || '未知书籍';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleNoteClick = (note: Note) => {
    navigate(`/books/${note.book_id}`);
  };

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
  };

  const handleMoreTagsClick = () => {};

  if (loading && !tagsData) {
    return <TagsPageSkeleton />;
  }

  return (
    <div className="content-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: 'Playfair Display, "Noto Serif SC", serif',
          fontSize: '32px',
          fontWeight: '600',
          color: '#424242',
          margin: '0 0 8px 0'
        }}>
          🏷️ 按标签浏览
        </h1>
        <p style={{ fontSize: '16px', color: '#757575', margin: 0 }}>
          通过标签探索你的笔记，共 {allTags.length} 个标签
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Input.Search
          placeholder="搜索笔记内容或标签"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ 
            borderRadius: '12px', 
            height: '44px',
            border: '1.5px solid #E0E8E0'
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <button
            onClick={() => handleTagClick('全部')}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: activeTag === '全部' ? '2px solid #81C784' : '2px solid #E0E0E0',
              background: activeTag === '全部'
                ? 'linear-gradient(135deg, rgba(129, 199, 132, 0.15) 0%, rgba(200, 230, 201, 0.2) 100%)'
                : 'rgba(255, 255, 255, 0.8)',
              color: activeTag === '全部' ? '#4CAF50' : '#616161',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            全部
            <span style={{
              fontSize: '13px',
              padding: '2px 8px',
              background: activeTag === '全部' ? '#81C784' : '#F5F5F5',
              color: activeTag === '全部' ? 'white' : '#757575',
              borderRadius: '10px'
            }}>
              {notes.length}
            </span>
          </button>

          {displayTags.topTags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: activeTag === tag ? `2px solid ${getTagColor(tag)}` : '2px solid #E0E0E0',
                background: activeTag === tag
                  ? `${getTagColor(tag)}15`
                  : 'rgba(255, 255, 255, 0.8)',
                color: activeTag === tag ? getTagColor(tag) : '#616161',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              {tag}
              <span style={{
                fontSize: '13px',
                padding: '2px 8px',
                background: activeTag === tag ? getTagColor(tag) : '#F5F5F5',
                color: activeTag === tag ? 'white' : '#757575',
                borderRadius: '10px'
              }}>
                {count}
              </span>
            </button>
          ))}

          {displayTags.hasMore && (
            <Tooltip title={`还有 ${allTags.length - 9} 个标签`}>
              <button
                onClick={handleMoreTagsClick}
                style={{
                  padding: '10px 16px',
                  borderRadius: '20px',
                  border: '2px solid #E0E0E0',
                  background: 'rgba(255, 255, 255, 0.8)',
                  color: '#616161',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                <MoreOutlined />
                更多
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <Card style={{
          border: 'none',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '80px 20px',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(107, 142, 107, 0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.8 }}>📝</div>
          <Empty
            description={
              <div>
                <p style={{ fontSize: '17px', fontWeight: '500', color: '#616161', marginBottom: '8px' }}>
                  该标签下还没有笔记
                </p>
                <p style={{ fontSize: '14px', color: '#9E9E9E' }}>
                  去添加一些笔记吧
                </p>
              </div>
            }
          />
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              hoverable
              onClick={() => handleNoteClick(note)}
              style={{
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <p style={{
                  fontSize: '15px',
                  color: '#424242',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {truncateContent(note.content)}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {note.tags.map(tag => (
                    <Tag
                      key={tag}
                      color={getTagColor(tag)}
                      style={{
                        borderRadius: '8px',
                        fontSize: '12px',
                        padding: '2px 10px'
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span 
                    style={{
                      fontSize: '13px',
                      color: '#81C784',
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/books/${note.book_id}`);
                    }}
                  >
                    {getBookTitle(note.book_id)}
                  </span>
                  <span style={{ fontSize: '13px', color: '#9E9E9E' }}>
                    {formatDate(note.created_at)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsPage;
