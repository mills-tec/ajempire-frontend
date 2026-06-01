"use client";
import { useAuthStore } from "@/lib/stores/auth-store";

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  return (first + second).toUpperCase();
}
interface ProfileNameProps {
  email?: string;
}

export default function ProfileName({ email: _email }: ProfileNameProps) {
  const { user } = useAuthStore()
  const fullName = user?.name;
  const initials = getInitials(fullName);

  function formatEmail(email: string, maxLength = 20) {
    if (email.length <= maxLength) return email;

    const [local, domain] = email.split("@");
    const visibleChars = Math.floor((maxLength - 3) / 2); // 3 for "..."

    return `${local.slice(0, visibleChars)}...@${domain}`;
  }
  return (
    <div className="flex items-center gap-3 font-poppins">
      <div className="w-[65px] h-[65px] rounded-full bg-brand_solid_gradient flex items-center justify-center font-semibold cursor-pointer text-white">
        {initials}
      </div>
      <div className="flex flex-col  gap-0">
        <p className="capitalize text-[14px]">{fullName}</p>
        <p className="text-xs font-light text-black/40">{formatEmail(user?.email ?? '')}</p>
      </div>
    </div>
  );
}
