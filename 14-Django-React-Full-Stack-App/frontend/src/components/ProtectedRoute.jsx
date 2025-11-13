import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useEffect, useState, useCallback } from "react";
import PropTypes from 'prop-types';

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    const refreshToken = useCallback(async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });

            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.log(error);
            setIsAuthorized(false);
        }
    }, []);

    const auth = useCallback(async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }
        const decodedToken = jwtDecode(token);
        const tokenExpiration = decodedToken.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        }
        setIsAuthorized(true);
    }, [refreshToken]);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, [auth]);

    if (isAuthorized === null) {
        return <div>Loading...</div>
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired
};

export default ProtectedRoute;
