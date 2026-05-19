import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Slider, message } from 'antd';
import { updateBook, bookExists, type Book } from '../data/books';

export interface EditBookModalProps {
  visible: boolean;
  onClose: () => void;
  book?: Book;
  onSuccess?: () => void;
}

const EditBookModal = ({ visible, onClose, book, onSuccess }: EditBookModalProps) => {
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [coverUrl, setCoverUrl] = useState(book?.cover_url || '');
  const [status, setStatus] = useState<Book['status']>(book?.status || 'want_to_read');
  const [progress, setProgress] = useState(book?.progress || 0);
  const [rating, setRating] = useState(book?.rating || 0);
  const [tags, setTags] = useState(book?.tags || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && book) {
      setTitle(book.title);
      setAuthor(book.author);
      setCoverUrl(book.cover_url || '');
      setStatus(book.status);
      setProgress(book.progress || 0);
      setRating(book.rating || 0);
      setTags(book.tags || []);
    }
  }, [visible, book]);

  const handleSubmit = async () => {
    if (!title) {
      message.warning('请填写书名');
      return;
    }

    setLoading(true);

    if (!book) return;
    const exists = await bookExists(title, book.id);
    if (exists) {
      message.error('这本书已在书架上');
      setLoading(false);
      return;
    }

    await updateBook(book.id, {
      title,
      author,
      cover_url: coverUrl || null,
      cover_path: coverUrl === (book.cover_url || '') ? book.cover_path : null,
      status,
      progress,
      rating: rating || undefined,
      tags: tags.length > 0 ? tags : undefined
    });

    message.success('修改成功');
    setLoading(false);
    onSuccess?.();
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#424242',
          fontFamily: '"Noto Serif SC", serif',
          letterSpacing: '1px',
          textAlign: 'center'
        }}>
          编辑书籍
          <span style={{ fontSize: '16px', marginLeft: '8px', color: '#81C784' }}>📝</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      style={{ top: '5%' }}
      width={520}
      centered
      styles={{
        content: {
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 20px 60px rgba(107, 142, 107, 0.18)'
        }
      }}
    >
      <div style={{ padding: '8px 8px 16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#616161', fontSize: '14px' }}>
            书名
            <span style={{ color: '#FF7043', marginLeft: '4px' }}>*</span>
          </div>
          <Input
            placeholder="请输入书名"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              marginBottom: '4px',
              borderRadius: '12px',
              height: '44px',
              fontSize: '15px',
              borderColor: '#E8E8E8'
            }}
            size="large"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#616161', fontSize: '14px' }}>
            作者
          </div>
          <Input
            placeholder="请输入作者（可选）"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            style={{
              marginBottom: '4px',
              borderRadius: '12px',
              height: '44px',
              fontSize: '15px',
              borderColor: '#E8E8E8'
            }}
            size="large"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#616161', fontSize: '14px' }}>
            封面 URL
          </div>
          <Input
            placeholder="请输入封面图片URL"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            style={{
              marginBottom: '8px',
              borderRadius: '12px',
              height: '44px',
              fontSize: '15px',
              borderColor: '#E8E8E8'
            }}
            size="large"
          />
          {coverUrl && (
            <div style={{
              maxWidth: '200px',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '8px'
            }}>
              <img
                src={coverUrl}
                alt="封面预览"
                style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#616161', fontSize: '14px' }}>
            阅读状态
          </div>
          <Select
            value={status}
            onChange={(value) => setStatus(value as Book['status'])}
            options={[
              { value: 'want_to_read', label: '想读' },
              { value: 'reading', label: '在读' },
              { value: 'read', label: '已读' },
              { value: 'shelved', label: '搁置' }
            ]}
            style={{
              marginBottom: '4px',
              borderRadius: '12px',
              height: '44px',
              fontSize: '15px'
            }}
            size="large"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '500', color: '#616161', fontSize: '14px' }}>
              阅读进度
            </span>
            <span style={{ color: '#81C784', fontSize: '14px', fontWeight: '500' }}>{progress}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            value={progress}
            onChange={setProgress}
            style={{ marginBottom: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '500', color: '#616161', fontSize: '14px' }}>
              个人评分
            </span>
            <span style={{ color: '#FFB74D', fontSize: '14px', fontWeight: '500' }}>
              {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
            </span>
          </div>
          <Slider
            min={0}
            max={5}
            value={rating}
            onChange={setRating}
            marks={{
              0: '0',
              1: '1',
              2: '2',
              3: '3',
              4: '4',
              5: '5'
            }}
            style={{ marginBottom: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#616161', fontSize: '14px' }}>
            标签
          </div>
          <Select
            mode="tags"
            value={tags}
            onChange={setTags}
            style={{ width: '100%', borderRadius: '12px', height: '44px' }}
            placeholder="选择或输入标签"
            options={['经典', '文学', '科幻', '哲学', '历史', '心理学', '编程', '教材'].map(tag => ({ value: tag, label: tag }))}
          />
        </div>

        <Button
          type="primary"
          block
          size="large"
          onClick={handleSubmit}
          loading={loading}
          style={{
            height: '52px',
            borderRadius: '16px',
            fontWeight: '500',
            fontSize: '16px',
            background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
            boxShadow: '0 4px 16px rgba(129, 199, 132, 0.4)',
            border: 'none'
          }}
        >
          保存修改
        </Button>
      </div>
    </Modal>
  );
};

export default EditBookModal;
