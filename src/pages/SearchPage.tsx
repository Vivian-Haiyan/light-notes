import { useState } from 'react';
import { SearchOutlined, XOutlined, BookOutlined, FileTextOutlined, MutedOutlined, BulbOutlined } from '@ant-design/icons';
import { Input, Card, Skeleton, Empty, Tag, Tabs } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getNotes, type Note } from '../data/notes';
import { getBooks, type Book } from '../data/books';

import BookCover from '../components/BookCover';
import { useCachedFetch } from '../hooks/useCachedFetch';

interface SearchData {
  books: Book[];
  notes: Note[];
}

interface SearchResultNote extends Note {
  bookTitle: string;
  bookAuthor: string;
}

const HighlightText = ({ text, keyword }: { text: string; keyword: string }) => {
  if (!keyword.trim()) return <span>{text}</span>;
  
  const regex = new RegExp(`(${keyword})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} style={{ background: 'rgba(255, 215, 0, 0.4)', padding: '2px 0', borderRadius: '2px' }}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const fetchSearchData = async (): Promise<SearchData> => {
    const [books, notes] = await Promise.all([
      getBooks(),
      getNotes()
    ]);
    return { books, notes };
  };

  const { data: searchData, loading } = useCachedFetch<SearchData>(
    'search',
    fetchSearchData
  );

  const allBooks = searchData?.books || [];
  const allNotes = searchData?.notes || [];

  const filteredBooks = query.trim() ? allBooks.filter(book =>
    book.title.toLowerCase().includes(query.toLowerCase()) ||
    book.author.toLowerCase().includes(query.toLowerCase())
  ) : [];

  const notesWithBookInfo: SearchResultNote[] = query.trim() ? allNotes
    .filter(note =>
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
    .map(note => {
      const book = allBooks.find(b => b.id === note.book_id);
      return {
        ...note,
        bookTitle: book?.title || '未知书籍',
        bookAuthor: book?.author || ''
      };
    }) : [];

  const highlights = notesWithBookInfo.filter(n => 
    n.tags.some(t => ['金句', '书摘', '引用'].includes(t)) || 
    n.content.trim().startsWith('>')
  );

  const inspirations = notesWithBookInfo.filter(n => 
    n.tags.some(t => ['灵感', '想法', '思考', '感悟'].includes(t))
  );

  const plainNotes = notesWithBookInfo.filter(n => 
    !n.tags.some(t => ['金句', '书摘', '引用', '灵感', '想法', '思考', '感悟'].includes(t))
  );

  const allResultsCount = filteredBooks.length + notesWithBookInfo.length;

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const renderSkeleton = () => (
    <div style={{ padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <Skeleton.Input style={{ height: 48, width: '100%' }} active />
        </div>
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ border: 'none', borderRadius: '16px', background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }}>
              <Skeleton paragraph={{ rows: 2, width: ['100%', '60%'] }} active />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && !searchData) {
    return renderSkeleton();
  }

  if (!query.trim()) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, rgba(200, 230, 201, 0.5) 0%, rgba(227, 242, 253, 0.6) 100%)',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '56px'
          }}>
            🔍
          </div>
          <h2 style={{
            fontFamily: 'Playfair Display, "Noto Serif SC", serif',
            fontSize: '28px',
            fontWeight: '600',
            color: '#424242',
            margin: '0 0 12px 0'
          }}>
            请输入关键词开始搜索
          </h2>
          <p style={{ color: '#9E9E9E', fontSize: '15px', margin: '0 0 32px 0' }}>
            搜索书名、作者、笔记内容或标签
          </p>
          <Input.Search
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onSearch={handleSearch}
            onKeyPress={handleKeyPress}
            placeholder="输入搜索关键词..."
            style={{
              borderRadius: '12px',
              height: '52px',
              fontSize: '16px',
              maxWidth: '400px'
            }}
            size="large"
            prefix={<SearchOutlined style={{ color: '#81C784' }} />}
            enterButton
          />
        </div>
      </div>
    );
  }

  const renderBookCard = (book: Book) => (
    <div
      key={book.id}
      style={{ cursor: 'pointer' }}
      onClick={() => navigate(`/books/${book.id}`)}
    >
      <Card
        hoverable
        style={{
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 3px 16px rgba(107, 142, 107, 0.08)',
          background: 'rgba(255, 255, 255, 0.95)'
        }}
        styles={{ body: { padding: '16px' } }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ width: '80px', height: '100px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
            <BookCover coverUrl={book.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#424242',
              margin: '0 0 4px 0'
            }}>
              <HighlightText text={book.title} keyword={query} />
            </h4>
            <p style={{ fontSize: '14px', color: '#9E9E9E', margin: '0 0 8px 0' }}>
              {book.author}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {book.tags?.slice(0, 3).map(tag => (
                <Tag
                  key={tag}
                  color="success"
                  style={{ borderRadius: '6px', padding: '2px 8px', fontSize: '11px' }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNoteItem = (note: SearchResultNote) => (
    <div
      key={note.id}
    >
      <Card
        hoverable
        style={{
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 3px 16px rgba(107, 142, 107, 0.08)',
          background: 'rgba(255, 255, 255, 0.95)',
          cursor: 'pointer'
        }}
        onClick={() => navigate(`/books/${note.book_id}`)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              {note.tags.map(tag => (
                <Tag
                  key={tag}
                  color="success"
                  style={{ borderRadius: '6px', padding: '2px 10px', fontSize: '12px' }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
            <p style={{
              fontSize: '15px',
              lineHeight: '1.7',
              color: '#424242',
              margin: '0 0 12px 0',
              maxHeight: '85px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}>
              <HighlightText text={note.content} keyword={query} />
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOutlined style={{ color: '#81C784', fontSize: '14px' }} />
                <span style={{ fontSize: '13px', color: '#616161', fontWeight: '500' }}>
                  {note.bookTitle}
                </span>
              </div>
              <span style={{ fontSize: '13px', color: '#9E9E9E' }}>
                {new Date(note.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderHighlightCard = (note: SearchResultNote) => {
    const tagColors: Record<string, string> = {
      '金句': '#FFD54F',
      '书摘': '#81C784',
      '引用': '#81D4FA'
    };
    const typeTag = note.tags.find(t => ['金句', '书摘', '引用'].includes(t)) || '书摘';
    const color = tagColors[typeTag] || '#81C784';

    return (
      <div
        key={note.id}
        style={{ cursor: 'pointer' }}
        onClick={() => navigate(`/books/${note.book_id}`)}
      >
        <Card style={{
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
          background: 'rgba(255, 255, 255, 0.98)',
          overflow: 'hidden'
        }}>
          <div style={{ height: '6px', background: color, margin: '-24px -24px 16px -24px' }} />
          <div style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '0',
            height: '0',
            borderLeft: '18px solid transparent',
            borderTop: '18px solid ' + color
          }} />
          <div style={{ minHeight: '100px', marginBottom: '12px' }}>
            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#424242',
              margin: 0,
              fontStyle: 'italic',
              whiteSpace: 'pre-wrap',
              maxHeight: '120px',
              overflow: 'hidden'
            }}>
              <HighlightText text={note.content.replace(/^>\s*/, '')} keyword={query} />
            </p>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid #F0F0F0'
          }}>
            <div style={{ fontSize: '13px', color: '#9E9E9E', fontWeight: '500' }}>
              {note.bookTitle}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Tag
                color="success"
                style={{ borderRadius: '8px', padding: '2px 8px', fontSize: '11px', margin: 0 }}
              >
                {typeTag}
              </Tag>
              <span style={{ fontSize: '12px', color: '#BDBDBD' }}>
                {new Date(note.created_at).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderInspirationCard = (note: SearchResultNote) => {
    const colors = ['#FFFDE7', '#F1F8E9', '#E3F2FD'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rotation = (Math.random() - 0.5) * 6;

    return (
      <div
        key={note.id}
        style={{
          cursor: 'pointer',
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) scale(1.02)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = `rotate(${rotation}deg)`;
        }}
        onClick={() => navigate(`/books/${note.book_id}`)}
      >
        <div style={{
          background: color,
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
        }}>
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
            <HighlightText text={note.content} keyword={query} />
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {note.tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '6px',
                    color: '#6B8E6B'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <span style={{ fontSize: '12px', color: '#9E9E9E' }}>
              {new Date(note.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderEmpty = (label: string) => (
    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
      <Empty
        description={
          <div>
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#616161', marginBottom: '8px' }}>
              没有找到匹配的{label}
            </p>
            <p style={{ fontSize: '14px', color: '#9E9E9E' }}>
              试试其他关键词吧
            </p>
          </div>
        }
      />
    </div>
  );

  return (
    <>
    <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Input.Search
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onSearch={handleSearch}
                  onKeyPress={handleKeyPress}
                  placeholder="搜索书名、作者、笔记内容..."
                  style={{ borderRadius: '12px', height: '48px', fontSize: '16px' }}
                  size="large"
                  prefix={<SearchOutlined style={{ color: '#81C784' }} />}
                  allowClear
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setSearchParams({});
                    }}
                    style={{
                      position: 'absolute',
                      right: '60px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9E9E9E'
                    }}
                  >
                    <XOutlined />
                  </button>
                )}
              </div>
            </div>
          </div>

          <Tabs
            defaultActiveKey="all"
            items={[
              {
                key: 'all',
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SearchOutlined />
                    全部 <span style={{ color: '#81C784', fontWeight: '600' }}>({allResultsCount})</span>
                  </div>
                ),
                children: (
                  <div style={{ paddingTop: '20px' }}>
                    {allResultsCount === 0 ? (
                      renderEmpty('内容')
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredBooks.map(renderBookCard)}
                        {notesWithBookInfo.map(renderNoteItem)}
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'books',
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOutlined />
                    书籍 <span style={{ color: '#81C784', fontWeight: '600' }}>({filteredBooks.length})</span>
                  </div>
                ),
                children: (
                  <div style={{ paddingTop: '20px' }}>
                    {filteredBooks.length === 0 ? (
                      renderEmpty('书籍')
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredBooks.map(renderBookCard)}
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'notes',
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileTextOutlined />
                    笔记 <span style={{ color: '#81C784', fontWeight: '600' }}>({plainNotes.length})</span>
                  </div>
                ),
                children: (
                  <div style={{ paddingTop: '20px' }}>
                    {plainNotes.length === 0 ? (
                      renderEmpty('笔记')
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {plainNotes.map(renderNoteItem)}
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'highlights',
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MutedOutlined />
                    书摘 <span style={{ color: '#81C784', fontWeight: '600' }}>({highlights.length})</span>
                  </div>
                ),
                children: (
                  <div style={{ paddingTop: '20px' }}>
                    {highlights.length === 0 ? (
                      renderEmpty('书摘')
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {highlights.map(renderHighlightCard)}
                      </div>
                    )}
                  </div>
                )
              },
              {
                key: 'inspirations',
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BulbOutlined />
                    灵感 <span style={{ color: '#81C784', fontWeight: '600' }}>({inspirations.length})</span>
                  </div>
                ),
                children: (
                  <div style={{ paddingTop: '20px' }}>
                    {inspirations.length === 0 ? (
                      renderEmpty('灵感')
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {inspirations.map(renderInspirationCard)}
                      </div>
                    )}
                  </div>
                )
              }
            ]}
            style={{ marginBottom: '20px' }}
          />
        </div>
      </div>
    </>
  );
};

export default SearchPage;
