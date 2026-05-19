
import { motion } from 'framer-motion';
import { 
  FileTextOutlined, 
  ClockCircleOutlined,
  BookOutlined,
  TagOutlined
} from '@ant-design/icons';
import { Card, Empty, Skeleton } from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { getBooks, type Book } from '../data/books';
import { getNotes, type Note } from '../data/notes';

import { useCachedFetch } from '../hooks/useCachedFetch';

interface ActivityItem {
  id: string;
  type: 'note' | 'book';
  action: string;
  bookTitle: string;
  count?: number;
  time: string;
}

interface StatsData {
  books: Book[];
  notes: Note[];
}

const StatsPage = () => {
  const fetchStatsData = async (): Promise<StatsData> => {
    const [books, notes] = await Promise.all([
      getBooks(),
      getNotes()
    ]);
    return { books, notes };
  };

  const { data: statsData, loading } = useCachedFetch<StatsData>(
    'stats',
    fetchStatsData
  );

  const books = statsData?.books || [];
  const notes = statsData?.notes || [];

  const totalBooks = books.length;
  const totalNotes = notes.length;
  const readingBooks = books.filter(b => b.status === 'reading').length;
  const readBooks = books.filter(b => b.status === 'read').length;
  const wantToReadBooks = books.filter(b => b.status === 'want_to_read').length;

  const generateWeeklyData = () => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const now = new Date();
    const dayOfWeek = now.getDay() || 7;
    
    return days.map((day, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (dayOfWeek - 1 - index));
      const dateStr = date.toISOString().split('T')[0];
      const dayNotes = notes.filter(n => n.created_at.startsWith(dateStr)).length;
      
      return { week: day, notes: dayNotes, date: dateStr };
    });
  };

  const weeklyData = generateWeeklyData();

  const generateMonthlyData = () => {
    const now = new Date();
    const monthlyData: { month: string; notes: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${date.getMonth() + 1}月`;
      
      const monthNotes = notes.filter(n => {
        const noteDate = new Date(n.created_at);
        return noteDate.getFullYear() === date.getFullYear() && 
               noteDate.getMonth() === date.getMonth();
      }).length;
      
      monthlyData.push({ month: monthStr, notes: monthNotes });
    }
    
    return monthlyData;
  };

  const monthlyData = generateMonthlyData();

  const typeDistribution = [
    { name: '书籍', value: books.filter(b => b.type === 'book').length },
    { name: '课堂', value: books.filter(b => b.type === 'class').length },
  ];

  const getTagDistribution = () => {
    const tagCount: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  };

  const tagDistribution = getTagDistribution();
  const COLORS = ['#81C784', '#66BB6A', '#4CAF50', '#C8E6C9', '#A5D6A7', '#43A047', '#388E3C', '#2E7D32'];

  const formatTime = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 5) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const generateRecentActivities = (): ActivityItem[] => {
    const noteActivities = notes
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
      .map(note => ({
        id: `note-${note.id}`,
        type: 'note' as const,
        action: '在',
        bookTitle: books.find(b => b.id === note.book_id)?.title || '未知书籍',
        count: 1,
        time: formatTime(note.created_at)
      }));

    const bookActivities = books
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
      .map(book => ({
        id: `book-${book.id}`,
        type: 'book' as const,
        action: book.status === 'read' ? '已读完' : book.status === 'reading' ? '开始阅读' : '添加到书架',
        bookTitle: book.title,
        time: formatTime(book.created_at)
      }));

    return [...noteActivities, ...bookActivities]
      .sort((a, b) => {
        const timeOrder: Record<string, number> = { '刚刚': 0, '几分钟前': 1, '1小时前': 2, '2小时前': 3, '昨天': 4, '2天前': 5 };
        return (timeOrder[a.time] || 10) - (timeOrder[b.time] || 10);
      })
      .slice(0, 6);
  };

  const recentActivities = generateRecentActivities();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '上午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const renderSkeleton = () => (
    <div style={{ padding: '32px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <Skeleton title={{ width: 150 }} paragraph={{ rows: 1, width: 250 }} active />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
          {[1, 2, 3, 4].map(i => (
            <Card key={i} style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
              background: 'rgba(255, 255, 255, 0.95)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Skeleton.Avatar active style={{ width: 56, height: 56, backgroundColor: 'rgba(129, 199, 132, 0.1)' }} />
                <div style={{ flex: 1 }}>
                  <Skeleton paragraph={{ rows: 3, width: [60, 80, 120] }} active />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <Card style={{
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
            background: 'rgba(255, 255, 255, 0.95)'
          }} title="笔记趋势">
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Skeleton paragraph={{ rows: 10 }} active />
            </div>
          </Card>
          <Card style={{
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
            background: 'rgba(255, 255, 255, 0.95)'
          }} title="类型分布">
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Skeleton paragraph={{ rows: 10 }} active />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  if (loading && !statsData) {
    return renderSkeleton();
  }

  return (
    <>
    <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{
              fontFamily: 'Playfair Display, "Noto Serif SC", serif',
              fontSize: '28px',
              fontWeight: '600',
              color: '#424242',
              margin: '0 0 8px 0'
            }}>
              {getGreeting()}，阅读者
            </h1>
            <p style={{ color: '#757575', fontSize: '15px', margin: 0 }}>
              记录你的阅读数据，见证成长的轨迹
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                background: 'rgba(255, 255, 255, 0.95)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, rgba(129, 199, 132, 0.15) 0%, rgba(200, 230, 201, 0.2) 100%)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOutlined style={{ fontSize: '28px', color: '#81C784' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#9E9E9E', margin: '0 0 4px 0' }}>总书籍数</p>
                    <p style={{ fontSize: '28px', fontWeight: '600', color: '#424242', margin: 0 }}>
                      {totalBooks}
                    </p>
                    <p style={{ fontSize: '13px', color: '#757575', margin: '8px 0 0 0' }}>
                      已读 {readBooks} · 在读 {readingBooks} · 想读 {wantToReadBooks}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                background: 'rgba(255, 255, 255, 0.95)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.15) 0%, rgba(187, 187, 255, 0.2) 100%)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileTextOutlined style={{ fontSize: '28px', color: '#3F51B5' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#9E9E9E', margin: '0 0 4px 0' }}>总笔记数</p>
                    <p style={{ fontSize: '28px', fontWeight: '600', color: '#424242', margin: 0 }}>
                      {totalNotes}
                    </p>
                    <p style={{ fontSize: '13px', color: '#757575', margin: '8px 0 0 0' }}>
                      本周新增 {weeklyData.reduce((sum, d) => sum + d.notes, 0)} 条
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                background: 'rgba(255, 255, 255, 0.95)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 200, 100, 0.2) 100%)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ClockCircleOutlined style={{ fontSize: '28px', color: '#FF9800' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#9E9E9E', margin: '0 0 4px 0' }}>阅读中</p>
                    <p style={{ fontSize: '28px', fontWeight: '600', color: '#424242', margin: 0 }}>
                      {readingBooks}
                    </p>
                    <p style={{ fontSize: '13px', color: '#757575', margin: '8px 0 0 0' }}>
                      计划阅读 {wantToReadBooks} 本
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                background: 'rgba(255, 255, 255, 0.95)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(200, 100, 200, 0.2) 100%)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TagOutlined style={{ fontSize: '28px', color: '#9C27B0' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#9E9E9E', margin: '0 0 4px 0' }}>标签数量</p>
                    <p style={{ fontSize: '28px', fontWeight: '600', color: '#424242', margin: 0 }}>
                      {tagDistribution.length}
                    </p>
                    <p style={{ fontSize: '13px', color: '#757575', margin: '8px 0 0 0' }}>
                      累计使用 {tagDistribution.reduce((sum, t) => sum + t.value, 0)} 次
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                background: 'rgba(255, 255, 255, 0.95)'
              }} title="笔记趋势">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="month" tick={{ fill: '#757575', fontSize: 13 }} />
                      <YAxis tick={{ fill: '#757575', fontSize: 13 }} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '10px', 
                          border: 'none',
                          boxShadow: '0 4px 16px rgba(107, 142, 107, 0.15)'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="notes" 
                        name="笔记数" 
                        stroke="#81C784" 
                        strokeWidth={2}
                        dot={{ fill: '#81C784', strokeWidth: 2 }}
                        activeDot={{ fill: '#66BB6A', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                background: 'rgba(255, 255, 255, 0.95)'
              }} title="类型分布">
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {typeDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={typeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          labelLine={{ stroke: '#E0E0E0' }}
                        >
                          {typeDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '10px', 
                            border: 'none',
                            boxShadow: '0 4px 16px rgba(107, 142, 107, 0.15)'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty description="暂无数据" />
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                background: 'rgba(255, 255, 255, 0.95)'
              }} title="本周笔记统计">
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="week" tick={{ fill: '#757575', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#757575', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '10px', 
                          border: 'none',
                          boxShadow: '0 4px 16px rgba(107, 142, 107, 0.15)'
                        }} 
                      />
                      <Bar dataKey="notes" name="笔记数" fill="#81C784" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <Card style={{
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                background: 'rgba(255, 255, 255, 0.95)'
              }} title="常用标签">
                {tagDistribution.length > 0 ? (
                  <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={tagDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name }) => name}
                          labelLine={{ stroke: '#E0E0E0' }}
                        >
                          {tagDistribution.map((_, index) => (
                            <Cell key={`tag-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '10px', 
                            border: 'none',
                            boxShadow: '0 4px 16px rgba(107, 142, 107, 0.15)'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Empty description="暂无标签" />
                )}
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <Card style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
              background: 'rgba(255, 255, 255, 0.95)'
            }} title="最近阅读动态">
              {recentActivities.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px',
                        padding: '12px',
                        background: '#FAFAFA',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F0F0F0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FAFAFA';
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: activity.type === 'note' 
                          ? 'rgba(63, 81, 181, 0.1)' 
                          : 'rgba(129, 199, 132, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {activity.type === 'note' ? (
                          <FileTextOutlined style={{ fontSize: '20px', color: '#3F51B5' }} />
                        ) : (
                          <BookOutlined style={{ fontSize: '20px', color: '#81C784' }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '15px', color: '#424242', margin: '0 0 4px 0' }}>
                          {activity.action} 《{activity.bookTitle}》
                          {activity.count && <span style={{ color: '#81C784', fontWeight: '500', marginLeft: '8px' }}>新增 {activity.count} 条笔记</span>}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9E9E9E' }}>
                        <ClockCircleOutlined style={{ fontSize: '14px' }} />
                        <span style={{ fontSize: '13px' }}>{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无阅读动态" />
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StatsPage;
