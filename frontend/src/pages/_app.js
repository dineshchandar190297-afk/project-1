import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/api";

export default function App({ Component, pageProps }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            console.log("App: checking auth state...");
            const token = localStorage.getItem("token");
            const isAuthPage = router.pathname === "/login" || router.pathname === "/register";

            if (token) {
                if (!user) {
                    try {
                        const data = await authService.getCurrentUser();
                        console.log("App: user fetched", data.username);
                        setUser(data);
                    } catch (error) {
                        console.error("App: fetch user failed", error);
                        localStorage.removeItem("token");
                        if (!isAuthPage) {
                            router.push("/login");
                        }
                    }
                }
            } else {
                console.log("App: no token found");
                if (!isAuthPage) {
                    router.push("/login");
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [router.pathname]);

    return <Component {...pageProps} user={user} setUser={setUser} loading={loading} />;
}
