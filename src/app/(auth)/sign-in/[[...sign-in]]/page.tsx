import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-mist-300">Sign in to continue to Campaign Generator</p>
      </div>
      <SignIn 
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "glass-panel shadow-xl",
          }
        }}
      />
    </div>
  )
}
