import React from 'react';
import { Button, Dropdown, Layout, Menu, Space } from 'antd';
import authContext from '../../context/auth/authContext';
import '../../styles/common/app.scss';
import '../../styles/common/common.scss';
import { UserOutlined } from '@ant-design/icons';
import { LOGIN_URL, MY_ACCOUNT_URL, ROOT_URL } from '../routes/routes';
import { Link } from 'react-router-dom';
import { useThemedClassName } from 'src/hooks/useThemedClassName';

const { Header } = Layout;

const AppHeader = () => {
  const { isAuthenticated, logout } = React.useContext(authContext);

  return (
    <Header className={useThemedClassName('app-header')}>
      <div className='container-spaced-out'>
        <Link to={ROOT_URL}>The Kettle Gourmet</Link>
        <Space size='middle'>
          {isAuthenticated && (
            <Dropdown
              placement='bottomRight'
              overlay={
                <Menu
                  mode='horizontal'
                  items={[
                    {
                      label: <Link to={MY_ACCOUNT_URL}>My Account</Link>,
                      key: MY_ACCOUNT_URL
                    },
                    {
                      label: <Link to={LOGIN_URL}>Logout</Link>,
                      key: 'Logout',
                      onClick: logout
                    }
                  ]}
                />
              }
            >
              <Button icon={<UserOutlined />} shape='circle' type='primary' />
            </Dropdown>
          )}
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader;
