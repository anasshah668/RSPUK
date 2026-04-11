import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import NeonPreviewExitDialog from '../components/NeonPreviewExitDialog';

const NeonPreviewExitContext = createContext(null);

export function NeonPreviewExitProvider({ children }) {
  const [previewExitGuardActive, setPreviewExitGuardActive] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const pendingResolveRef = useRef(null);

  const finishDialog = useCallback((allowLeave) => {
    setExitDialogOpen(false);
    const resolve = pendingResolveRef.current;
    pendingResolveRef.current = null;
    resolve?.(allowLeave);
  }, []);

  const handleStay = useCallback(() => {
    finishDialog(false);
  }, [finishDialog]);

  const handleLeave = useCallback(() => {
    finishDialog(true);
  }, [finishDialog]);

  const confirmLeavePreview = useCallback(() => {
    if (!previewExitGuardActive) return Promise.resolve(true);
    return new Promise((resolve) => {
      pendingResolveRef.current = resolve;
      setExitDialogOpen(true);
    });
  }, [previewExitGuardActive]);

  const value = useMemo(
    () => ({
      previewExitGuardActive,
      setPreviewExitGuardActive,
      confirmLeavePreview,
    }),
    [previewExitGuardActive, confirmLeavePreview],
  );

  return (
    <NeonPreviewExitContext.Provider value={value}>
      {children}
      <NeonPreviewExitDialog open={exitDialogOpen} onStay={handleStay} onLeave={handleLeave} />
    </NeonPreviewExitContext.Provider>
  );
}

export function useNeonPreviewExit() {
  const ctx = useContext(NeonPreviewExitContext);
  if (!ctx) {
    return {
      previewExitGuardActive: false,
      setPreviewExitGuardActive: () => {},
      confirmLeavePreview: () => Promise.resolve(true),
    };
  }
  return ctx;
}
