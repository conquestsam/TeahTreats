'use client';

import Lottie from 'lottie-react';

export function LottieLoader({ animationData }: Readonly<{ animationData: unknown }>) {
  return <Lottie animationData={animationData} loop autoplay />;
}
