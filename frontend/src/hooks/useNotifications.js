// hooks/useNotifications.js — Polling hook for unread notifications
import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';

export default function useNotifications(patientId, pollInterval = 30000) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = useCallback(async () => {
    if (!patientId) return;
    try {
      const res = await notificationAPI.getUnread(patientId);
      const notifs = res.data?.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch { /* silent */ }
  }, [patientId]);

  useEffect(() => {
    fetch();
    const timer = setInterval(fetch, pollInterval);
    return () => clearInterval(timer);
  }, [fetch, pollInterval]);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    fetch();
  };

  const markAllRead = async () => {
    if (!patientId) return;
    await notificationAPI.markAllRead(patientId);
    fetch();
  };

  return { notifications, unreadCount, markRead, markAllRead, refresh: fetch };
}
