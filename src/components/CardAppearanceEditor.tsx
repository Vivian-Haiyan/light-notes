import { useRef, useState } from 'react';
import { Button, message, Popover } from 'antd';
import { BgColorsOutlined, PictureOutlined, UndoOutlined } from '@ant-design/icons';
import { cardThemePresets, type CardAppearance } from '../utils/cardAppearance';
import { uploadCardBackgroundFile } from '../lib/storage';

interface CardAppearanceEditorProps {
  scope: string;
  cardKey: string;
  value?: CardAppearance;
  onChange: (value: CardAppearance) => Promise<void> | void;
}

const CardAppearanceEditor = ({ scope, cardKey, value = {}, onChange }: CardAppearanceEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('请上传图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('图片大小不能超过 5MB');
      return;
    }

    try {
      setUploading(true);
      const { path, url } = await uploadCardBackgroundFile(scope, cardKey, file);
      await onChange({ ...value, backgroundImage: url || undefined, backgroundImagePath: path });
      message.success('卡片背景已更新');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '图片上传失败');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const content = (
    <div style={{ width: '220px' }}>
      <div style={{ fontSize: '13px', color: '#616161', marginBottom: '10px' }}>主题色</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {cardThemePresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onChange({ themeColor: preset.id })}
            title={preset.label}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: value.themeColor === preset.id ? `2px solid ${preset.accent}` : '1px solid rgba(0,0,0,0.08)',
              background: preset.background,
              cursor: 'pointer'
            }}
          />
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          icon={<PictureOutlined />}
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{ flex: 1 }}
        >
          上传图片
        </Button>
        <Button icon={<UndoOutlined />} onClick={() => onChange({})}>
          重置
        </Button>
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight">
      <Button
        type="text"
        icon={<BgColorsOutlined />}
        onClick={(event) => event.stopPropagation()}
        style={{ color: '#757575' }}
      />
    </Popover>
  );
};

export default CardAppearanceEditor;
