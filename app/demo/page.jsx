"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useControls } from "leva";

function Scroll() {
  const containerRef = useRef(null);
  const totalFrames = 47;
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const { scale, positionX, positionY } = useControls({
    scale: {
      value: 1,
      min: 0.1,
      max: 3,
      step: 0.1,
    },
    positionX: {
      value: 0,
      min: -500,
      max: 1000,
      step: 1,
    },
    positionY: {
      value: 0,
      min: -500,
      max: 1000,
      step: 1,
    },
  });

  useEffect(() => {
    const preloadImages = async () => {
      try {
        const imagePromises = Array.from({ length: totalFrames }, (_, i) => {
          return new Promise((resolve, reject) => {
            const img = document.createElement("img");
            img.src = `/Trials/Section 3 - Basalt Quarry [Export]_${i.toString().padStart(5, "0")}.png`;
            img.onload = resolve;
            img.onerror = reject;
          });
        });

        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    preloadImages();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !imagesLoaded) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const frameSequence = {
      frame: 0,
    };

    const animation = gsap.to(frameSequence, {
      frame: totalFrames - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=300%",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
      onUpdate: () => {
        setCurrentFrame(Math.floor(frameSequence.frame));
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      lenis.destroy();
    };
  }, [imagesLoaded]);

  const imageSrc = `/Trials/Section 3 - Basalt Quarry [Export]_${currentFrame.toString().padStart(5, "0")}.png`;

  if (!imagesLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div ref={containerRef} className="h-screen w-full relative overflow-hidden">
        {showPopup && (
          <div
            onClick={() => {
              setShowPopup(false);
            }}
            className="fixed h-screen text-4xl text-black bg-white w-full flex flex-col p-8 gap-4 cursor-pointer items-center justify-center z-50"
          >
            <h4>
              IF FRAME ISNT AS EXPECTED IN YOUR SCREEN SIZE SO YOU CAN CHANGE IF USING CONTROLS AT THE TOP RIGHT CORNER ACCORDING TO THE DESIRED SCALE
              AND POSITION{" "}
            </h4>
            <h4 className="border border-red-400 rounded-full p-4">CLICK TO CONTINUE</h4>
          </div>
        )}
        <div className="h-screen w-full flex items-center justify-center">
          <Image
            src={imageSrc}
            height={1080}
            width={1920}
            className="h-full w-auto object-contain relative z-10"
            alt={`Sequence Frame ${currentFrame}`}
            priority
            style={{
              transform: `scale(${scale})`,
              marginLeft: `${positionX}px`,
              marginTop: `${positionY}px`,
            }}
          />
        </div>
        <div style={{ height: "300vh" }}></div>
        <Image
          src={"/bg-resize.png"}
          height={1080}
          width={1920}
          alt="bg"
          className="h-full w-auto object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
          priority
        />
      </div>
    </div>
  );
}

export default Scroll;
