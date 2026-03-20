import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="mb-8 text-center">
        <h1 className="font-display text-5xl text-ghost tracking-widest mb-2">JOIN</h1>
        <p className="text-ghost/40 text-sm">Create an account to save your progress and track performance.</p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "bg-ink-soft border border-ghost/10 shadow-none rounded-2xl",
            headerTitle: "font-display text-ghost tracking-wider",
            headerSubtitle: "text-ghost/40",
            formButtonPrimary: "bg-acid text-ink hover:bg-acid-dim font-medium",
            formFieldInput: "bg-ink border-ghost/10 text-ghost focus:border-acid/50 rounded-xl",
            footerActionLink: "text-acid hover:text-acid-dim",
            socialButtonsBlockButton: "border-ghost/10 text-ghost hover:bg-ghost/5",
          },
        }}
      />
    </div>
  );
}
