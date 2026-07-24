"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: '#111111',
          color: '#fff',
          border: '1px solid #1f2937',
          borderRadius: '16px',
          fontWeight: 'bold',
        },
        success: {
          iconTheme: {
            primary: '#a855f7',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
