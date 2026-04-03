interface AuthBackButtonProps {
  onBack: () => void;
}

export default function AuthBackButton({ onBack }: AuthBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="Go back"
      className="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center text-[1.75rem] font-medium leading-none text-black/80 transition-opacity hover:opacity-70"
    >
      <span aria-hidden="true">&lt;</span>
    </button>
  );
}
