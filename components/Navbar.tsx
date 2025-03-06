/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Navbar.tsx
"use client"

import { UserButton } from '@clerk/nextjs'
import { Bell, Layers } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from "@clerk/nextjs";
import { getNotificationDays } from '@/utils/dateUtils';

interface Notification {
  id: string;
  clientName: string;
  daysRemaining: number;
}

const Navbar = () => {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hideBadge, setHideBadge] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null); // Corrected type
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/client', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch clients');
        const clients = await response.json();
        const newNotifications = clients
          .map((client: any) => {
            const days = getNotificationDays(client.dateFinSoumission);
            if (days !== null) {
              return {
                id: `${client.id}-${client.dateFinSoumission}`,
                clientName: client.name || 'Unknown',
                daysRemaining: days
              };
            }
            return null;
          })
          .filter((notification: Notification | null) => notification !== null) as Notification[];
        console.log('Fetched notifications:', newNotifications);
        setNotifications(newNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Check if it's a new day and reset if needed
    const checkAndResetNotifications = () => {
      const today = new Date().toDateString();
      if (lastResetDate !== today) {
        console.log('Resetting notifications for new day:', today);
        setNotifications([]); // Clear notifications
        setLastResetDate(today);
      }
    };

    fetchNotifications();
    checkAndResetNotifications();

    const fetchInterval = setInterval(fetchNotifications, 60000); // Refresh every minute
    const resetInterval = setInterval(checkAndResetNotifications, 60000); // Check every minute for new day

    return () => {
      clearInterval(fetchInterval);
      clearInterval(resetInterval);
    };
  }, [getToken]);

  const handleBellClick = () => {
    setIsDropdownOpen(prev => !prev);
    if (!isDropdownOpen) { // Only hide badge when opening dropdown
      setHideBadge(true);
      if (timeoutId) clearTimeout(timeoutId); // Clear existing timeout
      const newTimeout = setTimeout(() => {
        setHideBadge(false);
        console.log('Badge reappears after 2 minutes');
        setTimeoutId(null);
      }, 12000000); // 2 minutes
      setTimeoutId(newTimeout);
    }
  };

  return (
    <div className='border-b border-base-300 px-5 md:px-[10%] py-4'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center'>
          <div className='bg-accent-content text-accent rounded-full p-2'>
            <Layers className='h-6 w-6'/>
          </div>
          <span className='ml-3 font-bold text-2xl italic'>
            <Link href="/">MS <span className='text-accent'>Tailors</span></Link>  
          </span>
        </div>
        <div className='flex space-x-4 items-center'>
          <div className="relative">
            <button 
              className="relative focus:outline-none"
              onClick={handleBellClick}
            >
              <Bell className='mr-6'/>
              {!hideBadge && notifications.length > 0 && (
                <span className="absolute -top-2 left-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {notifications.length}
                </span>
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-2">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
  key={notification.id} 
  className="p-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 text-sm text-gray-700"
>
  {notification.daysRemaining === 0 
    ? (
      <>
        Soumission of <span className="font-bold">{notification.clientName}</span> termine aujourd&apos;hui
      </>
    ) 
    : (
      <>
        Soumission of <span className="font-bold">{notification.clientName}</span> sera terminé en {notification.daysRemaining} jours
      </>
    )}
</div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 text-sm">No notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <UserButton/>
        </div>
      </div>
    </div>
  );
}

export default Navbar