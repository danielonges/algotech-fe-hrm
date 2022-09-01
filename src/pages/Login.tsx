import React from 'react';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField
} from '@mui/material';
import '../styles/pages/login.scss';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import AuthContext from 'src/context/auth/authContext';
import { useNavigate } from 'react-router-dom';

export interface UserInput {
  email: string;
  password: string;
}

const Login = () => {
  const authContext = React.useContext(AuthContext);
  const { login, clearErrors, isAuthenticated, error } = authContext;

  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    } else if (!isAuthenticated && error) {
      setLoading(false);
    }
  }, [isAuthenticated, error, navigate, clearErrors]);

  const [loading, setLoading] = React.useState<boolean>(false);
  const [userInput, setUserInput] = React.useState<UserInput>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setUserInput((prev: UserInput) => {
      return { ...prev, [e.target.name]: e.target.value };
    });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = userInput;
    if (email === '' || password === '') {
      // TODO: handle error case
    } else {
      setLoading(true);
      login(userInput);
    }
  };

  return (
    <div className='login'>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
        open={loading}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
      <Box className='logo-box'>
        <h1>The Kettle Gourmet</h1>
        <p>Human Resource Planning System</p>
      </Box>
      <Box className='login-box'>
        <form onSubmit={handleLogin} className='login-container'>
          <FormGroup>
            <h1>Login to Kettle Gourmet HRM</h1>
            <TextField
              required
              id='outlined-required'
              label='Email Address'
              name='email'
              onChange={handleChange}
            />
            <FormControl variant='outlined' style={{ margin: '2vh 0' }}>
              <InputLabel required htmlFor='outlined-adornment-password'>
                Password
              </InputLabel>
              <OutlinedInput
                required
                id='outlined-adornment-password'
                type={showPassword ? 'text' : 'password'}
                name='password'
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton
                      aria-label='toggle password visibility'
                      edge='end'
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label='Password'
              />
            </FormControl>
            {error && (
              <Alert severity='error' onClose={clearErrors}>
                {`Error: ${error}`}
              </Alert>
            )}
            {/* the checkbox does nothing; i just followed the wireframe first lols */}
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label='Stay signed in'
            />
            <div style={{ marginTop: '2vh' }}>
              <Button
                type='submit'
                variant='contained'
                className='login-btn'
                color='primary'
              >
                Login
              </Button>
            </div>
          </FormGroup>
        </form>
      </Box>
    </div>
  );
};

export default Login;
