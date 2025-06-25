"use client";

import { Dock, DockIcon } from "@/components/magicui/dock";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Aboutpage() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center text-white px-4">
      <motion.h1
        className="text-5xl md:text-6xl font-bold text-center mb-16"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Mayank Gautam
      </motion.h1>

      <Dock
        iconSize={60}
        iconMagnification={90}
        iconDistance={200}
        className="shadow-xl shadow-black/20 border-white/10 dark:border-white/10 backdrop-blur-xl bg-white/5"
      >
        <a
          href="https://github.com/mayankgautam29"
          target="_blank"
          rel="noopener noreferrer"
        >
          <DockIcon>
            <FaGithub className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </DockIcon>
        </a>

        <a
          href="https://www.instagram.com/mayankk.gtm/?hl=en"
          target="_blank"
          rel="noopener noreferrer"
        >
          <DockIcon>
            <FaInstagram className="w-8 h-8 md:w-10 md:h-10 text-pink-500" />
          </DockIcon>
        </a>

        <a
          href="https://www.linkedin.com/in/mayank-gautam29/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <DockIcon>
            <FaLinkedin className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />
          </DockIcon>
        </a>
      </Dock>
    </div>
  );
}
