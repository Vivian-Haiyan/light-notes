import { useState, useEffect, useMemo } from 'react';
import { Card, Empty, Tag, Button, Input, Select, Dropdown, Skeleton } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, ArrowDownOutlined, DownloadOutlined } from '@ant-design/icons';
import type { Note } from '../data/notes';

import { useExportSelection, type ExportFormat } from '../hooks/useExportSelection';
import { useGlobalData } from '../hooks/useGlobalData';
import CardAppearanceEditor from '../components/CardAppearanceEditor';
import {
  getCardPreset,
  loadCardAppearances,
  saveCardAppearance,
  type CardAppearance
} from '../utils/cardAppearance';

const inspirationTags = ['灵感', '想法', '思考', '感悟'];

const noteColors = [
  '#FFFDE7',
  '#F1F8E9',
  '#E3F2FD',
];

interface NoteWithBook extends Note {
  bookTitle: string;
}

const InspirationsPage = () => {
  const [filteredNotes, setFilteredNotes] = useState<NoteWithBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'earliest' | 'grouped'>('latest');
  const [appearances, setAppearances] = useState<Record<string, CardAppearance>>({});

  const { data, loading } = useGlobalData();
  
  const notes = useMemo(() => {
    if (!data) return [];
    
    const allNotes = data.notes;
    const inspirationNotes = allNotes.filter(note =>
      note.tags.some(tag => inspirationTags.includes(tag))
    );

    const booksData = data.books;
    const bookTitleMap = new Map(booksData.map((book) => [book.id, book.title]));
    return inspirationNotes.map((note) => ({
      ...note,
      bookTitle: bookTitleMap.get(note.book_id) || '未知书籍'
    }));
  }, [data]);

  const {
    selectedIds,
    isSelectMode,
    toggleSelect,
    enterSelectMode,
    exitSelectMode,
    isSelected,
    downloadFile,
    selectedCount
  } = useExportSelection<NoteWithBook>();

  useEffect(() => {
    loadCardAppearances('inspirations').then(setAppearances);
  }, []);

  useEffect(() => {
    if (!notes) return;
    
    let result = [...notes];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note =>
        note.content.toLowerCase().includes(query) ||
        note.bookTitle.toLowerCase().includes(query)
      );
    }

    if (selectedTag !== 'all') {
      result = result.filter(note => note.tags.includes(selectedTag));
    }

    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'earliest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'grouped') {
      result.sort((a, b) => a.bookTitle.localeCompare(b.bookTitle));
    }

    setFilteredNotes(result);
  }, [notes, searchQuery, selectedTag, sortBy]);

  const topTags = useMemo(() => {
    if (!notes) return [];
    const tagCounts: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        if (inspirationTags.includes(tag)) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [notes]);

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      '灵感': 'gold',
      '想法': 'cyan',
      '思考': 'blue',
      '感悟': 'purple',
    };
    return colors[tag] || 'default';
  };

  const handleExportSelected = (format: ExportFormat = 'json') => {
    if (selectedCount === 0 || !notes) {
      return;
    }
    const selectedNotes = notes.filter(note => selectedIds.includes(note.id));
    downloadFile(selectedNotes, 'inspirations_export', format);
    exitSelectMode();
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
  ];

  const handleExportMenuClick = ({ key }: { key: string }) => {
    handleExportSelected(key as ExportFormat);
  };

  const handleNoteClick = (note: NoteWithBook, e?: React.MouseEvent) => {
    if (isSelectMode && e) {
      e.stopPropagation();
      toggleSelect(note.id);
    }
    // 移除跳转到书籍页的逻辑
  };

  const groupedNotes = useMemo(() => {
    if (sortBy !== 'grouped' || !filteredNotes.length) return null;
    const groups: Record<string, NoteWithBook[]> = {};
    filteredNotes.forEach(note => {
      if (!groups[note.bookTitle]) {
        groups[note.bookTitle] = [];
      }
      groups[note.bookTitle].push(note);
    });
    return groups;
  }, [filteredNotes, sortBy]);

  const updateAppearance = async (id: string, appearance: CardAppearance) => {
    await saveCardAppearance('inspirations', id, appearance);
    setAppearances((current) => ({ ...current, [id]: appearance }));
  };

  const getCardBackground = (note: NoteWithBook, fallbackColor: string) => {
    const appearance = appearances[note.id];
    const preset = getCardPreset(appearance?.themeColor);

    return {
      background: appearance?.backgroundImage
        ? `linear-gradient(rgba(255,255,255,0.78), rgba(255,255,255,0.88)), url(${appearance.backgroundImage}) center/cover no-repeat`
        : preset?.background || fallbackColor,
      accent: preset?.accent || '#81C784'
    };
  };

  const renderSkeleton = () => (
    <div style={{ padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <Skeleton title={{ width: 200 }} paragraph={{ rows: 1, width: 300 }} active />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <Skeleton paragraph={{ rows: 1, width: '100%' }} active />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              style={{
                border: 'none',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
              }}
            >
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && !notes) {
    return renderSkeleton();
  }

  return (
    <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontFamily: 'Playfair Display, "Noto Serif SC", serif',
              fontSize: '32px',
              fontWeight: '600',
              color: '#424242',
              margin: '0 0 8px 0'
            }}>
              灵感集锦
            </h1>
            <p style={{
              color: '#9E9E9E',
              fontSize: '16px',
              margin: 0
            }}>
              记录阅读中闪现的思想火花
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                <Input.Search
                  placeholder="搜索灵感内容..."
                  prefix={<SearchOutlined style={{ color: '#81C784' }} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    borderRadius: '12px',
                    height: '40px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  key="all"
                  onClick={() => setSelectedTag('all')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: selectedTag === 'all' ? '2px solid #81C784' : '1px solid #E0E0E0',
                    background: selectedTag === 'all'
                      ? 'linear-gradient(135deg, rgba(129, 199, 132, 0.2) 0%, rgba(200, 230, 201, 0.3) 100%)'
                      : 'rgba(255, 255, 255, 0.8)',
                    color: selectedTag === 'all' ? '#4CAF50' : '#616161',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  全部
                </button>
                {topTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: selectedTag === tag ? '2px solid #81C784' : '1px solid #E0E0E0',
                      background: selectedTag === tag
                        ? 'linear-gradient(135deg, rgba(129, 199, 132, 0.2) 0%, rgba(200, 230, 201, 0.3) 100%)'
                        : 'rgba(255, 255, 255, 0.8)',
                      color: selectedTag === tag ? '#4CAF50' : '#616161',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <Select
                value={sortBy}
                onChange={(value) => setSortBy(value as 'latest' | 'earliest' | 'grouped')}
                options={[
                  { value: 'latest', label: '按时间倒序（最新）' },
                  { value: 'earliest', label: '按时间正序（最早）' },
                  { value: 'grouped', label: '按来源书籍分组' },
                ]}
                style={{ width: '200px', borderRadius: '12px' }}
                suffixIcon={<ArrowDownOutlined />}
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
                        border: 'none'
                      }}
                    >
                      导出选中 ({selectedCount})
                    </Button>
                  </Dropdown>
                  <Button onClick={exitSelectMode} style={{ borderRadius: '12px', height: '40px', padding: '0 20px' }}>
                    取消
                  </Button>
                </>
              ) : (
                <Button
                  onClick={enterSelectMode}
                  icon={<DownloadOutlined />}
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
              )}
            </div>
          </div>

          {filteredNotes.length === 0 ? (
            <Card style={{
              border: 'none',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '80px 20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, rgba(253, 249, 196, 0.5) 0%, rgba(227, 242, 253, 0.6) 100%)',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '56px'
              }}>
                💡
              </div>
              <Empty
                description={
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: '500', color: '#616161', marginBottom: '8px' }}>
                      没有找到匹配的灵感
                    </p>
                    <p style={{ fontSize: '14px', color: '#9E9E9E' }}>
                      灵感还未涌现，去书里寻找火花吧
                    </p>
                  </div>
                }
              />
            </Card>
          ) : groupedNotes ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.entries(groupedNotes).map(([bookTitle, bookNotes]) => (
                <div key={bookTitle}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#424242',
                    margin: '0 0 16px 0',
                    paddingLeft: '8px',
                    borderLeft: '4px solid #81C784'
                  }}>
                    {bookTitle} ({bookNotes.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {bookNotes.map((note, index) => {
                      const color = noteColors[index % noteColors.length];
                      const rotation = (Math.random() - 0.5) * 6;
                      const selected = isSelected(note.id);
                      const appearanceStyle = getCardBackground(note, color);

                      return (
                        <div
                          key={note.id}
                          style={{
                            cursor: isSelectMode ? 'pointer' : 'default',
                            transform: `rotate(${rotation}deg)`,
                            transition: 'transform 0.3s ease',
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) scale(1.02)';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.transform = `rotate(${rotation}deg)`;
                          }}
                          onClick={(e) => handleNoteClick(note, e)}
                        >
                          {isSelectMode && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelect(note.id);
                              }}
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                border: selected ? 'none' : '2px solid rgba(0,0,0,0.3)',
                                background: selected ? '#1890FF' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }}
                            >
                              {selected && <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                            </div>
                          )}
                          <div style={{
                            background: appearanceStyle.background,
                            borderRadius: '16px',
                            padding: '20px',
                            boxShadow: selected ? '0 4px 16px rgba(24, 144, 255, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.06)',
                            border: selected ? '2px solid #1890FF' : '1px solid rgba(255,255,255,0.75)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: '-16px',
                              right: '-10px',
                              width: '82px',
                              height: '82px',
                              borderRadius: '50%',
                              background: `${appearanceStyle.accent}22`
                            }} />
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              zIndex: 2
                            }}>
                              <CardAppearanceEditor
                                scope="inspirations"
                                cardKey={note.id}
                                value={appearances[note.id]}
                                onChange={(appearance) => updateAppearance(note.id, appearance)}
                              />
                            </div>
                            <p style={{
                              fontSize: '15px',
                              lineHeight: '1.7',
                              color: '#424242',
                              margin: '0 0 12px 0',
                              maxHeight: '100px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {note.content.slice(0, 80)}
                              {note.content.length > 80 && '...'}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {note.tags.map(tag => (
                                  <Tag
                                    key={tag}
                                    color={getTagColor(tag)}
                                    style={{ borderRadius: '6px', padding: '2px 8px', fontSize: '11px' }}
                                  >
                                    {tag}
                                  </Tag>
                                ))}
                              </div>
                              <span style={{ fontSize: '12px', color: '#9E9E9E' }}>
                                {new Date(note.created_at).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {filteredNotes.map((note, index) => {
                const color = noteColors[index % noteColors.length];
                const rotation = (Math.random() - 0.5) * 6;
                const selected = isSelected(note.id);
                const appearanceStyle = getCardBackground(note, color);

                return (
                  <div
                    key={note.id}
                    style={{
                      cursor: isSelectMode ? 'pointer' : 'default',
                      transform: `rotate(${rotation}deg)`,
                      transition: 'transform 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = `rotate(${rotation}deg)`;
                    }}
                    onClick={(e) => handleNoteClick(note, e)}
                  >
                    {isSelectMode && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(note.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          border: selected ? 'none' : '2px solid rgba(0,0,0,0.3)',
                          background: selected ? '#1890FF' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 10,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {selected && <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                      </div>
                    )}
                    <div style={{
                      background: appearanceStyle.background,
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: selected ? '0 4px 16px rgba(24, 144, 255, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.06)',
                      border: selected ? '2px solid #1890FF' : '1px solid rgba(255,255,255,0.75)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-16px',
                        right: '-10px',
                        width: '82px',
                        height: '82px',
                        borderRadius: '50%',
                        background: `${appearanceStyle.accent}22`
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 2
                      }}>
                        <CardAppearanceEditor
                          scope="inspirations"
                          cardKey={note.id}
                          value={appearances[note.id]}
                          onChange={(appearance) => updateAppearance(note.id, appearance)}
                        />
                      </div>
                      <p style={{
                        fontSize: '15px',
                        lineHeight: '1.7',
                        color: '#424242',
                        margin: '0 0 12px 0',
                        maxHeight: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {note.content.slice(0, 80)}
                        {note.content.length > 80 && '...'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {note.tags.map(tag => (
                            <Tag
                              key={tag}
                              color={getTagColor(tag)}
                              style={{ borderRadius: '6px', padding: '2px 8px', fontSize: '11px' }}
                            >
                              {tag}
                            </Tag>
                          ))}
                        </div>
                        <span style={{ fontSize: '12px', color: '#9E9E9E' }}>
                          {new Date(note.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
};

export default InspirationsPage;
