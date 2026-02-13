'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface Notification {
    id: string
    message: string
    read: boolean
    created_at: string
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.read).length)
            }

            // Realtime subscription
            const channel = supabase
                .channel('notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        const newNotif = payload.new as Notification
                        setNotifications(prev => [newNotif, ...prev])
                        setUnreadCount(prev => prev + 1)
                        // Optional: Play sound
                        new Audio('/notification.mp3').play().catch(() => { })
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }

        fetchNotifications()
    }, [])

    const markAsRead = async () => {
        if (unreadCount === 0) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)

        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    return (
        <DropdownMenu onOpenChange={(open) => {
            if (open) markAsRead()
        }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                ) : (
                    notifications.map(notif => (
                        <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-3 cursor-default">
                            <span className={`text-sm ${!notif.read ? 'font-bold' : ''}`}>{notif.message}</span>
                            <span className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleTimeString()}</span>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
