import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { store } from './store'
import { useAppDispatch, useAppSelector } from './hooks'
import { setUser, setLoading } from '../features/auth/authSlice'
import { authClient } from '../shared/lib/auth-client'
import { setAuthToken } from '../shared/lib/socket'

function ThemeApplier({ children }: { children: React.ReactNode }) {
    const theme = useAppSelector((s) => s.theme.theme)
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
    }, [theme])
    return <>{children}</>
}

function ToasterWithTheme() {
    const theme = useAppSelector((s) => s.theme.theme)
    return <Toaster richColors position="top-right" theme={theme === "light" ? "light" : "dark"} />
}

function AuthGate({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch()
    useEffect(() => {
        let cancelled = false
        authClient.getSession().then(({ data }) => {
            if (cancelled) return
            if (data) {
                setAuthToken(data.session.token)
                dispatch(setUser(data.user))
            }
            dispatch(setLoading(false))
        }).catch(() => {
            dispatch(setLoading(false))
        })
        return () => { cancelled = true }
    }, [dispatch])
    return <>{children}</>
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <ThemeApplier>
                <AuthGate>
                    {children}
                    <ToasterWithTheme />
                </AuthGate>
            </ThemeApplier>
        </Provider>
    )
}
