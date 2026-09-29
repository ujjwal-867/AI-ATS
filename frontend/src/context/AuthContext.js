"use client";

import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  login as loginService,
  logout as logoutService,
  getCurrentUser,
} from "@/services/auth.service";


export const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    let mounted = true;


    const loadUser = () => {

      const currentUser = getCurrentUser();


      if (mounted) {

        setUser(
          currentUser || null
        );

        setLoading(false);

      }

    };


    loadUser();


    return () => {

      mounted = false;

    };

  }, []);



  async function login(credentials) {

    const response = await loginService(
      credentials
    );


    setUser(
      response.user
    );


    return response;

  }



  function logout() {

    logoutService();

    setUser(null);

  }



  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}