import React from 'react';
import Sidebar from '../components/Sidebar';
import { Layout } from 'antd';

const { Content, Sider } = Layout;


const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Sidebar nằm bên trái */}
      <Sider
        width={200}
        theme="light"
        style={{ background: '#fff' }}
      >
        <Sidebar />
      </Sider>

      {/* Nội dung */}
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: 24, height: '100%' }}>
          <div style={{ minHeight: '100%', height: '100%', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', background: '#fff', padding: 24 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
