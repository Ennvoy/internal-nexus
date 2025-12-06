import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { configApi } from './api';

interface ConfigState {
  featureCategories: string[];
  featureAudiences: string[];
  linkCategories: string[];
  updateFeatureCategories: (list: string[]) => void;
  updateFeatureAudiences: (list: string[]) => void;
  updateLinkCategories: (list: string[]) => void;
}

const ConfigContext = createContext<ConfigState | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const fallbackCategories = ['Automation', 'Customer Service', 'Admin Workflow', 'Data Analytics', 'Integration'];
  const fallbackAudiences = ['Finance', 'Operations', 'Sales', 'IT', 'Partnerships', 'HR'];
  const fallbackLinkCategories = ['Dashboards', 'Customer Service', 'Admin', 'Data', 'External Portal', 'Assets'];

  const [featureCategories, setFeatureCategories] = useState<string[]>(fallbackCategories);
  const [featureAudiences, setFeatureAudiences] = useState<string[]>(fallbackAudiences);
  const [linkCategories, setLinkCategories] = useState<string[]>(fallbackLinkCategories);

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, auds, links] = await Promise.all([
          configApi.getFeatureCategories(),
          configApi.getFeatureAudiences(),
          configApi.getLinkCategories(),
        ]);
        setFeatureCategories(Array.isArray(cats) && cats.length ? cats : fallbackCategories);
        setFeatureAudiences(Array.isArray(auds) && auds.length ? auds : fallbackAudiences);
        setLinkCategories(Array.isArray(links) && links.length ? links : fallbackLinkCategories);
      } catch (e) {
        setFeatureCategories(fallbackCategories);
        setFeatureAudiences(fallbackAudiences);
        setLinkCategories(fallbackLinkCategories);
      }
    };
    load();
  }, []);

  const updateFeatureCategories = async (list: string[]) => {
    setFeatureCategories(list);
    try { await configApi.updateFeatureCategories(list); } catch (e) { /* ignore */ }
  };

  const updateFeatureAudiences = async (list: string[]) => {
    setFeatureAudiences(list);
    try { await configApi.updateFeatureAudiences(list); } catch (e) { /* ignore */ }
  };

  const updateLinkCategories = async (list: string[]) => {
    setLinkCategories(list);
    try { await configApi.updateLinkCategories(list); } catch (e) { /* ignore */ }
  };

  return (
    <ConfigContext.Provider value={{
      featureCategories,
      featureAudiences,
      linkCategories,
      updateFeatureCategories,
      updateFeatureAudiences,
      updateLinkCategories
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
