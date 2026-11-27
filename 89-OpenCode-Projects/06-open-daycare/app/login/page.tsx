import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1.05fr_1fr] bg-[#FBF4EC]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#F6A98E] via-[#F2937A] to-[#EC7E62] flex flex-col justify-between p-14 md:p-[56px_60px] text-white hidden md:flex">
        {/* Decorative circles */}
        <div className="absolute w-[420px] h-[420px] rounded-full bg-white/12 -top-[140px] -right-[120px]" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-white/10 -bottom-[110px] -left-[80px]" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-[46px] h-[46px] rounded-[14px] bg-white/22 flex items-center justify-center">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </div>
          <span className="font-[var(--font-fredoka)] font-semibold text-[21px] tracking-[0.5px]">
            OpenDayCare
          </span>
        </div>

        {/* Title and subtitle */}
        <div className="relative z-10">
          <h1 className="font-[var(--font-fredoka)] font-semibold text-[42px] leading-[1.12] mb-[18px]">
            Every child's day,
            <br />
            shared with their family.
          </h1>
          <p className="text-[17px] leading-[1.6] max-w-[430px] text-white/92">
            Share moments, manage rooms, and keep families close, all in one
            place.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-white/90">
          🌿 Sunshine Room Daycare
        </div>
      </div>

      {/* Form Section */}
      <div className="flex items-center justify-center p-5 md:p-10">
        <div className="w-full max-w-[392px]">
          <h2 className="font-[var(--font-fredoka)] font-semibold text-[30px] mb-1.5 text-[#3F362E]">
            Sign in
          </h2>
          <p className="mb-7 text-[15px] text-[#94887B]">
            Sign in to see how today went.
          </p>

          {/* Email field */}
          <div className="text-xs font-bold tracking-[0.7px] text-[#94887B] mb-2">
            EMAIL
          </div>
          <input
            type="email"
            className="w-full py-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E] mb-[18px]"
          />

          {/* Password field */}
          <div className="text-xs font-bold tracking-[0.7px] text-[#94887B] mb-2">
            PASSWORD
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full py-3.5 px-4 rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white text-[15px] text-[#3F362E] mb-2.5"
          />

          {/* Forgot password link */}
          <div className="text-right mb-5">
            <Link
              href="/forgot-password"
              className="text-[13.5px] font-bold text-[#C5503A]"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Sign in button */}
          <Link
            href="/"
            className="block text-center w-full py-[15px] rounded-[15px] bg-gradient-to-b from-[#F4977E] to-[#EE8164] text-white font-extrabold text-base shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
          >
            Sign in
          </Link>

          {/* Activate account link */}
          <p className="text-center mt-6 mb-0 text-[#94887B] text-[14.5px]">
            Invited by the daycare?{" "}
            <Link
              href="/activate-account"
              className="text-[#C5503A] font-extrabold"
            >
              Activate your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
