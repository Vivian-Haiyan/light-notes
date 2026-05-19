import { useState } from 'react';
import { Modal, Input, Select, Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { addBook, bookExists } from '../data/books';
import { uploadBookCoverFile } from '../lib/storage';
import { buildBookDraftFromFile } from '../utils/bookImport';
import ImageUploader from './ImageUploader';

interface AddBookModalProps {
  visible: boolean;
  onClose: () => void;
  initialData?: {
    id: string;
    title: string;
    author: string;
    cover_url: string | null;
    status: 'want_to_read' | 'reading' | 'read';
    type: 'book' | 'class';
  } | null;
  onSuccess?: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const AddBookModal = ({ visible, onClose, initialData = null, onSuccess }: AddBookModalProps) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [author, setAuthor] = useState(initialData?.author || '');
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_url || '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'want_to_read' | 'reading' | 'read'>(initialData?.status || 'want_to_read');
  const [type, setType] = useState<'book' | 'class'>(initialData?.type || 'book');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recognizing, setRecognizing] = useState(false);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCoverUrl('');
    setCoverFile(null);
    setStatus('want_to_read');
    setType('book');
  };

  const handleManualSubmit = async () => {
    if (!title.trim()) {
      message.warning('请填写书名');
      return;
    }

    setLoading(true);

    try {
      const exists = await bookExists(title);
      if (exists && !initialData) {
        message.error('这本书已在书架上');
        return;
      }

      const storedCoverUrl = coverFile ? (await uploadBookCoverFile(coverFile)).path : coverUrl || null;
      await addBook({ title, author, cover_url: storedCoverUrl, status, type });
      message.success('添加成功');
      onSuccess?.();
      onClose();
      resetForm();
    } catch {
      message.error('添加失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.json') && !fileName.endsWith('.csv')) {
      message.error('请上传 JSON 或 CSV 格式的文件');
      return false;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        let booksData: { title: string; author?: string }[] = [];
        const content = event.target?.result as string;

        if (fileName.endsWith('.json')) {
          booksData = JSON.parse(content) as { title: string; author?: string }[];
        } else {
          const lines = content.split('\n').filter((line) => line.trim());
          const headers = lines[0].split(',');
          const titleIndex = headers.indexOf('title');
          const authorIndex = headers.indexOf('author');

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            booksData.push({
              title: values[titleIndex]?.trim() || '',
              author: authorIndex >= 0 ? values[authorIndex]?.trim() : undefined
            });
          }
        }

        let successCount = 0;
        let failCount = 0;

        for (const bookData of booksData) {
          if (!bookData.title.trim()) continue;

          const exists = await bookExists(bookData.title);
          if (exists) {
            message.warning(`《${bookData.title}》已在书架上`);
            failCount++;
            continue;
          }

          await addBook({
            title: bookData.title,
            author: bookData.author || '',
            cover_url: null,
            status: 'want_to_read',
            type: 'book'
          });
          successCount++;
        }

        message.info(`批量导入完成：成功 ${successCount} 本，跳过 ${failCount} 本`);
        onSuccess?.();
      } catch {
        message.error('文件解析失败，请检查文件格式');
      } finally {
        setUploading(false);
        onClose();
        resetForm();
      }
    };

    reader.onerror = () => {
      message.error('文件读取失败');
      setUploading(false);
    };

    reader.readAsText(file);
    return false;
  };

  const handleSourceFileUpload = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isSupported = file.type.startsWith('image/') || file.type === 'application/pdf' || lowerName.endsWith('.pdf');

    if (!isSupported) {
      message.error('请上传 PDF 或图片文件');
      return false;
    }

    if (file.type.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
      message.error('图片大小不能超过 5MB');
      return false;
    }

    try {
      setRecognizing(true);
      const draft = await buildBookDraftFromFile(file);
      setTitle(draft.title);
      setAuthor(draft.author);
      setCoverUrl(draft.coverUrl);
      setCoverFile(draft.coverFile);
      setStatus(draft.status);
      setType(draft.type);
      message.success('已自动识别，可继续手动修改');
    } catch {
      message.error('文件识别失败，请稍后再试');
    } finally {
      setRecognizing(false);
    }

    return false;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      title={
        <div
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#424242',
            fontFamily: '"Noto Serif SC", serif',
            letterSpacing: '1px',
            textAlign: 'center'
          }}
        >
          {initialData ? '修改书籍' : '添加新书'}
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      style={{ top: '10%' }}
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
            类型
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setType('book')}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: type === 'book' ? '2px solid #81C784' : '1px solid #E0E0E0',
                backgroundColor: type === 'book' ? 'rgba(129, 199, 132, 0.1)' : 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: type === 'book' ? '600' : '500',
                color: type === 'book' ? '#6B8E6B' : '#616161'
              }}
            >
              书籍
            </button>
            <button
              onClick={() => setType('class')}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                border: type === 'class' ? '2px solid #81C784' : '1px solid #E0E0E0',
                backgroundColor: type === 'class' ? 'rgba(129, 199, 132, 0.1)' : 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: type === 'class' ? '600' : '500',
                color: type === 'class' ? '#6B8E6B' : '#616161'
              }}
            >
              课堂
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#616161', fontSize: '14px' }}>
            书名 <span style={{ color: '#FF7043' }}>*</span>
          </div>
          <Input
            placeholder="请输入书名"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            style={{ borderRadius: '12px', height: '44px', fontSize: '15px', borderColor: '#E8E8E8' }}
            size="large"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#616161', fontSize: '14px' }}>
            封面
          </div>
          <ImageUploader value={coverUrl} onChange={setCoverUrl} onFileSelect={setCoverFile} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#616161', fontSize: '14px' }}>
            作者 / 讲师
          </div>
          <Input
            placeholder="请输入作者或讲师（可选）"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            style={{ borderRadius: '12px', height: '44px', fontSize: '15px', borderColor: '#E8E8E8' }}
            size="large"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Upload accept=".json,.csv" beforeUpload={handleFileUpload} showUploadList={false} style={{ width: '100%' }}>
            <Button
              type="dashed"
              block
              icon={<UploadOutlined />}
              loading={uploading}
              style={{ borderRadius: '12px', height: '44px', borderColor: '#E8E8E8', color: '#757575', fontSize: '14px' }}
            >
              {uploading ? '导入中...' : '从文件导入书籍（支持 JSON / CSV）'}
            </Button>
          </Upload>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Upload accept=".pdf,image/*" beforeUpload={handleSourceFileUpload} showUploadList={false} style={{ width: '100%' }}>
            <Button
              block
              icon={<UploadOutlined />}
              loading={recognizing}
              style={{ borderRadius: '12px', height: '44px', borderColor: '#C8E6C9', color: '#5F7E63', fontSize: '14px' }}
            >
              {recognizing ? '识别中...' : '从 PDF / 图片识别新书'}
            </Button>
          </Upload>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ marginBottom: '8px', fontWeight: '500', color: '#616161', fontSize: '14px' }}>
            阅读状态
          </div>
          <Select
            value={status}
            onChange={(value) => setStatus(value)}
            options={[
              { value: 'want_to_read', label: '想读' },
              { value: 'reading', label: '在读' },
              { value: 'read', label: '已读' }
            ]}
            style={{ marginBottom: '4px', borderRadius: '12px', height: '44px', fontSize: '15px' }}
            size="large"
          />
        </div>

        <Button
          type="primary"
          block
          size="large"
          onClick={handleManualSubmit}
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
          {initialData ? '保存修改' : '添加书籍'}
        </Button>
      </div>
    </Modal>
  );
};

export default AddBookModal;
