export default function SetupWizard({
  setupStep,
  setSetupStep,
  setupData,
  setSetupData,
  onComplete,
  onSkip,
}) {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <div className="flex items-center justify-between mb-8">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${setupStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'} font-bold`}
          >
            1
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${setupStep >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${setupStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'} font-bold`}
          >
            2
          </div>
          <div
            className={`flex-1 h-1 mx-2 ${setupStep >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}
          ></div>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${setupStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'} font-bold`}
          >
            3
          </div>
        </div>

        {setupStep === 1 && (
          <div className="text-center">
            <div className="text-6xl mb-6">🎓</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to RoutineReady</h1>
            <p className="text-xl text-gray-600 mb-8">
              Let's set up your display in just a few steps. This will help personalize the system
              for your classroom.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setSetupStep(2)}
                className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Get Started
              </button>
              <button
                onClick={onSkip}
                className="px-8 py-4 bg-gray-200 text-gray-700 text-lg rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Skip Setup
              </button>
            </div>
          </div>
        )}

        {setupStep === 2 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              School & Classroom Information
            </h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Riverside Elementary School"
                  value={setupData.schoolName}
                  onChange={(e) => setSetupData({ ...setupData, schoolName: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class/Room Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Room 5A, Reception Class, Year 3"
                  value={setupData.className}
                  onChange={(e) => setSetupData({ ...setupData, className: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Teacher Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mrs. Johnson"
                  value={setupData.teacherName}
                  onChange={(e) => setSetupData({ ...setupData, teacherName: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Main Display, Back Wall Screen"
                  value={setupData.deviceName}
                  onChange={(e) => setSetupData({ ...setupData, deviceName: e.target.value })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setSetupStep(1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setSetupStep(3)}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {setupStep === 3 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Quick Tips for Success</h2>
            <div className="space-y-4 mb-8">
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl">👁️</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">High Visibility</h3>
                  <p className="text-gray-600">
                    Position the display where all students can easily see it from their seats.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-green-50 rounded-lg">
                <div className="text-3xl">📸</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Use Pictures</h3>
                  <p className="text-gray-600">
                    Visual learners benefit from images. Upload pictures of activities in the admin
                    panel.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl">⏰</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Consistent Timing</h3>
                  <p className="text-gray-600">
                    Keep transition times consistent daily to help children predict their schedule.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl">💾</div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">Save Templates</h3>
                  <p className="text-gray-600">
                    Create templates for different day types (full day, short day, special events).
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-6 rounded">
              <p className="text-indigo-900">
                <strong>Admin Access:</strong> Click the settings icon in the top-right corner to
                manage tasks.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setSetupStep(2)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={onComplete}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
