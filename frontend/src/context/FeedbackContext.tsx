import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FeedbackModal, FeedbackType } from '../components/FeedbackModal';

//Definimos los tipos de alerta
interface FeedbackContextType {
  showFeedback: (type: FeedbackType, title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => void;
}

//Sirve para poder usar el modal de manera mas sencilla en las pantallas
const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

//Este bloque nos servirá para que toda la aplicación pueda usar el modal
export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'info' as FeedbackType,
    title: '',
    message: '',
    onConfirm: undefined as (() => void) | undefined,
    confirmButtonText: undefined as string | undefined,
    cancelButtonText: undefined as string | undefined,
  });

  const showFeedback = useCallback((type: FeedbackType, title: string, message: string) => {
    setModalConfig({ type, title, message, onConfirm: undefined, confirmButtonText: undefined, cancelButtonText: undefined });
    setVisible(true);
  }, []);

  const showError = useCallback((title: string, message: string) => showFeedback('error', title, message), [showFeedback]);
  const showSuccess = useCallback((title: string, message: string) => showFeedback('success', title, message), [showFeedback]);
  const showInfo = useCallback((title: string, message: string) => showFeedback('info', title, message), [showFeedback]);
  
  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => {
    setModalConfig({
      type: 'warning',
      title,
      message,
      onConfirm,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText
    });
    setVisible(true);
  }, []);

  const closeFeedback = () => setVisible(false);

  return (
    <FeedbackContext.Provider value={{ showFeedback, showError, showSuccess, showInfo, showConfirm }}>
      {children}
      <FeedbackModal
        visible={visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={closeFeedback}
        onConfirm={modalConfig.onConfirm}
        confirmButtonText={modalConfig.confirmButtonText}
        cancelButtonText={modalConfig.cancelButtonText}
      />
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useFeedback debe usarse dentro de un FeedbackProvider");
  return context;
};