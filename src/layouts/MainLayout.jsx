import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Layout } from 'antd';

const { Content, Sider } = Layout;


const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const SIDEBAR_WIDTH = 265;
  const SIDEBAR_COLLAPSED_WIDTH = 80;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f3f4f6', paddingTop: 48 }}>
      <Sider
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        style={{
          background: '#fff',
          overflow: 'auto',
        }}
      >
        <Sidebar />
      </Sider>

      <Layout className="main-layout" style={{ minHeight: '100vh' }}>
        <Navbar />

        <Content style={{ padding: 24, height: '100%' }}>
          <div style={{ minHeight: '100%', height: '100%', borderRadius: 8, background: '#fff', padding: 24 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
