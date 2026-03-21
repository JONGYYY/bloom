export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-mist-300">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        <div className="glass-panel rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <p className="text-mist-300">Manage your profile settings</p>
        </div>

        <div className="glass-panel rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Theme</h2>
          <p className="text-mist-300">Choose your preferred theme</p>
        </div>

        <div className="glass-panel rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <p className="text-mist-300">Configure notification preferences</p>
        </div>
      </div>
    </div>
  )
}
