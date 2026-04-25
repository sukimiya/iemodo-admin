import { Card, Form, Input, InputNumber, Typography, Button, message } from 'antd';

const { Title } = Typography;

export default function SettingsPage() {
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('配置已保存（本地存储）');
  };

  return (
    <div>
      <Title level={4}>系统设置</Title>
      <Card title="API 配置" style={{ maxWidth: 600 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            apiUrl: localStorage.getItem('config_api_url') || 'http://localhost:8080',
            refreshInterval: localStorage.getItem('config_refresh_interval') || '30',
          }}
          onFinish={(values) => {
            localStorage.setItem('config_api_url', values.apiUrl);
            localStorage.setItem('config_refresh_interval', values.refreshInterval);
            handleSave();
          }}
        >
          <Form.Item label="API 地址" name="apiUrl">
            <Input placeholder="http://localhost:8080" />
          </Form.Item>
          <Form.Item label="刷新间隔（秒）" name="refreshInterval">
            <InputNumber min={5} max={300} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
