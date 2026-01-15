'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppDispatch } from '@/redux/hook';
import { logoutAllSessions } from '@/redux/actions/userActions';
import { oauthConfig, endpoints } from "@/config";

interface UserSession {
    userId: string;
    email: string;
    name: string;
    picture?: string;
    accessToken: string;
}

interface AccountSwitcherProps {
    currentUser: {
        name: string;
        email?: string;
        picture?: string;
    };
}

export default function AccountSwitcher({ currentUser }: AccountSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Fetch all sessions when dropdown opens
    useEffect(() => {
        if (isOpen && sessions.length === 0) {
            fetchSessions();
        }
    }, [isOpen]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_FITMAIL_API_URL || 'https://api.fitmail.com'}/v1/oauth/sessions`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSessions(data.sessions || []);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const switchAccount = async (session: UserSession) => {
        try {
            // Store new token
            localStorage.setItem('accessToken', session.accessToken);
            localStorage.setItem('user', JSON.stringify({
                _id: session.userId,
                name: session.name,
                nick: session.name,
                email: session.email,
                picture: session.picture
            }));

            // Reload page to reflect changes
            window.location.reload();
        } catch (error) {
            console.error('Failed to switch account:', error);
        }
    };

    const handleAddAccount = () => {
        const state = Math.random().toString(36).substring(7);
        localStorage.setItem('oauth_state', state);
        const authUrl = `${endpoints.oauth.authorize}?client_id=${oauthConfig.clientId}&redirect_uri=${encodeURIComponent(oauthConfig.redirectUri)}&response_type=code&scope=${encodeURIComponent(oauthConfig.scope)}&state=${state}`;

        // Calculate popup position (centered)
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        window.open(
            authUrl,
            "FitmailAuth",
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );
    };

    const handleLogoutAll = async () => {
        if (confirm('Tüm oturumlarınızı kapatmak istediğinize emin misiniz?')) {
            try {
                await dispatch(logoutAllSessions()).unwrap();
                window.location.reload();
            } catch (error) {
                console.error('Logout all failed:', error);
                alert('Çıkış yapılırken bir hata oluştu');
            }
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
                {currentUser.picture ? (
                    <img
                        src={currentUser.picture}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-white">
                        {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 lg:left-auto lg:right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Current User */}
                    <div className="p-4 text-center">
                        <div className="flex justify-center mb-3">
                            {currentUser.picture ? (
                                <img
                                    src={currentUser.picture}
                                    alt={currentUser.name}
                                    className="w-16 h-16 rounded-full border-4 border-purple-100 object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-purple-100">
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="font-medium text-gray-900 text-sm mb-1">
                            Merhaba, {currentUser.name}!
                        </div>
                        {currentUser.email && (
                            <div className="text-xs text-gray-600 mb-3">{currentUser.email}</div>
                        )}
                        <a
                            href="https://account.fitmail.com"
                            className="inline-block px-4 py-2 border border-purple-600 text-purple-600 rounded-full hover:bg-purple-50 transition-colors text-xs font-medium"
                        >
                            Fitmail Hesabınızı yönetin
                        </a>
                    </div>

                    {/* Other Accounts */}
                    {loading ? (
                        <div className="px-4 py-3 border-t border-gray-100">
                            <div className="text-center text-gray-500 text-xs">Yükleniyor...</div>
                        </div>
                    ) : sessions.length > 0 && (
                        <div className="border-t border-gray-100">
                            <div className="px-4 py-2 text-xs font-medium text-gray-500">
                                Diğer Hesaplar
                            </div>
                            {sessions.map((session) => (
                                <button
                                    key={session.userId}
                                    onClick={() => switchAccount(session)}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                >
                                    {session.picture ? (
                                        <img
                                            src={session.picture}
                                            alt={session.name}
                                            className="w-9 h-9 rounded-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold text-sm">
                                            {session.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-gray-900 text-sm">{session.name}</div>
                                        <div className="text-xs text-gray-600">{session.email}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Add Account & Logout All */}
                    <div className="border-t border-gray-100">
                        <button
                            onClick={handleAddAccount}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <span className="text-xl text-purple-600">+</span>
                            <span className="font-medium text-gray-900 text-sm">Başka bir hesap ekle</span>
                        </button>
                        <button
                            onClick={handleLogoutAll}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-100 text-red-600"
                        >
                            <span className="text-lg">→</span>
                            <span className="font-medium text-sm">Tüm hesapların oturumlarını kapatın</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
