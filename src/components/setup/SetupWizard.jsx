export default function SetupWizard({
  setupStep,
  setSetupStep,
  setupData,
  setSetupData,
  onComplete,
  onSkip,
}) {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center p-8">
      <div className="bg-white rounded-[16px] shadow-2xl max-w-2xl w-full p-8">
        <nav aria-label="Setup progress" className="flex items-center justify-between mb-8">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${setupStep >= 1 ? 'bg-brand-primary text-white' : 'bg-gray-300 text-gray-600'} font-bold`}
          >
            1
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${setupStep >= 2 ? 'bg-brand-primary' : 'bg-gray-300'}`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${setupStep >= 2 ? 'bg-brand-primary text-white' : 'bg-gray-300 text-gray-600'} font-bold`}
          >
            2
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${setupStep >= 3 ? 'bg-brand-primary' : 'bg-gray-300'}`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${setupStep >= 3 ? 'bg-brand-primary text-white' : 'bg-gray-300 text-gray-600'} font-bold`}
          >
            3
          </div>
        </nav>

        {setupStep === 1 && (
          <section className="text-center">
            <img src="/logos/RoutineReady_Logo_Stacked_Colour.svg" alt="Routine Ready" className="h-28 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-brand-text mb-4">Welcome to Routine Ready</h1>
            <p className="text-xl text-brand-text-muted mb-8">
              Let's set up your display in just a few steps. This will help personalize the system
              for your classroom.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSetupStep(2)}
                className="px-8 min-h-[44px] py-4 bg-brand-primary text-white text-lg rounded-[6px] hover:bg-brand-primary-dark transition-colors font-semibold"
              >
                Get Started
              </button>
              <button
                onClick={onSkip}
                className="px-8 min-h-[44px] py-4 bg-brand-bg-subtle text-brand-text border border-brand-border text-lg rounded-[6px] hover:bg-gray-200 transition-colors font-semibold"
              >
                Skip Setup
              </button>
            </div>
          </section>
        )}

        {setupStep === 2 && (
          <section>
            <h2 className="text-3xl font-bold text-brand-text mb-6">
              School & Classroom Information
            </h2>
            <div className="space-y-4 mb-8">
              <div>
                <label htmlFor="setup-school" className="block text-sm font-medium text-brand-text mb-2">
                  School Name *
                </label>
                <input
                  id="setup-school"
                  type="text"
                  placeholder="e.g., Riverside Elementary School"
                  value={setupData.schoolName}
                  onChange={(e) => setSetupData({ ...setupData, schoolName: e.target.value })}
                  className="w-full p-3 h-[44px] border-2 border-brand-border rounded-[6px] text-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-pale focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="setup-class" className="block text-sm font-medium text-brand-text mb-2">
                  Class/Room Name *
                </label>
                <input
                  id="setup-class"
                  type="text"
                  placeholder="e.g., Room 5A, Reception Class, Year 3"
                  value={setupData.className}
                  onChange={(e) => setSetupData({ ...setupData, className: e.target.value })}
                  className="w-full p-3 h-[44px] border-2 border-brand-border rounded-[6px] text-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-pale focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="setup-teacher" className="block text-sm font-medium text-brand-text mb-2">
                  Lead Teacher Name *
                </label>
                <input
                  id="setup-teacher"
                  type="text"
                  placeholder="e.g., Mrs. Johnson"
                  value={setupData.teacherName}
                  onChange={(e) => setSetupData({ ...setupData, teacherName: e.target.value })}
                  className="w-full p-3 h-[44px] border-2 border-brand-border rounded-[6px] text-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-pale focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="setup-device" className="block text-sm font-medium text-brand-text mb-2">
                  Device Name (Optional)
                </label>
                <input
                  id="setup-device"
                  type="text"
                  placeholder="e.g., Main Display, Back Wall Screen"
                  value={setupData.deviceName}
                  onChange={(e) => setSetupData({ ...setupData, deviceName: e.target.value })}
                  className="w-full p-3 h-[44px] border-2 border-brand-border rounded-[6px] text-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-pale focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setSetupStep(1)}
                className="px-6 min-h-[44px] py-3 bg-brand-bg-subtle text-brand-text border border-brand-border rounded-[6px] hover:bg-gray-200 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setSetupStep(3)}
                className="flex-1 px-6 min-h-[44px] py-3 bg-brand-primary text-white rounded-[6px] hover:bg-brand-primary-dark transition-colors font-semibold"
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {setupStep === 3 && (
          <section>
            <h2 className="text-3xl font-bold text-brand-text mb-6">Quick Tips for Success</h2>
            <div className="space-y-4 mb-8">
              <div className="flex gap-4 p-4 bg-brand-primary-bg rounded-[6px]">
                <div className="text-3xl">👁️</div>
                <div>
                  <h3 className="font-bold text-brand-text mb-1">High Visibility</h3>
                  <p className="text-brand-text-muted">
                    Position the display where all students can easily see it from their seats.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-green-50 rounded-[6px]">
                <div className="text-3xl">📸</div>
                <div>
                  <h3 className="font-bold text-brand-text mb-1">Use Pictures</h3>
                  <p className="text-brand-text-muted">
                    Visual learners benefit from images. Upload pictures of activities in the admin
                    panel.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-brand-accent-bg rounded-[6px]">
                <div className="text-3xl">⏰</div>
                <div>
                  <h3 className="font-bold text-brand-text mb-1">Consistent Timing</h3>
                  <p className="text-brand-text-muted">
                    Keep transition times consistent daily to help children predict their schedule.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-brand-accent-bg rounded-[6px]">
                <div className="text-3xl">💾</div>
                <div>
                  <h3 className="font-bold text-brand-text mb-1">Save Templates</h3>
                  <p className="text-brand-text-muted">
                    Create templates for different day types (full day, short day, special events).
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-brand-primary-bg border-l-4 border-brand-primary p-4 mb-6 rounded-[6px]">
              <p className="text-brand-primary-dark">
                <strong>Admin Access:</strong> Click the settings icon in the top-right corner to
                manage tasks.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setSetupStep(2)}
                className="px-6 min-h-[44px] py-3 bg-brand-bg-subtle text-brand-text border border-brand-border rounded-[6px] hover:bg-gray-200 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={onComplete}
                className="flex-1 px-6 min-h-[44px] py-3 bg-brand-success text-white rounded-[6px] hover:bg-green-700 transition-colors font-semibold text-lg"
              >
                Complete Setup
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
