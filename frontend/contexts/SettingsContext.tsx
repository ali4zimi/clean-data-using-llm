"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppSettings {
  defaultAiProvider: 'openai' | 'google';
  defaultApiKey: string;
  autoSaveEnabled: boolean;
  maxFileSize: string;
  defaultPromptTemplate: string;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  loadSettings: () => void;
  saveSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  defaultAiProvider: 'openai',
  defaultApiKey: '',
  autoSaveEnabled: true,
  maxFileSize: '10',
  defaultPromptTemplate: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const saveSettings = async (): Promise<void> => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const value = {
    settings,
    updateSettings,
    loadSettings,
    saveSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
