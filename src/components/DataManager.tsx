import { useState, useRef } from 'react';
import { Button, Dropdown, message, Modal } from 'antd';
import { DownloadOutlined, UploadOutlined, FileTextOutlined, DatabaseOutlined } from '@ant-design/icons';
import { addBook, getBooks } from '../data/books';
import { addNote, getNotes } from '../data/notes';
import { globalDataStore } from '../lib/globalDataStore';

const DataManager = () => {
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importData, setImportData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = async () => {
    try {
      const [books, notes] = await Promise.all([getBooks(), getNotes()]);
      const data = { exportTime: new Date().toISOString(), version: '2.0', books, notes };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `鎷惧厜鏈澶囦唤_${new Date().toLocaleDateString('zh-CN')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('鏁版嵁瀵煎嚭鎴愬姛');
    } catch {
      message.error('鏁版嵁瀵煎嚭澶辫触');
    }
  };

  const handleExportMarkdown = async () => {
    try {
      const [books, notes] = await Promise.all([getBooks(), getNotes()]);
      let markdown = `# 鎷惧厜鏈 - 闃呰绗旇瀵煎嚭\n\n`;
      markdown += `> 瀵煎嚭鏃堕棿锛?{new Date().toLocaleString('zh-CN')}\n\n---\n\n`;

      for (const book of books) {
        markdown += `## ${book.title}\n\n`;
        if (book.author) markdown += `**浣滆€咃細** ${book.author}\n\n`;
        markdown += `**鐘舵€侊細** ${book.status}\n\n`;
        const bookNotes = notes.filter((note) => note.book_id === book.id);
        for (const note of bookNotes) {
          markdown += `### ${new Date(note.created_at).toLocaleDateString('zh-CN')}\n\n`;
          markdown += `${note.content}\n\n`;
          if (note.tags.length > 0) markdown += `*鏍囩锛?{note.tags.join(', ')}*\n\n`;
          markdown += `---\n\n`;
        }
      }

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `鎷惧厜鏈绗旇_${new Date().toLocaleDateString('zh-CN')}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('Markdown 瀵煎嚭鎴愬姛');
    } catch {
      message.error('瀵煎嚭澶辫触');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setImportData(loadEvent.target?.result as string);
      setImportModalVisible(true);
    };
    reader.readAsText(file);
  };

  const executeImport = async () => {
    try {
      const data = JSON.parse(importData) as {
        books?: Array<Parameters<typeof addBook>[0]>;
        notes?: Array<Parameters<typeof addNote>[0]>;
      };
      if (!data.books || !data.notes) {
        message.error('数据格式不正确');
        return;
      }

      for (const book of data.books) {
        await addBook(book);
      }
      for (const note of data.notes) {
        await addNote(note);
      }

      message.success(`导入成功：${data.books.length} 本书，${data.notes.length} 条笔记`);
      setImportModalVisible(false);
      setImportData('');
      await globalDataStore.refreshAll();
    } catch {
      message.error('导入失败：数据格式错误');
    }
  };

  const menuItems = [
    {
      key: 'export-json',
      icon: <DatabaseOutlined />,
      label: '\u5bfc\u51fa\u5907\u4efd JSON',
      onClick: handleExportJSON
    },
    {
      key: 'export-md',
      icon: <FileTextOutlined />,
      label: '\u5bfc\u51fa\u4e3a Markdown',
      onClick: handleExportMarkdown
    },
    {
      type: 'divider' as const
    },
    {
      key: 'import',
      icon: <UploadOutlined />,
      label: '\u5bfc\u5165\u5907\u4efd JSON',
      onClick: () => fileInputRef.current?.click()
    }
  ];

  return (
    <>
      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
        <Button icon={<DownloadOutlined />} style={{ borderRadius: '12px', height: '40px', padding: '0 16px', borderColor: '#E0E0E0' }}>
          鏁版嵁绠＄悊
        </Button>
      </Dropdown>

      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />

      <Modal
        title="瀵煎叆鏁版嵁"
        open={importModalVisible}
        onOk={executeImport}
        onCancel={() => {
          setImportModalVisible(false);
          setImportData('');
        }}
        okText="纭瀵煎叆"
        cancelText="鍙栨秷"
      >
        <div style={{ marginBottom: '16px', color: '#FF5722', fontWeight: 500 }}>
          瀵煎叆浼氭妸鏂囦欢鍐呭杩藉姞鍒板綋鍓嶈处鍙风殑鏁版嵁涓€?        </div>
        <div style={{ background: '#F5F5F5', padding: '12px', borderRadius: '8px', maxHeight: '300px', overflow: 'auto' }}>
          <pre style={{ margin: 0, fontSize: '12px' }}>{importData.slice(0, 500)}{importData.length > 500 ? '...' : ''}</pre>
        </div>
      </Modal>
    </>
  );
};

export default DataManager;
