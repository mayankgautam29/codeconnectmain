"use client";

import { useEffect, useState } from "react";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Particles from "@tsparticles/react";
import type { ISourceOptions } from "@tsparticles/engine";

export function ParticleBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options: ISourceOptions = {
    fullScreen: { enable: true, zIndex: -1 },
    background: {
      color: { value: "#0f1123" },
    },
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          width: 800, // ✅ this replaces value_area in v3+
          height: 800,
        },
      },
      color: {
        value: ["#ffffff", "#00ffff", "#ff00ff", "#00ff00", "#ff9900"],
      },
      shape: {
        type: ["circle", "star"],
      },
      opacity: {
        value: 0.6,
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        },
      },
      size: {
        value: { min: 1, max: 3 },
        animation: {
          enable: true,
          speed: 2,
          sync: false,
        },
      },
      links: {
        enable: true,
        distance: 130,
        color: "#ffffff",
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        outModes: {
          default: "out",
        },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: ["bubble", "repulse"],
        },
        onClick: {
          enable: true,
          mode: ["push", "repulse"],
        },
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 100,
          duration: 0.4,
        },
        bubble: {
          distance: 120,
          size: 6,
          duration: 2,
          opacity: 0.8,
        },
      },
    },
    detectRetina: true,
  };

  return init ? <Particles id="tsparticles" options={options} /> : null;
}
