import { useCallback, useEffect, useState } from 'react';

/**
 * Command Palette의 열림/닫힘 상태를 관리하고
 * Cmd+P (Mac) / Ctrl+P (Windows/Linux) 단축키를 처리하는 훅
 */
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+P (Mac) 또는 Ctrl+P (Windows/Linux)
      if (
        !e.isComposing &&
        !e.altKey &&
        !e.shiftKey &&
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'p'
      ) {
        const hasOpenDialog = document.querySelector('.modal-open') !== null;
        if (!isOpen && hasOpenDialog) return;

        e.preventDefault(); // 브라우저 기본 동작(인쇄) 방지
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggle]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
