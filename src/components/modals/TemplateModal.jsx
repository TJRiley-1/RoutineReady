export default function TemplateModal({ newTemplateName, setNewTemplateName, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Save Current Schedule as Template</h2>
        <input
          type="text"
          placeholder="Template Name (e.g., Monday Schedule)"
          value={newTemplateName}
          onChange={(e) => setNewTemplateName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          className="w-full p-3 border border-gray-300 rounded-lg mb-6 text-lg"
        />
        <div className="flex gap-3">
          <button
            onClick={onSave}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
          >
            Save Template
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
