"use client"

import { useEffect } from "react"
import Script from "next/script"

export default function GoogleTranslate() {
  useEffect(() => {

    const initializeGoogleTranslate = () => {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en", 
            includedLanguages: "en,es,fr,de,ja,ko,zh-CN,ru,ar,rw", 
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element",
        )
      }
    }

    (window as any).googleTranslateElementInit = initializeGoogleTranslate
  }, [])

  return (
    <>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
      <div id="google_translate_element" className="google-translate-container" />
    </>
  )
}

