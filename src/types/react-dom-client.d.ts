declare module 'react-dom/client' {
  export * from 'react-dom';
  export function createRoot(container: Element | DocumentFragment): any;
}
