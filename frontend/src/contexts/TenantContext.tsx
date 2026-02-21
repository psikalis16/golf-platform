import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Tenant } from '../types';
import { fetchTenant } from '../api';

interface TenantContextValue {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  loading: true,
  error: null,
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch tenant data on app boot — drives the whole UI
    fetchTenant()
      .then((res) => setTenant(res.data))
      .catch(() => setError('Could not load course information.'))
      .finally(() => setLoading(false));
  }, []);

  // Apply tenant brand colors as CSS variables once loaded
  useEffect(() => {
    if (tenant?.colors) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', tenant.colors.primary);
      root.style.setProperty('--color-secondary', tenant.colors.secondary);
      root.style.setProperty('--color-accent', tenant.colors.accent);
    }
  }, [tenant]);

  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

// Convenience hook for consuming tenant data in any component
export const useTenant = () => useContext(TenantContext);
