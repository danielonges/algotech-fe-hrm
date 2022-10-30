import React from 'react';
import '../styles/pages/login.scss';
import '../styles/common/common.scss';
import AuthContext from '../context/auth/authContext';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Form,
  Image,
  Input,
  Layout,
  Space,
  Spin
} from 'antd';
import { Typography as AntTypography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import TimeoutAlert, { AlertType } from '../components/common/TimeoutAlert';
import ForgetPasswordModal from '../components/account/ForgetPasswordModal';
import themeContext from 'src/context/theme/themeContext';

const { Title } = AntTypography;

const { Content } = Layout;

export interface UserInput {
  email: string;
  password: string;
}

const Login = () => {
  const authContext = React.useContext(AuthContext);
  const { login, clearErrors, toggleRmbMe, isAuthenticated, rmbMe, error } =
    authContext;
  const { isDarkMode } = React.useContext(themeContext);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    } else if (!isAuthenticated && error) {
      setLoading(false);
    }
  }, [isAuthenticated, error, navigate, clearErrors]);

  const [loading, setLoading] = React.useState<boolean>(false);
  const [alert, setAlert] = React.useState<AlertType | null>(null);
  const [userInput, setUserInput] = React.useState<UserInput>({
    email: '',
    password: ''
  });
  const [openPasswordModal, setOpenPasswordModal] =
    React.useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUserInput((prev: UserInput) => {
      return { ...prev, [e.target.name]: e.target.value };
    });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = userInput;
    if (email === '' || password === '') {
      setAlert({
        type: 'warning',
        message: 'Email and password fields cannot be empty!'
      });
      return;
    } else {
      setLoading(true);
      login(userInput);
    }
  };

  return (
    <Content className={`login-content-${isDarkMode ? 'dark' : 'light'}`}>
      <ForgetPasswordModal
        openPasswordModal={openPasswordModal}
        handleClose={() => setOpenPasswordModal(false)}
      />
      <div className='login-container'>
        <div className='login-box'>
          <Image
            src={require('../resources/logo-brown.png')}
            width={250}
            preview={false}
          />
          <Title className='login-title'>The Kettle Gourmet HRM</Title>
          {alert && (
            <div className='login-alert'>
              <TimeoutAlert alert={alert} clearAlert={() => setAlert(null)} />
            </div>
          )}
          {error && (
            <div className='login-alert'>
              <TimeoutAlert
                alert={{
                  type: 'error',
                  message: error
                }}
                clearAlert={clearErrors}
              />
            </div>
          )}
          <Form
            name='basic'
            initialValues={{ remember: true }}
            autoComplete='off'
            requiredMark={false}
            size='large'
            style={{ width: '100%' }}
          >
            <Form.Item
              name='email'
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input
                name='email'
                placeholder='email'
                prefix={<UserOutlined />}
                onChange={handleChange}
              />
            </Form.Item>
            <Form.Item
              name='password'
              rules={[
                { required: true, message: 'Please input your password!' }
              ]}
            >
              <Input.Password
                name='password'
                placeholder='password'
                prefix={<LockOutlined />}
                onChange={handleChange}
              />
            </Form.Item>
            <div className='container-spaced-out'>
              <Form.Item name='remember' valuePropName='checked'>
                <Checkbox checked={rmbMe} onChange={() => toggleRmbMe()}>
                  Remember me
                </Checkbox>
              </Form.Item>
              <Space align='start'>
                <Button
                  type='link'
                  size='small'
                  onClick={() => setOpenPasswordModal(true)}
                >
                  Forgot password
                </Button>
              </Space>
            </div>
            <Form.Item>
              {loading ? (
                <Spin
                  size='large'
                  style={{ display: 'flex', justifyContent: 'center' }}
                />
              ) : (
                <Button
                  type='primary'
                  htmlType='submit'
                  className='login-btn'
                  onClick={handleLogin}
                >
                  Login
                </Button>
              )}
            </Form.Item>
          </Form>
        </div>
      </div>
    </Content>
  );
};

export default Login;
