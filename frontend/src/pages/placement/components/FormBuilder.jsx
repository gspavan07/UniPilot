import React, { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";

const FormBuilder = ({ fields, onChange }) => {
  const addField = () => {
    const newField = {
      id: Date.now(),
      label: "New Field",
      type: "text",
      required: false,
      options: [],
    };
    onChange([...fields, newField]);
  };

  const removeField = (id) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const updateField = (id, updates) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Custom Registration Fields
          </h3>
          <p className="text-xs text-gray-500">
            Collect additional data from students for this drive
          </p>
        </div>
        <button
          type="button"
          onClick={addField}
          className="flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Field
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl relative group"
          >
            <div className="flex gap-4 items-start">
              <div className="mt-2 cursor-move text-gray-300">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                    value={field.label}
                    onChange={(e) =>
                      updateField(field.id, { label: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Type
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none"
                    value={field.type}
                    onChange={(e) =>
                      updateField(field.id, { type: e.target.value })
                    }
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="file">File Upload</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      checked={field.required}
                      onChange={(e) =>
                        updateField(field.id, { required: e.target.checked })
                      }
                    />
                    <span className="ml-2 text-xs font-medium text-gray-600">
                      Required
                    </span>
                  </label>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {field.type === "dropdown" && (
              <div className="mt-3 ml-8">
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Options (Comma separated)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none"
                  placeholder="Option 1, Option 2, Option 3"
                  value={field.options?.join(", ") || ""}
                  onChange={(e) =>
                    updateField(field.id, {
                      options: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                />
              </div>
            )}
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center p-8 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
            <p className="text-sm text-gray-400">
              No custom fields added. Default profile data will be used.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
