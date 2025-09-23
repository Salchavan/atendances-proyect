import { useNavigate } from 'react-router';

export const changePageTitle = (title: string) => {
  document.title = `${title}`;
};

// Custom hook to obtain a navigate function for use inside components
export type NavigateToFn = (to: string | number, options?: any) => void;

export const useNavigateTo = () => {
  const navigate = useNavigate();
  return (path: string) => navigate(path);
};
