export default function TemplateModal({ newTemplateName, setNewTemplateName, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="template-modal-title">
      <div className="bg-white rounded-[16px] p-8 w-96 shadow-lg">
        <h2 id="template-modal-title" className="text-2xl font-bold mb-6 text-brand-text">Save Current Schedule as Template</h2>
        <label htmlFor="template-name" className="sr-only">Template name</label>
        <input
          id="template-name"
          type="text"
          placeholder="Template Name (e.g., Monday Schedule)"
          value={newTemplateName}
          onChange={(e) => setNewTemplateName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          className="w-full p-3 h-[44px] border-2 border-brand-border rounded-[6px] mb-6 text-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary-pale focus:outline-none"
        />
        <div className="flex gap-3">
          <button
            onClick={onSave}
            className="flex-1 bg-brand-primary text-white min-h-[44px] py-3 rounded-[6px] hover:bg-brand-primary-dark font-semibold"
          >
            Save Template
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-brand-bg-subtle text-brand-text border border-brand-border min-h-[44px] py-3 rounded-[6px] hover:bg-gray-200 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
