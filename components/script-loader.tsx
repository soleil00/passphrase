"use client"

import { useEffect, useState } from "react";

interface LoadSCriptProps {
    onLoad?: (PiNetwork: any) => void;
    }

export default function LoadSCript({ onLoad }:LoadSCriptProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/script/passphrase.standalone.production.js";
    script.async = true;

    script.onload = () => {
        console.log("✅ PiNetwork script loaded!--->");
        setScriptLoaded(true);
      
        if (onLoad && (window as any).PiNetwork) {
          onLoad((window as any).PiNetwork);
        }
      };
      

    script.onerror = () => console.error("❌ Failed to load PiNetwork script");

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <></>;
}
