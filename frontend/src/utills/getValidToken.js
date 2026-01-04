const API_URL = import.meta.env.VITE_API_BASE_URL;

export const getValidToken = async () => {
  try {
    let token = localStorage.getItem("access_token");

    if (!token) {
      return null;
    }

    const res = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      return token;
    }

    if (res.status === 401 || res.status === 422) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        return null;
      }

      const refreshRes = await fetch(`${API_URL}/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      if (!refreshRes.ok) {
        const text = await refreshRes.text().catch(() => "<no body>");
        console.warn("[getValidToken] refresh failed", {
          status: refreshRes.status,
          body: text,
        });
        // cleanup invalid tokens
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return null;
      }

      const refreshData = await refreshRes.json();
      localStorage.setItem("access_token", refreshData.access_token);
      token = refreshData.access_token;
    }

    return token;
  } catch (err) {
    console.error("[getValidToken] error:", err);
    return null;
  }
};
