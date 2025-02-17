"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import AddStudent from "@/components/AddStudents";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // Track student being edited
  const [updatedData, setUpdatedData] = useState({}); // Store updated values

  // Fetch students added by logged-in user
  useEffect(() => {
    if (session && session.user.id) {
      fetch(`/api/students`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setStudents(data);
        });
    }
  }, [session]);

  if (!session) return <p className="p-6 text-red-500">Please login first</p>;

  // Handle input changes in the edit form
  const handleChange = (e) => {
    setUpdatedData({ ...updatedData, [e.target.name]: e.target.value });
  };

  // Handle update submission
  const handleUpdate = async (id, student) => {
    // Ensure updatedData is valid
    const dataToUpdate = {
      name: updatedData.name || student.name, // Keep the existing value if not updated
      degree_program: updatedData.degree_program || student.degree_program,
      email: updatedData.email || student.email,
      contact_number: updatedData.contact_number || student.contact_number,
      contact_person: updatedData.contact_person || student.contact_person,
      age: updatedData.age || student.age,
      status: updatedData.status || student.status,
    };

    const response = await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToUpdate),
    });

    if (response.ok) {
      setStudents(students.map((s) => (s.id === id ? { ...s, ...dataToUpdate } : s)));
      setEditingStudent(null); // Close the edit form
    } else {
      console.log("Error updating student");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <button
        onClick={() => {
          signOut({ callbackUrl: "/login" });
        }}
        className="bg-red-500 text-white px-4 py-2 mt-2"
      >
        Logout
      </button>

      {/* Toggle Add Student Form */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 text-white px-4 py-2 mt-4"
      >
        {showForm ? "Close Form" : "Add Student"}
      </button>

      {showForm && <AddStudent onStudentAdded={() => setShowForm(false)} />}

      {/* Students Table */}
      <table className="w-full mt-4 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Degree</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Contact Person</th>
            <th className="border p-2">Age</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-100">
              {editingStudent === student.id ? (
                <>
                  <td className="border p-2">
                    <input
                      type="text"
                      name="name"
                      defaultValue={student.name}
                      onChange={handleChange}
                      className="border p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      name="degree_program"
                      defaultValue={student.degree_program}
                      onChange={handleChange}
                      className="border p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="email"
                      name="email"
                      defaultValue={student.email}
                      onChange={handleChange}
                      className="border p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      name="contact_number"
                      defaultValue={student.contact_number}
                      onChange={handleChange}
                      className="border p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      name="contact_person"
                      defaultValue={student.contact_person}
                      onChange={handleChange}
                      className="border p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      name="age"
                      defaultValue={student.age}
                      onChange={handleChange}
                      className="border p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <select
                      name="status"
                      defaultValue={student.status}
                      onChange={handleChange}
                      className="border p-1"
                    >
                      <option value="Ongoing">Ongoing</option>
                      <option value="Graduated">Graduated</option>
                      <option value="Dropped Out">Dropped Out</option>
                    </select>
                  </td>
                  <td className="border p-2 flex gap-2">
                    <button
                      onClick={() => handleUpdate(student.id, student)}
                      className="bg-green-500 text-white px-2 py-1"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingStudent(null)}
                      className="bg-gray-500 text-white px-2 py-1"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border p-2">{student.name}</td>
                  <td className="border p-2">{student.degree_program}</td>
                  <td className="border p-2">{student.email}</td>
                  <td className="border p-2">{student.contact_number}</td>
                  <td className="border p-2">{student.contact_person}</td>
                  <td className="border p-2">{student.age}</td>
                  <td className="border p-2">{student.status}</td>
                  <td className="border p-2 flex gap-2">
                    <button
                      onClick={() => setEditingStudent(student.id)}
                      className="bg-green-500 text-white px-2 py-1"
                    >
                      Update
                    </button>
                    <button
                      onClick={async () => {
                        const response = await fetch(`/api/students/${student.id}`, { method: "DELETE" });
                        if (response.ok) {
                          setStudents(students.filter((s) => s.id !== student.id));
                        }
                      }}
                      className="bg-red-500 text-white px-2 py-1"
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
