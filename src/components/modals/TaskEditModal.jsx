import { ImagePlus } from 'lucide-react'
import { iconLibrary, getIconComponent } from '../../data/iconLibrary'
import { readFileAsDataURL } from '../../lib/timeUtils'

export default function TaskEditModal({ editingTask, setEditingTask, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <h2 className="text-2xl font-bold text-gray-800">Edit Task</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
            <input
              type="text"
              value={editingTask.content}
              onChange={(e) => setEditingTask({ ...editingTask, content: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task name"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={editingTask.duration}
              onChange={(e) =>
                setEditingTask({ ...editingTask, duration: parseInt(e.target.value) || 0 })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter duration in minutes"
              min="1"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Icon (Optional)
            </label>
            <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {iconLibrary.map((iconItem) => {
                const IconComp = iconItem.component
                return (
                  <button
                    key={iconItem.id}
                    onClick={() => setEditingTask({ ...editingTask, icon: iconItem.id })}
                    className={`p-4 rounded-lg border-2 hover:bg-purple-50 transition-colors flex flex-col items-center justify-center gap-2 ${
                      editingTask.icon === iconItem.id
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200'
                    }`}
                    title={iconItem.name}
                    type="button"
                  >
                    <IconComp className="w-8 h-8 text-indigo-600" />
                    <span className="text-xs text-gray-600 text-center">{iconItem.name}</span>
                  </button>
                )
              })}
            </div>
            {editingTask.icon && (
              <button
                onClick={() => setEditingTask({ ...editingTask, icon: null })}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                type="button"
              >
                Remove Icon
              </button>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image (Optional)
            </label>
            {editingTask.imageUrl && editingTask.imageUrl !== '' ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={editingTask.imageUrl}
                    alt="Task preview"
                    className="w-40 h-40 object-contain rounded-lg border-2 border-gray-300 bg-gray-50"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-2">
                      Image will be displayed in the task card. Large images may slow down the app.
                    </p>
                    <button
                      onClick={() =>
                        setEditingTask({ ...editingTask, imageUrl: null, type: 'text' })
                      }
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      type="button"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                  <div className="text-center">
                    <ImagePlus className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <span className="text-sm text-gray-600 block mb-1">Click to upload image</span>
                    <span className="text-xs text-gray-500">
                      Recommended: Under 500KB for best performance
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const maxSize = 2 * 1024 * 1024
                        const warningSize = 500 * 1024

                        if (file.size > maxSize) {
                          alert(
                            `Image is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Please use an image smaller than 2MB.`
                          )
                          e.target.value = ''
                          return
                        }

                        if (file.size > warningSize) {
                          const sizeInKB = (file.size / 1024).toFixed(0)
                          if (
                            !confirm(
                              `This image is ${sizeInKB}KB. Large images may slow down the app. Consider using a smaller image for better performance. Continue anyway?`
                            )
                          ) {
                            e.target.value = ''
                            return
                          }
                        }

                        readFileAsDataURL(file, (dataUrl) => {
                          setEditingTask({
                            ...editingTask,
                            imageUrl: dataUrl,
                            type: 'image',
                          })
                        })
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum file size: 2MB. Images will be stored as base64 data.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            type="button"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
