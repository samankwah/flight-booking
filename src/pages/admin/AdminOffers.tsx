import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import type { SpecialOffer } from "../../types";
import { MdAdd, MdEdit, MdDelete, MdClose, MdToggleOn, MdToggleOff } from "react-icons/md";
import toast from "react-hot-toast";

const AdminOffers: React.FC = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    destination: "",
    country: "",
    price: 0,
    currency: "GHS",
    originalPrice: 0,
    discount: 0,
    validFrom: "",
    validUntil: "",
    category: "flight" as "flight" | "hotel" | "package" | "visa",
    featured: false,
    active: true,
    terms: "",
    highlights: [] as string[],
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const offersSnapshot = await getDocs(collection(db, "specialOffers"));
      const offersData: SpecialOffer[] = offersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SpecialOffer[];
      setOffers(offersData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to fetch offers");
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData({
      title: "",
      description: "",
      image: "",
      destination: "",
      country: "",
      price: 0,
      currency: "GHS",
      originalPrice: 0,
      discount: 0,
      validFrom: "",
      validUntil: "",
      category: "flight",
      featured: false,
      active: true,
      terms: "",
      highlights: [],
    });
    setShowModal(true);
  };

  const openEditModal = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      image: offer.image,
      destination: offer.destination,
      country: offer.country,
      price: offer.price,
      currency: offer.currency,
      originalPrice: offer.originalPrice || 0,
      discount: offer.discount || 0,
      validFrom: offer.validFrom,
      validUntil: offer.validUntil,
      category: offer.category,
      featured: offer.featured,
      active: offer.active,
      terms: offer.terms || "",
      highlights: offer.highlights || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOffer) {
        await updateDoc(doc(db, "specialOffers", editingOffer.id), {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
        toast.success("Offer updated successfully");
      } else {
        await addDoc(collection(db, "specialOffers"), {
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast.success("Offer created successfully");
      }
      fetchOffers();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error("Failed to save offer");
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      await deleteDoc(doc(db, "specialOffers", offerId));
      toast.success("Offer deleted successfully");
      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  const toggleActive = async (offer: SpecialOffer) => {
    try {
      await updateDoc(doc(db, "specialOffers", offer.id), {
        active: !offer.active,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Offer ${!offer.active ? "activated" : "deactivated"}`);
      fetchOffers();
    } catch (error) {
      console.error("Error toggling offer:", error);
      toast.error("Failed to update offer");
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Special Offers</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage promotional offers</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
        >
          <MdAdd className="text-xl" /> Add Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-48 bg-gray-200 dark:bg-gray-700">
              {offer.image && (
                <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{offer.title}</h3>
                <button
                  onClick={() => toggleActive(offer)}
                  className={`${offer.active ? "text-green-600" : "text-gray-400"}`}
                  title={offer.active ? "Active" : "Inactive"}
                >
                  {offer.active ? <MdToggleOn className="text-2xl" /> : <MdToggleOff className="text-2xl" />}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{offer.destination}, {offer.country}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{offer.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {offer.currency} {offer.price.toLocaleString()}
                  </span>
                  {offer.originalPrice && offer.originalPrice > offer.price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {offer.currency} {offer.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(offer)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <MdEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
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
                {editingOffer ? "Edit Offer" : "Create Offer"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Price</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valid From</label>
                  <input
                    type="date"
                    required
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="flight">Flight</option>
                    <option value="hotel">Hotel</option>
                    <option value="package">Package</option>
                    <option value="visa">Visa</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded text-cyan-600 focus:ring-cyan-500"
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
                  {editingOffer ? "Update Offer" : "Create Offer"}
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

export default AdminOffers;
