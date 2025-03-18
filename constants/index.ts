import { Key, Shield } from "lucide-react";

export const services = [
    {
      "_id": "67d54c4fbed51b89043628f7",
      "name": "Recover Pi Unlock",
      "type": "protection",
      "description": "Secure your wallet if you believe your passphrase is at risk. Enter all 24 words of your passphrase to secure your wallet and prevent unauthorized access.",
      "usageInstructions": "Enter all 24 words of your passphrase to secure your wallet and prevent unauthorized access.",
      "buttonText": "Select Wallet Protection",
      "createdAt": "2025-03-15T09:45:51.570Z",
      "updatedAt": "2025-03-16T11:07:24.889Z",
      icon: Shield,
      "__v": 0,
      "whenToUse": "Use this if you still have your complete passphrase but believe it may be compromised.",
      "howItWorks": [
        "Enter all 24 words of your passphrase",
        "Our system secures your wallet immediately",
        "Prevents unauthorized access to your Pi balance",
        "Receive confirmation once protection is active"
      ],
      "subtitle": "Authorize the platform to help recover the soon-to-be-unlocked Pi, only used in case the Wallet key cluster has been hijacked by a scam website"
    },
    {
      "_id": "67d54ca113d5101c76bb246e",
      "name": "Passphrase Recovery",
      "type": "recovery",
      "description": "Recover your complete passphrase when you’re missing words. Enter the 21-23 words you remember, and our AI system will help identify the missing word(s).",
      "usageInstructions": "Enter the 21-23 words you remember, and our AI system will help identify the missing word(s).",
      "buttonText": "Select Passphrase Recovery",
      icon: Key,
      "createdAt": "2025-03-15T09:47:13.114Z",
      "updatedAt": "2025-03-15T10:24:50.734Z",
      "__v": 0,
      "whenToUse": "Use this if you’re missing 1-3 words from your 24-word passphrase.",
      "howItWorks": [
        "Enter the 21-23 words you remember",
        "Our AI system identifies the missing word(s)",
        "Recover your complete 24-word passphrase",
        "25% fee only if recovery is successful"
      ],
      "subtitle": "Recover your complete passphrase when you're missing words"
    }
  ]