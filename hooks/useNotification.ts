import { useState, useEffect, useCallback } from 'react';

type User = {
    userName: string;
};

const useNotification = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && "Notification" in window) {
            setPermission(Notification.permission);
        } else {
            console.error("This browser does not support desktop notification");
        }
    }, []);

    const requestPermission = useCallback(async (): Promise<NotificationPermission | null> => {
        if (typeof window !== 'undefined' && "Notification" in window) {
            try {
                const permission = await Notification.requestPermission();
                setPermission(permission);
                return permission;
            } catch (error) {
                console.error("Error requesting notification permission", error);
                return null;
            }
        }
        return null;
    }, []);

    const playNotificationSound = () => {
        const audio = new Audio('/notification/notification-sound.wav');
        audio.play().catch(error => console.error("Error playing notification sound", error));
    };

    const sendNotification = useCallback(async (room: string, message: string, user: User) => {
        if (typeof window === 'undefined' || !("Notification" in window)) {
            console.error("This browser does not support desktop notification");
            return;
        }

        let currentPermission: NotificationPermission | null = permission;

        if (currentPermission === 'default') {
            currentPermission = await requestPermission();
        }

        if (currentPermission === "granted") {
            new Notification(`${user.userName} sent a message in room:${room}`, {
                body: message,
                icon: "/favicon.ico",
            });
            playNotificationSound();
        } else {
            console.error("Notification permission not granted");
        }
    }, [permission, requestPermission]);

    return { permission, sendNotification };
};

export default useNotification;
