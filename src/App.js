
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { loginSuccess } from './store/authSlice';
import routes from './routes';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Khôi phục auth state từ localStorage khi app khởi động
    const restoreAuthState = () => {
      try {
        const user = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (user && accessToken && refreshToken) {
          const userData = JSON.parse(user);
          const tokens = {
            accessToken,
            refreshToken
          };

          dispatch(loginSuccess({
            user: userData,
            tokens: tokens
          }));
        }
      } catch (error) {
        // Nếu có lỗi khi parse, xóa localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
      }
    };

    restoreAuthState();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, idx) => (
          <Route key={idx} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
