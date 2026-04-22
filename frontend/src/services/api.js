export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const authApi = {
  login: async (data) => {
    // temporary mock
    return { token: "demo-token" };
  }
};