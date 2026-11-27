"use client";

import { useState } from "react";

export default function AddChildPage() {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("Sunshine");

  return (
    <div className="min-h-screen flex items-start justify-center p-10 md:p-10">
      <div className="w-full max-w-[520px] bg-[#FBF4EC] border border-[#ECE0D0] rounded-3xl shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] overflow-hidden">
        {/* Header bar - Step 2 */}
        {/* Form fields - Steps 3-6 */}
      </div>
    </div>
  );
}
