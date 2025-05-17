"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";

export default function EditUserPage() {
  const { userId } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    password: "",
    role: "user",
    status: "active",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get(`/admin/users/${userId}`);
        const user = res.data;
        setForm({
          ...form,
          ...user,
          password: "",
        });
        if (user.profileImage) setImagePreview(user.profileImage);
      } catch (err) {
        setError("Failed to load user");
      }
    }
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, [name]: e.target.files[0] }));
      if (e.target.files[0]) {
        setImagePreview(URL.createObjectURL(e.target.files[0]));
      } else {
        setImagePreview(null);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "image" && value) {
          formData.append("image", value);
        } else if (key !== "password" && key !== "email") {
          formData.append(key, value);
        }
      });
      await api.put(`/admin/users/${userId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success("User updated!");
      router.push(`/admin/users`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.put(`/admin/users/${userId}/password`, { password: form.password });
      toast.success("Password updated!");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Edit Staff / User</h1>
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className="input w-full" placeholder="Full name" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Role <span className="text-red-500">*</span></label>
            <select name="role" value={form.role} onChange={handleChange} className="input w-full">
              <option value="user">User</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input w-full">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Profile Image</label>
            <input type="file" name="image" accept="image/*" onChange={handleChange} className="input w-full" />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 rounded-lg border w-24 h-24 object-cover" />
            )}
          </div>
        </div>
        {error && <div className="text-red-600 text-center font-semibold py-2 bg-red-50 rounded">{error}</div>}
        <div className="flex justify-center">
          <Button type="submit" className="w-full md:w-1/2" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
      <form onSubmit={handlePasswordChange} className="space-y-4 mt-8">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <div>
          <label className="block font-semibold mb-1">New Password <span className="text-red-500">*</span></label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required className="input w-full" placeholder="New password" />
        </div>
        <div className="flex justify-center">
          <Button type="submit" className="w-full md:w-1/2" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  );
} 