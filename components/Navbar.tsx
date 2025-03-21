/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UserButton } from '@clerk/nextjs';
import { Bell, Layers } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth, useUser } from "@clerk/nextjs";
import { getNotificationDays } from '@/utils/dateUtils';

interface Notification {
  id: string;
  clientName?: string;
  daysRemaining?: number;
  message?: string;
  link?: string;
}

const Navbar = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hideBadge, setHideBadge] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!email) return;

      try {
        const token = await getToken();

        // Fetch submission notifications
        const clientResponse = await fetch('/api/client', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!clientResponse.ok) throw new Error('Failed to fetch clients');
        const clients = await clientResponse.json();
        const submissionNotifications = clients
          .map((client: any) => {
            const days = getNotificationDays(client.dateFinSoumission);
            if (days !== null) {
              return {
                id: `${client.id}-${client.dateFinSoumission}`,
                clientName: client.name || 'Unknown',
                daysRemaining: days,
                link: 'https://mstailors.vercel.app/client',
              };
            }
            return null;
          })
          .filter((notification: Notification | null) => notification !== null) as Notification[];

        // Fetch manque notifications
        const manqueResponse = await fetch(`/api/liste-manque?email=${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!manqueResponse.ok) throw new Error('Failed to fetch liste-manque');
        const manqueData = await manqueResponse.json();

        const manqueNotifications: Notification[] = [];

        // DeclarationImport manque notifications
        manqueData.declarations?.forEach((declaration: any) => {
          declaration.models.forEach((model: any) => {
            model.accessories.forEach((acc: any) => {
              if (acc.quantity_manque < 0) {
                manqueNotifications.push({
                  id: `manque-declaration-${declaration.id}-${model.id}-${acc.id}`,
                  message: `Manque d'accessoire ${acc.reference_accessoire} (${acc.quantity_manque}) pour ${model.name} (Client: ${declaration.client})`,
                  link: 'https://mstailors.vercel.app/liste-manque',
                });
              }
            });
          });
        });

        // LivraisonEntree manque notifications
        manqueData.livraisons?.forEach((livraison: any) => {
          livraison.models.forEach((model: any) => {
            const manque = (model.quantityTrouvee || 0) - (model.quantityReçu || 0);
            if (manque < 0) {
              manqueNotifications.push({
                id: `manque-livraison-${livraison.id}-${model.id}`,
                message: `Manque de ${model.name} (${manque}) pour ${livraison.clientName || livraison.client?.name || 'Unknown'}`,
                link: 'https://mstailors.vercel.app/liste-manque',
              });
            }
          });
        });

        // Combine notifications
        const combinedNotifications = [...submissionNotifications, ...manqueNotifications];
        console.log('Combined notifications:', combinedNotifications);
        setNotifications(combinedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const checkAndResetNotifications = () => {
      const today = new Date().toDateString();
      if (lastResetDate !== today) {
        console.log('Resetting notifications for new day:', today);
        setNotifications([]);
        setLastResetDate(today);
      }
    };

    fetchNotifications();
    checkAndResetNotifications();

    const fetchInterval = setInterval(fetchNotifications, 120000);
    const resetInterval = setInterval(checkAndResetNotifications, 120000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(resetInterval);
    };
  }, [getToken, email]);

  const handleBellClick = () => {
    setIsDropdownOpen(prev => !prev);
    if (!isDropdownOpen) {
      setHideBadge(true);
      if (timeoutId) clearTimeout(timeoutId);
      const newTimeout = setTimeout(() => {
        setHideBadge(false);
        console.log('Badge reappears after 2 minutes');
        setTimeoutId(null);
      }, 120000);
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
        <div className='flex gap-4 items-center'>
          <div className="relative">
            <button 
              className="relative focus:outline-none"
              onClick={handleBellClick}
            >
              <Bell className='mr-6 mt-2'/>
              {!hideBadge && notifications.length > 0 && (
                <span className="absolute -top-1 left-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
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
                        {notification.message ? (
                          <Link href={notification.link || '#'} className="block">
                            {notification.message}
                          </Link>
                        ) : (
                          <Link href={notification.link || '#'} className="block">
                            {notification.daysRemaining === 0 ? (
                              <>Soumission of <span className="font-bold">{notification.clientName}</span> {"termine aujourd'hui"}</>
                            ) : (
                              <>Soumission of <span className="font-bold">{notification.clientName}</span> sera terminé en {notification.daysRemaining} jours</>
                            )}
                          </Link>
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
};

export default Navbar;