import { useState, useEffect, useMemo } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Card, Empty, Tag, Skeleton } from 'antd';

import type { Note } from '../data/notes';
import { useGlobalData } from '../hooks/useGlobalData';

interface HighlightWithBook extends Note {
  bookTitle: string;
}

const HighlightsPage = () => {
  const [filteredHighlights, setFilteredHighlights] = useState<HighlightWithBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const highlightTypes = ['all', '金句', '书摘', '引用'];

  const { data, loading } = useGlobalData();
  
  const highlights = useMemo(() => {
    if (!data) return [];
    
    const notes = data.notes;
    const highlightNotes = notes.filter(note => 
      note.tags.some(tag => ['金句', '书摘', '引用'].includes(tag)) ||
      note.content.trim().startsWith('>')
    );

    const booksData = data.books;
    const bookTitleMap = new Map(booksData.map((book) => [book.id, book.title]));
    
    return highlightNotes.map(note => ({
      ...note,
      bookTitle: bookTitleMap.get(note.book_id) || '未知书籍'
    }));
  }, [data]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case '金句': return '#FFD54F';
      case '书摘': return '#81C784';
      case '引用': return '#81D4FA';
      default: return '#81C784';
    }
  };

  const getTypeFromTags = (tags: string[]) => {
    if (tags.includes('金句')) return '金句';
    if (tags.includes('书摘')) return '书摘';
    if (tags.includes('引用')) return '引用';
    return '书摘';
  };

  const truncateContent = (content: string, maxLines: number = 5) => {
    const lines = content.split('\n');
    const visibleLines = lines.slice(0, maxLines);
    let result = visibleLines.join('\n');
    
    if (lines.length > maxLines) {
      result += '...';
    }
    return result;
  };

  useEffect(() => {
    if (!highlights) return;
    
    let filtered = [...highlights];
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(note => 
        note.tags.includes(selectedType) ||
        (selectedType === '书摘' && note.content.trim().startsWith('>'))
      );
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.content.toLowerCase().includes(query) ||
        note.bookTitle.toLowerCase().includes(query)
      );
    }

    setFilteredHighlights(filtered);
  }, [highlights, searchQuery, selectedType]);

  const handleCardClick = () => {
    // 移除跳转到书籍页的逻辑
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderSkeleton = () => (
    <div style={{ padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <Skeleton title={{ width: 150 }} paragraph={{ rows: 1, width: 250 }} active />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <Skeleton paragraph={{ rows: 1, width: '50%' }} active />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <Skeleton.Button active style={{ width: '80px' }} />
          <Skeleton.Button active style={{ width: '80px' }} />
          <Skeleton.Button active style={{ width: '80px' }} />
          <Skeleton.Button active style={{ width: '80px' }} />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px'
        }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              style={{
                border: 'none',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
              }}
            >
              <div style={{ height: '6px', background: '#81C784', margin: '-24px -24px 20px -24px' }} />
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && !highlights) {
    return renderSkeleton();
  }

  return (
      <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '32px',
              fontWeight: '600',
              color: '#424242',
              margin: '0 0 8px 0'
            }}>
              书摘卡片
            </h1>
            <p style={{
              color: '#9E9E9E',
              fontSize: '16px',
              margin: 0
            }}>
              收录那些触动心灵的文字
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Input.Search
              placeholder="搜索书摘内容..."
              prefix={<SearchOutlined style={{ color: '#81C784' }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                maxWidth: '500px',
                borderRadius: '12px',
                height: '48px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {highlightTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  border: selectedType === type ? 'none' : '1px solid #E0E0E0',
                  background: selectedType === type ? 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)' : '#FAFAFA',
                  color: selectedType === type ? 'white' : '#616161',
                  fontSize: '14px',
                  fontWeight: selectedType === type ? '500' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {type === 'all' ? '全部' : type}
              </button>
            ))}
          </div>

          {filteredHighlights.length === 0 ? (
            <Card style={{
              border: 'none',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <Empty
                description={
                  <div>
                    <p style={{
                      fontSize: '17px',
                      fontWeight: '500',
                      color: '#616161',
                      marginBottom: '8px'
                    }}>
                      还没有书摘
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#9E9E9E',
                      margin: 0
                    }}>
                      去阅读中摘录美好句子吧
                    </p>
                  </div>
                }
              />
            </Card>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              {filteredHighlights.map((highlight) => {
                const type = getTypeFromTags(highlight.tags);
                const color = getTypeColor(type);
                
                return (
                  <div
                    key={highlight.id}
                    style={{ cursor: 'default' }}
                    onClick={handleCardClick}
                  >
                    <Card style={{
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                      background: 'rgba(255, 255, 255, 0.98)',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(107, 142, 107, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(107, 142, 107, 0.1)';
                    }}
                    >
                      <div style={{
                        height: '6px',
                        background: color,
                        margin: '-24px -24px 20px -24px'
                      }} />
                      
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        width: '0',
                        height: '0',
                        borderLeft: '20px solid transparent',
                        borderTop: '20px solid ' + color
                      }} />
                      
                      <div style={{
                        minHeight: '120px',
                        marginBottom: '16px'
                      }}>
                        <p style={{
                          fontSize: '15px',
                          lineHeight: '1.8',
                          color: '#424242',
                          margin: 0,
                          fontStyle: 'italic',
                          whiteSpace: 'pre-wrap',
                          maxHeight: '135px',
                          overflow: 'hidden'
                        }}>
                          {truncateContent(highlight.content).replace(/^>\s*/, '')}
                        </p>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '16px',
                        borderTop: '1px solid #F0F0F0'
                      }}>
                        <div style={{
                          fontSize: '13px',
                          color: '#9E9E9E',
                          fontWeight: '500'
                        }}>
                          {highlight.bookTitle}
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center'
                        }}>
                          {highlight.tags.slice(0, 2).map(tag => (
                            <Tag
                              key={tag}
                              style={{
                                fontSize: '11px',
                                borderRadius: '8px',
                                padding: '2px 8px',
                                margin: 0
                              }}
                              color="success"
                            >
                              {tag}
                            </Tag>
                          ))}
                          <span style={{
                            fontSize: '12px',
                            color: '#BDBDBD'
                          }}>
                            {formatDate(highlight.created_at)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
};

export default HighlightsPage;
