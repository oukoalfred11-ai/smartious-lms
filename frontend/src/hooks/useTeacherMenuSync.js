/**
 * PHASE 4: Real-Time Menu Synchronization with WebSocket
 * Listens for TEACHER_CREATED events and updates the teacher menu without page reload
 */

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useTeacherMenuSync() {
  const [socket, setSocket] = useState(null);
  const [newTeachers, setNewTeachers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Socket.io connection
    const socketInstance = io(
      import.meta.env.VITE_API_URL || 'http://localhost:5000',
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      }
    );

    // Connection established
    socketInstance.on('connect', () => {
      console.log('✓ Connected to real-time server');
      setIsConnected(true);
      
      // Join admin channel if needed
      const adminId = localStorage.getItem('adminId');
      if (adminId) {
        socketInstance.emit('join-admin', adminId);
      }
    });

    // Listen for TEACHER_CREATED events (PHASE 4)
    socketInstance.on('TEACHER_CREATED', (data) => {
      console.log('✓ New teacher created (real-time):', data.teacher);
      
      // Add to new teachers list
      setNewTeachers(prev => [data.teacher, ...prev]);
      
      // Show notification
      if (window.showNotification) {
        window.showNotification({
          type: 'success',
          title: 'Teacher Added',
          message: `${data.teacher.firstName} ${data.teacher.lastName} has been added to the system`,
          duration: 5000
        });
      }
    });

    // Connection lost
    socketInstance.on('disconnect', () => {
      console.log('✗ Disconnected from real-time server');
      setIsConnected(false);
    });

    // Error handling
    socketInstance.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return {
    socket,
    isConnected,
    newTeachers,
    clearNewTeachers: () => setNewTeachers([])
  };
}

// Hook to prepend new teachers to the list
export function useTeacherListSync() {
  const [teachers, setTeachers] = useState([]);
  const { newTeachers, clearNewTeachers } = useTeacherMenuSync();

  useEffect(() => {
    if (newTeachers.length > 0) {
      // Prepend new teachers to the existing list
      setTeachers(prev => {
        // Avoid duplicates
        const existingIds = new Set(prev.map(t => t._id));
        const filteredNew = newTeachers.filter(t => !existingIds.has(t._id));
        return [...filteredNew, ...prev];
      });
      clearNewTeachers();
    }
  }, [newTeachers, clearNewTeachers]);

  return { teachers, setTeachers };
}

