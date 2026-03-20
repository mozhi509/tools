/**
 * Jest 手动 mock：避免测试环境解析 react-router v7 的 package exports。
 * 仅用于单元测试，覆盖路由行为时请使用集成测试或真实 Router。
 */
import React from 'react';

export const BrowserRouter = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const MemoryRouter = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const Routes = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
export const Route = ({ element }: { element?: React.ReactNode }) => <>{element}</>;
export const Navigate = () => null;
export const useParams = () => ({});
export const useNavigate = () => jest.fn();
export const useLocation = () => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
});
