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
import api from "../../utils/api";

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
  const [hostelCount, setHostelCount] = useState(0);

  useEffect(() => {
    dispatch(fetchBlocks());
    // Fetch Hostel Buildings count separately
    api
      .get("/hostel/buildings")
      .then((res) => {
        setHostelCount(res.data.data.length);
      })
      .catch((err) => console.error("Failed to fetch hostel buildings count", err));
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
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Building className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Blocks & Buildings
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage infrastructure, floor plans, and room allocations
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Add New Block
          </button>
        </div>

        {/* Analytics/Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Blocks",
              value: blocks.filter((b) => b.type === "academic").length + blocks.filter((b) => b.type === "hostel").length + hostelCount,
              icon: Building,
              color: "from-blue-500 to-indigo-600",
            },
            {
              label: "Academic Blocks",
              value: blocks.filter((b) => b.type === "academic").length,
              icon: School,
              color: "from-emerald-500 to-teal-600",
            },
            {
              label: "Hostels",
              value: blocks.filter((b) => b.type === "hostel").length + hostelCount,
              icon: BedDouble,
              color: "from-purple-500 to-violet-600",
            },
            {
              label: "Total Floors",
              value: blocks.reduce((acc, curr) => acc + (curr.total_floors || 0), 0),
              icon: Layers,
              color: "from-amber-500 to-orange-600",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-sm`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-bold text-black dark:text-white">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {blocks.map((block) => (
            <Link
              to={`/infrastructure/blocks/${block.id}`}
              key={block.id}
              className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-500/30 transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    {getTypeIcon(block.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {block.name}
                    </h3>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Code: {block.code}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 flex-grow">
                {block.description || "No description provided."}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <Layers className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {block.total_floors} Floors
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {block.room_count || 0} Rooms
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Empty State */}
          {blocks.length === 0 && status === "succeeded" && (
            <div className="col-span-full py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <Building className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                No Blocks Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                Get started by adding your first building block to the campus infrastructure.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                Create First Block
              </button>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add New Block
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Block Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Science Block"
                    value={newBlock.name}
                    onChange={(e) =>
                      setNewBlock({ ...newBlock, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                      Block Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SB"
                      value={newBlock.code}
                      onChange={(e) =>
                        setNewBlock({ ...newBlock, code: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Type
                  </label>
                  <select
                    value={newBlock.type}
                    onChange={(e) =>
                      setNewBlock({ ...newBlock, type: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold"
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
                  className="flex-1 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all"
                >
                  Create Block
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockList;
