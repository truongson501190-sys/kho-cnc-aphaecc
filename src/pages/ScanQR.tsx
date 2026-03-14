import React from "react";
import { QRCodeScanner } from "@/components/QRCodeScanner";

export default function ScanQRPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <QRCodeScanner />
    </div>
  );
}
