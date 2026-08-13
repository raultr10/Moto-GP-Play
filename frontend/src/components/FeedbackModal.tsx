import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

//Los tipos de mensaje
export type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackModalProps {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
  onConfirm?: () => void;
  cancelButtonText?: string;
  confirmButtonText?: string;
}

export const FeedbackModal = ({
  visible,
  type,
  title,
  message,
  onClose,
  buttonText = "Aceptar",
  onConfirm,
  cancelButtonText = "Cancelar",
  confirmButtonText = "Confirmar"
}: FeedbackModalProps) => {

  //Configuramos los colores e iconos según el tipo de mensaje
  const getModalConfig = () => {
    switch (type) {
      case 'success':
        return { icon: 'check-circle', color: '#538d4e' }; 
      case 'error':
        return { icon: 'close-circle', color: '#E10600' };
      case 'warning':
        return { icon: 'alert', color: '#b59f3b' };
      case 'info':
      default:
        return { icon: 'information', color: '#4DD0E1' };
    }
  };

  const config = getModalConfig();

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={config.icon as any} size={50} color={config.color} />
          </View>

          <Text style={[styles.title, { color: config.color }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {onConfirm ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton, { flex: 1}]}>
                <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  onConfirm();
                  onClose();
                }} 
                style={[styles.button, { backgroundColor: config.color, flex: 1 }]}
              >
                <Text style={styles.confirmButtonText}>{confirmButtonText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: config.color, width: '100%' }]}>
              <Text style={styles.confirmButtonText}>{buttonText}</Text>
            </TouchableOpacity>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Fondo oscuro semitransparente
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#1E1E26', // Color de las casillas de tu juego
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F4E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  message: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#888899',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});