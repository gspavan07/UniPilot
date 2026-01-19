import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBlocks,
  createBlock,
} from "../../store/slices/infrastructureSlice";
import {
  Building,
  Plus,
  ArrowRight,
  Layers,
  MapPin,
  School,
  BedDouble,
  Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";

const BlockList = () => {
  const dispatch = useDispatch();
  const { blocks, status } = useSelector((state) => state.infrastructure);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({
    name: "",
    code: "",
    type: "academic",
    total_floors: 1,
    description: "",
  });

  useEffect(() => {
    dispatch(fetchBlocks());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!newBlock.name || !newBlock.code) return;
    await dispatch(createBlock(newBlock));
    setIsModalOpen(false);
    setNewBlock({
      name: "",
      code: "",
      type: "academic",
      total_floors: 1,
      description: "",
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "academic":
        return <School className="w-5 h-5 text-blue-500" />;
      case "hostel":
        return <BedDouble className="w-5 h-5 text-purple-500" />;
      case "administrative":
        return <Briefcase className="w-5 h-5 text-orange-500" />;
      default:
        return <Building className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Blocks & Buildings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your campus infrastructure, floors, and rooms.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-5 h-5" />
          Add Block
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blocks.map((block) => (
          <Link
            to={`/infrastructure/blocks/${block.id}`}
            key={block.id}
            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-primary-500/20 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                {getTypeIcon(block.type)}
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase">
                {block.code}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {block.name}
            </h3>
            <p className="text-sm text-gray-500 mb-6 line-clamp-2">
              {block.description || "No description provided."}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>{block.total_floors} Floors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                <span>{block.room_count || 0} Rooms</span>
              </div>
            </div>
          </Link>
        ))}

        {/* Empty State */}
        {blocks.length === 0 && status === "succeeded" && (
          <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No Blocks Found
            </h3>
            <p className="text-gray-500">
              Get started by adding your first building.
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Add New Block
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Block Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science Block"
                  value={newBlock.name}
                  onChange={(e) =>
                    setNewBlock({ ...newBlock, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Block Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SB"
                    value={newBlock.code}
                    onChange={(e) =>
                      setNewBlock({ ...newBlock, code: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Floors
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBlock.total_floors}
                    onChange={(e) =>
                      setNewBlock({
                        ...newBlock,
                        total_floors: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newBlock.type}
                  onChange={(e) =>
                    setNewBlock({ ...newBlock, type: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                >
                  <option value="academic">Academic</option>
                  <option value="administrative">Administrative</option>
                  <option value="hostel">Hostel</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 font-medium"
              >
                Create Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockList;
