import { createContext, useContext } from 'react';
import useOnlineStatus from '../hooks/useOnlineStatus.js';

const NetworkContext = createContext({ isOnline: true });

/**
 * Makes the online/offline state available anywhere in the app so the
 * offline banner and "retry" behaviour stay consistent.
 */
export const NetworkProvider = ({ children }) => {
  const isOnline = useOnlineStatus();

  return <NetworkContext.Provider value={{ isOnline }}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => useContext(NetworkContext);