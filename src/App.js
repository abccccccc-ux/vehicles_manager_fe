
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import routes from './routes';

const App = () => (
  <BrowserRouter>
    <Routes>
      {routes.map((route, idx) => (
        <Route key={idx} path={route.path} element={route.element} />
      ))}
    </Routes>
  </BrowserRouter>
);

export default App;
