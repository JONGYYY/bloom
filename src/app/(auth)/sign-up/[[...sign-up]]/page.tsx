import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Get started</h1>
        <p className="text-mist-300">Create your account to start building campaigns</p>
      </div>
      <SignUp 
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
