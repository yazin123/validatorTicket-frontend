import React, { useState, createContext, useContext } from 'react';


const TabsContext = createContext();

export function Tabs({ value, onValueChange, children, className = '' }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={`tabs ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div className={`inline-flex rounded-md bg-muted p-1 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '' }) {
  const context = useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-primary'} ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const context = useContext(TabsContext);

  if (context.value !== value) return null;

  return <div className={className}>{children}</div>;
}
