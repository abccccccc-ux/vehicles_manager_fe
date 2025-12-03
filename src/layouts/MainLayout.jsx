import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Layout } from 'antd';

const { Content, Sider } = Layout;


const MainLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Sidebar nằm bên trái - đặt cố định để luôn hiển thị khi cuộn */}
      <Sider
        width={265}
        theme="light"
        collapsible
        breakpoint="lg"
        collapsedWidth={0}
        style={{
          background: '#fff',
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          overflow: 'auto',
          zIndex: 1000,
        }}
      >
        <Sidebar />
      </Sider>

      {/* Nội dung - thêm marginLeft bằng chiều rộng Sider để tránh chồng lấp */}
      <Layout className="main-layout" style={{ minHeight: '100vh' }}>
        {/* Navbar Header */}
        <Navbar />

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
