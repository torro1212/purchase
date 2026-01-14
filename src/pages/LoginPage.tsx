import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FileText, LogIn } from 'lucide-react';

export default function LoginPage() {
    const { user, signInWithGoogle } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        try {
            setIsLoggingIn(true);
            setError(null);
            await signInWithGoogle();
        } catch (err: any) {
            console.error(err);
            if (err?.code === 'auth/popup-blocked') {
                setError('החלון הקופץ נחסם. אנא אפשר חלונות קופצים ונסה שוב.');
            } else if (err?.code === 'auth/popup-closed-by-user') {
                setError('ההתחברות בוטלה.');
            } else if (err?.code === 'auth/unauthorized-domain') {
                setError('הדומיין הנוכחי אינו מורשה. יש להוסיף אותו ב-Firebase Console.');
            } else {
                setError('אירעה שגיאה בהתחברות. נסה שוב מאוחר יותר.');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'var(--color-bg-subtle)',
            padding: '2rem'
        }}>
            <div className="card" style={{
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                padding: '3rem 2rem'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--color-accent-primary)',
                        color: 'white',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}>
                        <FileText size={32} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>מערכת הזמנות רכש</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>אנא התחבר כדי להמשיך</p>
                </div>

                {error && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: 'var(--color-error-bg)',
                        color: 'var(--color-error)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        fontSize: '16px',
                        padding: '12px',
                        marginTop: '1rem',
                        opacity: isLoggingIn ? 0.7 : 1
                    }}
                >
                    {isLoggingIn ? (
                        <span>מתחבר...</span>
                    ) : (
                        <>
                            <LogIn size={20} style={{ marginLeft: '8px' }} />
                            התחבר באמצעות Google
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
