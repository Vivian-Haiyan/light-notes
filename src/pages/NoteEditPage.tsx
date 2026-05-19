import { useState, useRef } from 'react';
import { 
  ArrowLeftOutlined, 
  BoldOutlined, 
  ItalicOutlined, 
  CodeOutlined,
  EyeOutlined,
  EyeFilled,
  DeleteOutlined,
  PictureOutlined,
  MessageOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Input, Button, Select, Card, message, Popconfirm, Modal, Checkbox, Skeleton } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getBooks, type Book } from '../data/books';
import { addNote, updateNote, getNoteById, deleteNote, type Note } from '../data/notes';
import { useBackground } from '../hooks/useBackground';
import { useCachedFetch } from '../hooks/useCachedFetch';

interface NoteEditData {
  books: Book[];
  note: Note | null;
}

const TrashOutlined = DeleteOutlined;

const NoteEditPage = () => {
  const { id: noteId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isInspiration, setIsInspiration] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteText, setQuoteText] = useState('');
  const [quoteSource, setQuoteSource] = useState('');
  const [uploading, setUploading] = useState(false);

  const noteTags = ['感悟', '金句', '摘录', '思考', '疑问', '心得', '人物', '行动清单', '引用', '灵感', '想法'];

  const fetchNoteEditData = async (): Promise<NoteEditData> => {
    const [books, note] = await Promise.all([
      getBooks(),
      noteId ? getNoteById(noteId) : Promise.resolve(null)
    ]);
    return { books, note: note ?? null };
  };

  const { data: noteEditData, loading } = useCachedFetch<NoteEditData>(
    noteId ? `note-edit-${noteId}` : 'note-edit-new',
    fetchNoteEditData
  );

  const books = noteEditData?.books || [];
  const note = noteEditData?.note || null;

  const isEdit = !!noteId;
  const { backgroundStyle, overlayColor } = useBackground(isEdit ? '5' : '4');

  const handleSave = async () => {
    if (!selectedBookId) {
      message.warning('请选择所属书籍');
      return;
    }
    if (!content.trim()) {
      message.warning('请输入笔记内容');
      return;
    }

    let finalTags = [...tags];
    const inspirationTags = ['灵感', '想法', '思考', '感悟'];
    
    if (isInspiration) {
      const hasInspirationTag = finalTags.some(tag => inspirationTags.includes(tag));
      if (!hasInspirationTag) {
        finalTags = [...finalTags, '灵感'];
      }
    } else {
      finalTags = finalTags.filter(tag => !inspirationTags.includes(tag));
    }

    try {
      if (isEdit && noteId) {
        await updateNote(noteId, { content, tags: finalTags });
        message.success('修改成功');
      } else {
        await addNote({ book_id: selectedBookId, content, tags: finalTags });
        message.success('保存成功');
      }
      navigate(`/books/${selectedBookId}`);
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleDelete = async () => {
    if (noteId) {
      try {
        await deleteNote(noteId);
        message.success('删除成功');
        navigate(`/books/${selectedBookId}`);
      } catch (error) {
        message.error('删除失败');
      }
    }
  };

  const handleFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      
      let prefix = '';
      let suffix = '';
      
      switch (format) {
        case 'bold':
          prefix = '**';
          suffix = '**';
          break;
        case 'italic':
          prefix = '*';
          suffix = '*';
          break;
        case 'h1':
          prefix = '# ';
          break;
        case 'h2':
          prefix = '## ';
          break;
        case 'quote':
          prefix = '> ';
          break;
        case 'code':
          prefix = '`';
          suffix = '`';
          break;
      }
      
      const newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
      setContent(newContent);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
    } else {
      switch (format) {
        case 'bold':
          setContent(content + '****');
          break;
        case 'italic':
          setContent(content + '**');
          break;
        case 'h1':
          setContent(content + '# ');
          break;
        case 'h2':
          setContent(content + '## ');
          break;
        case 'quote':
          setContent(content + '> ');
          break;
        case 'code':
          setContent(content + '``');
          break;
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('请上传图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('图片大小不能超过 5MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const imageMarkdown = `\n![图片](${base64Url})\n`;
      setContent(content + imageMarkdown);
      setUploading(false);
      message.success('图片插入成功');
    };
    reader.onerror = () => {
      message.error('图片读取失败');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleInsertQuote = () => {
    if (!quoteText.trim()) {
      message.warning('请输入引用文字');
      return;
    }

    let source = '';
    if (quoteSource.trim()) {
      source = ` ——${quoteSource}`;
    } else if (selectedBookId) {
      const book = books.find(b => b.id === selectedBookId);
      if (book) {
        source = ` ——《${book.title}》`;
      }
    }

    const formattedQuote = `\n> ${quoteText}${source}\n\n[查看原文](/books/${selectedBookId}#原文)\n\n`;
    setContent(content + formattedQuote);
    setQuoteText('');
    setQuoteSource('');
    setShowQuoteModal(false);
  };

  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; font-weight: 600; margin: 12px 0;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 22px; font-weight: 600; margin: 16px 0;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 28px; font-weight: 600; margin: 20px 0;">$1</h1>')
      .replace(/^> (.*$)/gim, '<blockquote style="border-left: 3px solid #81C784; padding-left: 12px; margin: 12px 0; color: #616161; font-style: italic;">$1</blockquote>')
      .replace(/^- (.*$)/gim, '<li style="margin-left: 20px;">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li style="margin-left: 20px;">$1. $2</li>')
      .replace(/`([^`]+)`/g, '<code style="background: rgba(129, 199, 132, 0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 12px 0;" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #4CAF50; text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
    return { __html: html };
  };

  const renderSkeleton = () => (
    <div style={{ padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Skeleton.Button active style={{ width: 100, height: 40 }} />
        <Skeleton.Input style={{ width: 150 }} active />
        <Skeleton.Button active style={{ width: 120, height: 40 }} />
      </div>
      <Card style={{
        border: 'none',
        borderRadius: '20px',
        boxShadow: '0 4px 24px rgba(107, 142, 107, 0.1)',
        background: 'rgba(255, 255, 255, 0.95)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <Skeleton.Input style={{ width: 100, marginBottom: '8px' }} active />
          <Skeleton.Input style={{ width: '100%', height: 44 }} active />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <Skeleton.Input style={{ width: 100, marginBottom: '8px' }} active />
          <Skeleton.Input style={{ width: 300, marginBottom: '8px' }} active />
          <Skeleton paragraph={{ rows: 8 }} active />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <Skeleton.Input style={{ width: 60, marginBottom: '8px' }} active />
          <Skeleton.Input style={{ width: '100%', height: 44 }} active />
        </div>
      </Card>
    </div>
  );

  if (loading && !noteEditData) {
    return renderSkeleton();
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: backgroundStyle,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: overlayColor,
        pointerEvents: 'none'
      }} />
      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Button
            onClick={() => navigate(selectedBookId ? `/books/${selectedBookId}` : '/books')}
            style={{
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
            取消
          </Button>
          <h1 style={{
            fontFamily: 'Playfair Display, "Noto Serif SC", serif',
            fontSize: '24px',
            fontWeight: '600',
            color: '#424242',
            margin: 0
          }}>
            {isEdit ? '编辑笔记' : '新建笔记'}
          </h1>
          <Button
            type="primary"
            onClick={handleSave}
            style={{
              borderRadius: '12px',
              height: '40px',
              padding: '0 24px',
              background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
              boxShadow: '0 3px 12px rgba(129, 199, 132, 0.35)',
              border: 'none'
            }}
          >
            保存笔记
          </Button>
        </div>

        <Card style={{
          border: 'none',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(107, 142, 107, 0.1)',
          background: 'rgba(255, 255, 255, 0.95)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#616161', marginBottom: '8px', display: 'block' }}>
              所属书籍
            </label>
            <Select
              value={selectedBookId}
              onChange={setSelectedBookId}
              style={{ width: '100%', borderRadius: '12px', height: '44px' }}
              placeholder="请选择书籍"
              options={books.map(book => ({
                value: book.id,
                label: (
                  <div>
                    <div style={{ fontWeight: '500', color: '#424242' }}>{book.title}</div>
                    <div style={{ fontSize: '12px', color: '#9E9E9E' }}>{book.author} · {book.status === 'read' ? '已读' : book.status === 'reading' ? '在读' : '想读'}</div>
                  </div>
                )
              }))}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#616161' }}>
                笔记内容
              </label>
              <Button
                type="text"
                onClick={() => setShowPreview(!showPreview)}
                icon={showPreview ? <EyeFilled /> : <EyeOutlined />}
                style={{ color: '#6B8E6B' }}
              >
                {showPreview ? '编辑' : '预览'}
              </Button>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              padding: '8px', 
              background: '#FAFAFA', 
              borderRadius: '10px',
              marginBottom: '8px'
            }}>
              <Button
                type="text"
                icon={<BoldOutlined />}
                onClick={() => handleFormat('bold')}
                style={{ padding: '6px 10px', borderRadius: '8px' }}
                title="加粗"
              />
              <Button
                type="text"
                icon={<ItalicOutlined />}
                onClick={() => handleFormat('italic')}
                style={{ padding: '6px 10px', borderRadius: '8px' }}
                title="斜体"
              />
              <div style={{ width: '1px', background: '#E0E0E0' }} />
              <Button
                type="text"
                onClick={() => handleFormat('h1')}
                style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}
                title="标题1"
              >
                H1
              </Button>
              <Button
                type="text"
                onClick={() => handleFormat('h2')}
                style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}
                title="标题2"
              >
                H2
              </Button>
              <div style={{ width: '1px', background: '#E0E0E0' }} />
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => setShowQuoteModal(true)}
                style={{ padding: '6px 10px', borderRadius: '8px' }}
                title="插入引用"
              />
              <Button
                type="text"
                icon={<CodeOutlined />}
                onClick={() => handleFormat('code')}
                style={{ padding: '6px 10px', borderRadius: '8px' }}
                title="代码"
              />
              <div style={{ width: '1px', background: '#E0E0E0' }} />
              <Button
                type="text"
                icon={uploading ? <LoadingOutlined /> : <PictureOutlined />}
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '6px 10px', borderRadius: '8px' }}
                title="插入图片"
                disabled={uploading}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            {showPreview ? (
              <div 
                style={{ 
                  minHeight: '300px', 
                  padding: '16px', 
                  background: '#FAFAFA', 
                  borderRadius: '12px',
                  border: '1px solid #E8E8E8',
                  fontSize: '16px',
                  lineHeight: '1.7',
                  color: '#424242'
                }}
                dangerouslySetInnerHTML={renderMarkdown(content)}
              />
            ) : (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始记录你的阅读心得..."
                style={{
                  width: '100%',
                  minHeight: '300px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E8E8E8',
                  fontSize: '15px',
                  lineHeight: '1.7',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#616161', marginBottom: '8px', display: 'block' }}>
              标签
            </label>
            <Select
              mode="tags"
              value={tags}
              onChange={setTags}
              style={{ width: '100%', borderRadius: '12px', height: '44px' }}
              placeholder="选择或输入标签"
              options={noteTags.map(tag => ({ value: tag, label: tag }))}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Checkbox 
              checked={isInspiration} 
              onChange={(e) => setIsInspiration(e.target.checked)}
            >
              <span style={{ fontWeight: '500', color: '#424242' }}>标记为灵感</span>
              <span style={{ color: '#9E9E9E', marginLeft: '8px', fontSize: '13px' }}>（将显示在灵感集锦中）</span>
            </Checkbox>
          </div>
        </Card>

        {isEdit && note && (
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <p style={{ fontSize: '13px', color: '#9E9E9E', marginBottom: '8px' }}>
              最后修改：{new Date(note.updated_at).toLocaleString('zh-CN')}
            </p>
            <Popconfirm
              title="确定删除这条笔记吗？"
              onConfirm={handleDelete}
              okText="确定"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<TrashOutlined />}>
                删除笔记
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>

      <Modal
        title="插入引用"
        visible={showQuoteModal}
        onCancel={() => setShowQuoteModal(false)}
        footer={null}
        centered
        style={{ top: '20%' }}
      >
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#616161', marginBottom: '8px', display: 'block' }}>
              引用文字
              <span style={{ color: '#FF7043', marginLeft: '4px' }}>*</span>
            </label>
            <textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              placeholder="请输入要引用的原文内容..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #E8E8E8',
                fontSize: '14px',
                lineHeight: '1.6',
                resize: 'vertical'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#616161', marginBottom: '8px', display: 'block' }}>
              原文出处（可选）
            </label>
            <Input
              value={quoteSource}
              onChange={(e) => setQuoteSource(e.target.value)}
              placeholder="如：《书名》 第3章 P.120"
              style={{ borderRadius: '10px', height: '40px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              onClick={() => setShowQuoteModal(false)}
              style={{ flex: 1, borderRadius: '10px', height: '44px' }}
            >
              取消
            </Button>
            <Button
              type="primary"
              onClick={handleInsertQuote}
              style={{
                flex: 1,
                borderRadius: '10px',
                height: '44px',
                background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                border: 'none'
              }}
            >
              插入引用
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NoteEditPage;
