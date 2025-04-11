import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link } from 'react-router-dom';
import Notifications from './Notifications';

const { Header, Content } = Layout;

const AppLayout = ({ children }) => {
    return (
        <Layout>
            <Header 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0 24px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Menu 
                        theme="dark" 
                        mode="horizontal" 
                        defaultSelectedKeys={['1']}
                        style={{ lineHeight: '64px' }}
                    >
                        <Menu.Item key="1">
                            <Link to="/">Главная</Link>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Link to="/teams">Команды</Link>
                        </Menu.Item>
                    </Menu>
                </div>
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Notifications />
                    <Button type="primary">
                        <Link to="/profile">Профиль</Link>
                    </Button>
                </div>
            </Header>
            <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
                {children}
            </Content>
        </Layout>
    );
};

export default AppLayout; 