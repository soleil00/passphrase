// "use client"

// import { useEffect, useState } from "react"
// import Script from "next/script"
// import { Globe, ChevronDown } from "lucide-react"

// // Define supported languages
// const languages = [
//   { code: "", name: "Select Language" },
//   { code: "en", name: "English" },
//   { code: "es", name: "Spanish" },
//   { code: "fr", name: "French" },
//   { code: "de", name: "German" },
//   { code: "it", name: "Italian" },
//   { code: "pt", name: "Portuguese" },
//   { code: "ru", name: "Russian" },
//   { code: "ja", name: "Japanese" },
//   { code: "ko", name: "Korean" },
//   { code: "zh-CN", name: "Chinese (Simplified)" },
//   { code: "ar", name: "Arabic" },
// ]

// export default function CustomGoogleTranslate() {
//   const [isOpen, setIsOpen] = useState(false)
//   const [selectedLanguage, setSelectedLanguage] = useState("Select Language")
//   const [isScriptLoaded, setIsScriptLoaded] = useState(false)

//   // Initialize Google Translate
//   useEffect(() => {
//     // This function will be called by Google's script
//     window.googleTranslateElementInit = () => {
//       // Create a hidden Google Translate element
//       new window.google.translate.TranslateElement(
//         {
//           pageLanguage: "en",
//           autoDisplay: false,
//           includedLanguages: languages
//             .filter((lang) => lang.code)
//             .map((lang) => lang.code)
//             .join(","),
//         },
//         "google_translate_element",
//       )
//       setIsScriptLoaded(true)
//     }
//   }, [])

//   // Function to change language programmatically
//   const changeLanguage = (langCode: string) => {
//     if (!langCode || !isScriptLoaded) return

//     // Find the Google Translate select element and change its value
//     const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement
//     if (selectElement) {
//       selectElement.value = langCode
//       selectElement.dispatchEvent(new Event("change"))

//       // Update our UI state
//       const langName = languages.find((lang) => lang.code === langCode)?.name || "Select Language"
//       setSelectedLanguage(langName)
//     }

//     setIsOpen(false)
//   }

//   return (
//     <>
//       {/* Load Google Translate script */}
//       <Script
//         src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
//         strategy="afterInteractive"
//         onLoad={() => console.log("Google Translate script loaded")}
//       />

//       {/* Hidden Google Translate element */}
//       <div id="google_translate_element" className="hidden" />

//       {/* Custom language selector UI */}
//       <div className="relative">
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50"
//         >
//           <Globe className="h-4 w-4" />
//           <span>{selectedLanguage}</span>
//           <ChevronDown className="h-4 w-4" />
//         </button>

//         {isOpen && (
//           <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
//             <div className="py-1 max-h-60 overflow-auto">
//               {languages.map((language) => (
//                 <button
//                   key={language.code}
//                   className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   onClick={() => changeLanguage(language.code)}
//                 >
//                   {language.name}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   )
// }

