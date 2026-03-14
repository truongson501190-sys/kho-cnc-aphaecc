declare module '@/components/QRCodeScanner' {
  import React from 'react';
  export const QRCodeScanner: React.ComponentType<{ onDetected?: (text: string) => void }>;
}
