import { useState } from 'react';
import { 
  Card, Empty, Button, Modal, Form, InputNumber, DatePicker, Select, 
  Progress, Tag, Popconfirm, message, Skeleton
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined 
} from '@ant-design/icons';
import { 
  getReadingPlans, addReadingPlan, updateReadingPlan, deleteReadingPlan, 
  type ReadingPlan 
} from '../data/readingPlans';
import { getBooks, type Book } from '../data/books';

import { useCachedFetch } from '../hooks/useCachedFetch';

interface PlansData {
  plans: ReadingPlan[];
  books: Book[];
}

const ReadingPlansPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ReadingPlan | null>(null);
  const [form] = Form.useForm();

  const fetchPlansData = async (): Promise<PlansData> => {
    const [plans, books] = await Promise.all([
      getReadingPlans(),
      getBooks()
    ]);
    return { plans, books };
  };

  const { data: plansData, loading, refresh } = useCachedFetch<PlansData>(
    'reading-plans',
    fetchPlansData
  );

  const plans = plansData?.plans || [];
  const books = plansData?.books || [];

  const handleAddPlan = () => {
    setEditingPlan(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditPlan = (plan: ReadingPlan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      bookId: plan.bookId,
      startDate: plan.startDate ? new Date(plan.startDate) : null,
      endDate: plan.endDate ? new Date(plan.endDate) : null,
      dailyGoal: plan.dailyGoal,
      goalUnit: plan.goalUnit,
      progress: plan.progress,
    });
    setIsModalOpen(true);
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deleteReadingPlan(id);
      message.success('删除成功');
      refresh();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleCompletePlan = async (id: string) => {
    try {
      await updateReadingPlan(id, { status: 'completed', progress: 100 });
      message.success('计划已完成！🎉');
      refresh();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const planData = {
        bookId: values.bookId,
        bookTitle: books.find(b => b.id === values.bookId)?.title || '',
        startDate: values.startDate?.toISOString() || new Date().toISOString(),
        endDate: values.endDate?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        dailyGoal: values.dailyGoal || 20,
        goalUnit: values.goalUnit || 'pages',
        progress: values.progress || 0,
        status: 'active' as const,
      };

      if (editingPlan) {
        await updateReadingPlan(editingPlan.id, planData);
        message.success('计划更新成功');
      } else {
        await addReadingPlan(planData);
        message.success('计划创建成功');
      }
      
      setIsModalOpen(false);
      refresh();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'abandoned': return 'gray';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'abandoned': return '已放弃';
      default: return status;
    }
  };

  const getDaysLeft = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const renderSkeleton = () => (
    <div style={{ padding: '32px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <Skeleton title={{ width: 200 }} paragraph={{ rows: 1, width: 300 }} active />
          </div>
          <Skeleton.Button active style={{ width: 120, height: 44 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[1, 2].map((i) => (
            <Card key={i} style={{ border: 'none', borderRadius: '16px', background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }}>
              <Skeleton paragraph={{ rows: 3, width: ['100%', '70%', '50%'] }} active />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && !plansData) {
    return renderSkeleton();
  }

  return (
    <>
    <div style={{ padding: '32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h1 style={{
                fontFamily: 'Playfair Display, "Noto Serif SC", serif',
                fontSize: '32px',
                fontWeight: '600',
                color: '#424242',
                margin: '0 0 8px 0'
              }}>
                📖 阅读计划
              </h1>
              <p style={{ fontSize: '16px', color: '#757575', margin: 0 }}>
                制定阅读目标，追踪你的阅读进度
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddPlan}
              style={{
                borderRadius: '12px',
                height: '44px',
                padding: '0 24px',
                background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                boxShadow: '0 3px 12px rgba(129, 199, 132, 0.35)',
                border: 'none'
              }}
            >
              新建计划
            </Button>
          </div>

          {plans.length === 0 ? (
            <Card style={{
              border: 'none',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '80px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(107, 142, 107, 0.1)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.8 }}>📅</div>
              <Empty
                description={
                  <div>
                    <p style={{ fontSize: '17px', fontWeight: '500', color: '#616161', marginBottom: '8px' }}>
                      还没有阅读计划
                    </p>
                    <p style={{ fontSize: '14px', color: '#9E9E9E' }}>
                      点击上方按钮创建你的第一个阅读计划吧
                    </p>
                  </div>
                }
              />
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {plans.map((plan) => {
                const book = books.find(b => b.id === plan.bookId);
                const daysLeft = getDaysLeft(plan.endDate);
                
                return (
                  <Card key={plan.id} style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
                    background: 'rgba(255, 255, 255, 0.95)'
                  }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#424242',
                            margin: 0
                          }}>
                            {plan.bookTitle || book?.title || '未知书籍'}
                          </h3>
                          <Tag color={getStatusColor(plan.status)} style={{ borderRadius: '8px' }}>
                            {getStatusLabel(plan.status)}
                          </Tag>
                          {plan.status === 'active' && daysLeft > 0 && (
                            <Tag color={daysLeft <= 7 ? 'red' : 'orange'} style={{ borderRadius: '8px' }}>
                              <ClockCircleOutlined style={{ marginRight: '4px' }} />
                              还剩 {daysLeft} 天
                            </Tag>
                          )}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#616161' }}>阅读进度</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#81C784' }}>
                              {plan.progress}%
                            </span>
                          </div>
                          <Progress
                            percent={plan.progress}
                            strokeColor={{
                              '0%': '#C8E6C9',
                              '100%': '#81C784'
                            }}
                            size={8}
                            trailColor="#F0F0F0"
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          <div>
                            <span style={{ fontSize: '13px', color: '#9E9E9E' }}>每日目标</span>
                            <p style={{ fontSize: '15px', fontWeight: '500', color: '#424242', margin: '4px 0 0 0' }}>
                              {plan.dailyGoal} {plan.goalUnit === 'pages' ? '页' : '分钟'}
                            </p>
                          </div>
                          <div>
                            <span style={{ fontSize: '13px', color: '#9E9E9E' }}>开始日期</span>
                            <p style={{ fontSize: '15px', fontWeight: '500', color: '#424242', margin: '4px 0 0 0' }}>
                              {new Date(plan.startDate).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                          <div>
                            <span style={{ fontSize: '13px', color: '#9E9E9E' }}>截止日期</span>
                            <p style={{ fontSize: '15px', fontWeight: '500', color: '#424242', margin: '4px 0 0 0' }}>
                              {new Date(plan.endDate).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => handleEditPlan(plan)}
                          style={{ borderRadius: '10px' }}
                        >
                          编辑
                        </Button>
                        {plan.status === 'active' && (
                          <Button
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleCompletePlan(plan.id)}
                            style={{ borderRadius: '10px', borderColor: '#81C784', color: '#81C784' }}
                          >
                            标记完成
                          </Button>
                        )}
                        <Popconfirm
                          title="确定删除这个阅读计划吗？"
                          onConfirm={() => handleDeletePlan(plan.id)}
                          okText="确定"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            style={{ borderRadius: '10px' }}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        title={editingPlan ? '编辑阅读计划' : '新建阅读计划'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        style={{ top: '10%' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ padding: '8px 0' }}
        >
          <Form.Item
            label="选择书籍"
            name="bookId"
            rules={[{ required: true, message: '请选择书籍' }]}
          >
            <Select
              placeholder="请选择一本书"
              options={books.map(book => ({
                value: book.id,
                label: (
                  <div>
                    <div style={{ fontWeight: '500', color: '#424242' }}>{book.title}</div>
                    <div style={{ fontSize: '12px', color: '#9E9E9E' }}>{book.author}</div>
                  </div>
                )
              }))}
              style={{ borderRadius: '10px' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Form.Item
              label="开始日期"
              name="startDate"
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%', borderRadius: '10px' }} />
            </Form.Item>

            <Form.Item
              label="截止日期"
              name="endDate"
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%', borderRadius: '10px' }} />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Form.Item
              label="每日目标"
              name="dailyGoal"
              initialValue={20}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={1}
                style={{ width: '100%', borderRadius: '10px' }}
              />
            </Form.Item>

            <Form.Item
              label="目标单位"
              name="goalUnit"
              initialValue="pages"
              style={{ flex: 1 }}
            >
              <Select
                options={[
                  { value: 'pages', label: '页' },
                  { value: 'minutes', label: '分钟' }
                ]}
                style={{ width: '100%', borderRadius: '10px' }}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="当前进度 (%)"
            name="progress"
            initialValue={0}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%', borderRadius: '10px' }}
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              style={{ flex: 1, borderRadius: '10px', height: '44px' }}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                flex: 1,
                borderRadius: '10px',
                height: '44px',
                background: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
                border: 'none'
              }}
            >
              保存
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ReadingPlansPage;
