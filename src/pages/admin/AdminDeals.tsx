import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import type { TopDeal } from "../../types";
import { MdAdd, MdEdit, MdDelete, MdClose, MdToggleOn, MdToggleOff } from "react-icons/md";
import toast from "react-hot-toast";

const AdminDeals: React.FC = () => {
  const [deals, setDeals] = useState<TopDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<TopDeal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    destination: "",
    country: "",
    price: 0,
    currency: "GHS",
    rating: 5,
    reviews: 0,
    perNight: false,
    category: "",
    featured: false,
    active: true,
    amenities: [] as string[],
    inclusions: [] as string[],
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const dealsSnapshot = await getDocs(collection(db, "topDeals"));
      const dealsData: TopDeal[] = dealsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TopDeal[];
      setDeals(dealsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast.error("Failed to fetch deals");
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDeal(null);
    setFormData({
      title: "",
      description: "",
      image: "",
      destination: "",
      country: "",
      price: 0,
      currency: "GHS",
      rating: 5,
      reviews: 0,
      perNight: false,
      category: "",
      featured: false,
      active: true,
      amenities: [],
      inclusions: [],
    });
    setShowModal(true);
  };

  const openEditModal = (deal: TopDeal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description,
      image: deal.image,
      destination: deal.destination,
      country: deal.country,
      price: deal.price,
      currency: deal.currency,
      rating: deal.rating,
      reviews: deal.reviews,
      perNight: deal.perNight,
      category: deal.category,
      featured: deal.featured,
      active: deal.active,
      amenities: deal.amenities || [],
      inclusions: deal.inclusions || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDeal) {
        await updateDoc(doc(db, "topDeals", editingDeal.id), {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
        toast.success("Deal updated successfully");
      } else {
        await addDoc(collection(db, "topDeals"), {
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast.success("Deal created successfully");
      }
      fetchDeals();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving deal:", error);
      toast.error("Failed to save deal");
    }
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await deleteDoc(doc(db, "topDeals", dealId));
      toast.success("Deal deleted successfully");
      fetchDeals();
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast.error("Failed to delete deal");
    }
  };

  const toggleActive = async (deal: TopDeal) => {
    try {
      await updateDoc(doc(db, "topDeals", deal.id), {
        active: !deal.active,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Deal ${!deal.active ? "activated" : "deactivated"}`);
      fetchDeals();
    } catch (error) {
      console.error("Error toggling deal:", error);
      toast.error("Failed to update deal");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Top Deals</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage featured travel deals</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
        >
          <MdAdd className="text-xl" /> Add Deal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-48 bg-gray-200 dark:bg-gray-700">
              {deal.image && (
                <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{deal.title}</h3>
                <button
                  onClick={() => toggleActive(deal)}
                  className={`${deal.active ? "text-green-600" : "text-gray-400"}`}
                >
                  {deal.active ? <MdToggleOn className="text-2xl" /> : <MdToggleOff className="text-2xl" />}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{deal.destination}, {deal.country}</p>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium">{deal.rating}</span>
                <span className="text-sm text-gray-500">({deal.reviews} reviews)</span>
              </div>
              <div className="mb-3">
                <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                  {deal.currency} {deal.price.toLocaleString()}
                </span>
                {deal.perNight && <span className="text-sm text-gray-500 ml-1">/night</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(deal)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-2 rounded-lg"
                >
                  <MdEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(deal.id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 px-3 py-2 rounded-lg"
                >
                  <MdDelete /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingDeal ? "Edit Deal" : "Create Deal"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500">
                <MdClose className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    required
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reviews Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviews}
                    onChange={(e) => setFormData({ ...formData, reviews: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.perNight}
                      onChange={(e) => setFormData({ ...formData, perNight: e.target.checked })}
                      className="rounded text-cyan-600"
                    />
                    Per Night
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded text-cyan-600"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded text-cyan-600"
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
                >
                  {editingDeal ? "Update Deal" : "Create Deal"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeals;
