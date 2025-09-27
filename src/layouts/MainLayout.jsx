import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Layout } from 'antd';

const { Content, Sider } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen bg-gray-100">
      {/* Sidebar nằm bên trái */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={200}
        collapsedWidth={64}   // Khi collapse chỉ hiển thị icon
        theme="light"
        style={{ background: '#fff' }}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>

      {/* Nội dung */}
      <Layout>
        <Content className="p-6">
          <div className="min-h-screen rounded-xl p-6 shadow-sm bg-white">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
