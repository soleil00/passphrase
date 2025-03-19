"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Code, Cog, Construction, Hammer, Wrench } from "lucide-react"

export default function UnderDevelopmentPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Under Development</h1>
          <p className="text-xl text-slate-300">
            We&apos;re working hard to bring you an amazing new feature. Unfortunately, it&apos;s still under construction.
          </p>
        </motion.div>

        <div className="relative h-64 w-full max-w-md mx-auto">
          {/* Construction animation */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Construction className="text-yellow-400 w-24 h-24 absolute" />

            {/* Rotating gears */}
            <motion.div
              className="absolute top-12 right-24"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Cog className="text-slate-400 w-16 h-16" />
            </motion.div>

            <motion.div
              className="absolute bottom-12 left-24"
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Cog className="text-slate-400 w-12 h-12" />
            </motion.div>

            {/* Bouncing tools */}
            <motion.div
              className="absolute bottom-8 right-16"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <Wrench className="text-blue-400 w-10 h-10" />
            </motion.div>

            <motion.div
              className="absolute top-8 left-16"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
            >
              <Hammer className="text-red-400 w-10 h-10" />
            </motion.div>

            <motion.div
              className="absolute top-20 right-12"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.8 }}
            >
              <Code className="text-green-400 w-10 h-10" />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="space-y-6"
        >
          <p className="text-lg text-slate-300">
            We&apos;re adding new features and making improvements to enhance your experience. Please check back soon!
          </p>

          <motion.div
            className="h-2 w-64 mx-auto bg-slate-700 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: "16rem" }}
            transition={{ delay: 1, duration: 1 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              animate={{
                width: ["0%", "30%", "45%", "65%", "60%", "75%"],
                x: [0, 10, 20, 15, 25, 0],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <p className="text-sm text-slate-400">Estimated completion: Coming soon</p>
        </motion.div>
      </div>
    </div>
  )
}
