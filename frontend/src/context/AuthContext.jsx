// ========================================================================
// MODULE 2: React — Context API (State Management like Redux, but simpler)
// ========================================================================
// Topics: State, Props, Custom Hooks, Controlled Components, Async/Await,
//         Authentication and Authorization
// ========================================================================

import { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // Axios = library for making HTTP requests (like Ajax)

// --- CREATE CONTEXT ---
// Context = a way to share data (state) across ALL components
// Without context, you'd need to pass props down every level ("prop drilling")
const AuthContext = createContext();

// --- PROVIDER COMPONENT ---
// Wraps the entire app. Any child component can access the auth state.
// "children" is a special PROP — it represents whatever is inside <AuthProvider>...</AuthProvider>
export const AuthProvider = ({ children }) => {

    // --- STATE (using useState hook) ---
    // useState returns [currentValue, setterFunction]
    // State change → React RE-RENDERS the component automatically
    const [user, setUser] = useState(null);       // null = not logged in
    const [loading, setLoading] = useState(true);  // true while checking localStorage

    // --- useEffect HOOK: runs ONCE when component mounts (empty [] dependency) ---
    // Checks if user info was saved in localStorage (persists across page refreshes)
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo); // restore login state
        }
        setLoading(false);
    }, []); // [] = run only once on mount

    // --- LOGIN function (Async/Await + Ajax via Axios) ---
    // Sends POST request to backend, receives JWT token
    const login = async (email, password) => {
        // axios.post() = sends HTTP POST request (Ajax call)
        // import.meta.env.VITE_API_URL = environment variable from .env file
        const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/login`,
            { email, password }  // request body (JSON)
        );
        setUser(data);                                    // update state → triggers re-render
        localStorage.setItem('userInfo', JSON.stringify(data)); // persist to localStorage
    };

    // --- REGISTER function ---
    const register = async (name, email, password, role) => {
        const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/register`,
            { name, email, password, role }
        );
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
    };

    // --- LOGOUT function ---
    const logout = () => {
        localStorage.removeItem('userInfo');  // clear stored data
        setUser(null);                        // set state to null → triggers re-render
    };

    // --- PROVIDER: makes these values available to all child components ---
    // value={{ ... }} = the PROPS that any child can access via useContext()
    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
