
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice';
import { login as loginApi } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginApi(username, password);
      if (res.success) {
        // Lưu token vào localStorage
        localStorage.setItem('accessToken', res.data.tokens.accessToken);
        localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
        dispatch(loginSuccess(res.data));
        navigate('/dashboard');
      } else {
        setError(res.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Đăng nhập thất bại');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full mb-2 p-2 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <button
            className="w-full bg-blue-500 text-white p-2 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
