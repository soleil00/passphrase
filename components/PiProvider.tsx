
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useAppDispatch } from "@/redux/hooks";
import { getUserInfo, initializePiSDK } from "@/redux/slices/auth";

export function PiNetworkProvider({ children }: { children: React.ReactNode }) {
  const [isPiLoaded, setIsPiLoaded] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      dispatch(initializePiSDK());
      const token = localStorage.getItem('token');
      if (token) {
        dispatch(getUserInfo());
      }
    }
  }, [dispatch]);

  return (
    <>
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        onLoad={() => {
          console.log("Pi Network SDK loaded");
          setIsPiLoaded(true);
        }}
      />
      {children}
    </>
  );
}
