"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where, addDoc, doc, setDoc } from "firebase/firestore";

export default function ScanPage() {
  const params = useParams();
  const qr_id = params.qr_id;

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    plate_number: "",
    make: "",
    model: "",
    owner_email: "",
    ice_name: "",
    ice_phone: "",
    ice_relationship: ""
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!qr_id) return;

    async function fetchVehicle() {
      const vehiclesRef = collection(db, "vehicles");
      const q = query(vehiclesRef, where("qr_id", "==", qr_id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        const vehicleId = querySnapshot.docs[0].id;

        const iceRef = collection(db, `vehicles/${vehicleId}/ice_contacts`);
        const iceSnapshot = await getDocs(iceRef);
        const iceContacts = iceSnapshot.docs.map(doc => doc.data());

        setVehicle({ id: vehicleId, ...docData, ice_contacts: iceContacts });
      }
      setLoading(false);
    }

    fetchVehicle();
  }, [qr_id, submitted]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const vehicleRef = doc(collection(db, "vehicles"));
    await setDoc(vehicleRef, {
      qr_id: qr_id,
      plate_number: formData.plate_number,
      make: formData.make,
      model: formData.model,
      owner_email: formData.owner_email
    });

    const iceRef = collection(db, `vehicles/${vehicleRef.id}/ice_contacts`);
    await addDoc(iceRef, {
      name: formData.ice_name,
      phone: formData.ice_phone,
      relationship: formData.ice_relationship
    });

    setSubmitted(true);
  };

  const sendPresetEmail = (message) => {
    if (!vehicle?.owner_email) {
      alert("Owner email not found.");
      return;
    }

    const subject = "DriveAlert QR Notification";

    const body = `Hello,

${message}

Vehicle: ${vehicle.plate_number} (${vehicle.make} ${vehicle.model})

Regards,
DriveAlert User`;

    window.location.href =
      `mailto:${vehicle.owner_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) return <p style={{textAlign:"center"}}>Loading...</p>;

  const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f9",
    padding: "20px"
  };

  const cardStyle = {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    border: "1px solid #ccc",
    borderRadius: "5px"
  };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "600"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px"
  };

  if (vehicle) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2>Emergency Contacts</h2>
          <p>
            Vehicle: <b>{vehicle.plate_number}</b> ({vehicle.make} {vehicle.model})
          </p>

          {vehicle.ice_contacts && vehicle.ice_contacts.length > 0 ? (
            <ul>
              {vehicle.ice_contacts.map((c, idx) => (
                <li key={idx} style={{marginBottom:"10px"}}>
                  {c.name} — {c.phone} ({c.relationship}){" "}
                  <a
                    href={`tel:${c.phone}`}
                    style={{
                      marginLeft: "10px",
                      padding: "5px 10px",
                      backgroundColor: "#28a745",
                      color: "white",
                      borderRadius: "5px",
                      textDecoration: "none"
                    }}
                  >
                    Call
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No emergency contacts found.</p>
          )}

          <h3 style={{marginTop:"20px"}}>Notify Owner</h3>

          <button
            onClick={() => sendPresetEmail("Your car lights are on.")}
            style={{...buttonStyle, marginBottom:"10px"}}
          >
            Lights On
          </button>

          <button
            onClick={() => sendPresetEmail("Your car is blocking access.")}
            style={{...buttonStyle, marginBottom:"10px"}}
          >
            Blocking Access
          </button>

          <button
            onClick={() => sendPresetEmail("Your alarm is going off.")}
            style={buttonStyle}
          >
            Alarm Triggered
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2>Activate Your QR</h2>

        <form onSubmit={handleSubmit}>

          <label style={labelStyle}>Plate Number</label>
          <input
            type="text"
            name="plate_number"
            value={formData.plate_number}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Vehicle Make</label>
          <input
            type="text"
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Vehicle Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Owner Email</label>
          <input
            type="email"
            name="owner_email"
            value={formData.owner_email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <h3>Emergency Contact</h3>

          <label style={labelStyle}>Contact Name</label>
          <input
            type="text"
            name="ice_name"
            value={formData.ice_name}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Contact Phone</label>
          <input
            type="tel"
            name="ice_phone"
            value={formData.ice_phone}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Relationship</label>
          <input
            type="text"
            name="ice_relationship"
            value={formData.ice_relationship}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            Activate QR
          </button>

        </form>
      </div>
    </div>
  );
}