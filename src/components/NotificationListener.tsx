"use client";

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import OfferPopup from '@/components/OfferPopup';

export default function NotificationListener() {
  const socket = useSocket();
  const [offer, setOffer] = useState<any>(null);

  useEffect(() => {
    if (socket) {
      socket.on('push_offer', (data: any) => {
        setOffer(data);
      });

      socket.on('hide_offer', () => {
        setOffer(null);
      });
    }

    return () => {
      socket?.off('push_offer');
      socket?.off('hide_offer');
    };
  }, [socket]);

  if (!offer) return null;

  return (
    <OfferPopup offer={offer} onClose={() => setOffer(null)} />
  );
}
