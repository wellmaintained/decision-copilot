'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:text-center">
              <span className="bg-slate-100 px-2 rounded italic">Decision Copilot</span> helps teams make{' '}
              <span className="text-blue-600 italic">great</span> decisions
            </h1>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Content Section */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h2 className="mb-4 text-xl font-semibold text-slate-900">
                    A <span className="text-blue-600">good</span> decision is one where stakeholders:
                  </h2>
                  <ul className="space-y-3 text-lg text-slate-700">
                    <li className="flex items-start">
                      <svg className="mr-2 h-6 w-6 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Understand what the decision is about
                    </li>
                    <li className="flex items-start">
                      <svg className="mr-2 h-6 w-6 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Are clear how the decision will be made
                    </li>
                    <li className="flex items-start">
                      <svg className="mr-2 h-6 w-6 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Have participated in making the decision (according to their role)
                    </li>
                    <li className="flex items-start">
                      <svg className="mr-2 h-6 w-6 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Can access details of the decision once it has been made
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="mb-4 text-xl font-semibold text-slate-900">
                    <span className="text-blue-600">Great</span> decisions are made:
                  </h2>
                  <ul className="space-y-3 text-lg text-slate-700">
                    <li className="flex items-start">
                      <svg className="mr-2 h-6 w-6 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Quickly
                    </li>
                    <li className="flex items-start">
                      <svg className="mr-2 h-6 w-6 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      And with minimal toil
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-lg leading-relaxed text-slate-700">
                Decision Copilot guides teams through the process of making decisions together;
                providing structure and removing toil to enable great decision making
              </p>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Get Started
                </a>
              </motion.div>
            </div>

            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/making-a-great-decision.webp"
                  alt="Team celebrating a great decision in a modern office setting with city skyline"
                  width={800}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
