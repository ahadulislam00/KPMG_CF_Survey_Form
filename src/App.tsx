import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import {
  Plus,
  Trash2,
  Download,
  Send,
  MapPin,
  User,
  ClipboardCheck,
  Lock,
} from "lucide-react";

// --- CONFIGURATION ---
// Replace these with your actual Supabase details from Step 1
const SUPABASE_URL = "https://jrcudxxvcfrwzeavfpic.supabase.co/rest/v1/L";
const SUPABASE_KEY = "sb_publishable_jpEL2MPe9AT79I8gWr0d8A_WFnKGwwR";
const ADMIN_PASSWORD = "admin"; // Change this!
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const KPMG_BLUE = "#00338D";

const SurveyApp = () => {
  const [formData, setFormData] = useState({
    surveyorName: "",
    customerName: "",
    category: "",
    subCategory: "",
    assetSize: "",
    distance: "",
    landmarks: "",
    observations: "",
  });
  const [surveyeeRows, setSurveyeeRows] = useState([
    { name: "", occupation: "", contact: "", maxPrice: "", minPrice: "" },
  ]);

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [allEntries, setAllEntries] = useState([]);

  const subCategoryOptions = {
    Land: ["Leveled", "Low", "Pond", "Agri"],
    Building: ["RCC", "Steel", "Tin Shed", "Semi Pucca"],
  };

  const getUnit = () => (formData.category === "Land" ? "Decimal" : "sft");

  // SUBMIT TO CENTRAL DATABASE
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      unit: getUnit(),
      surveyees: surveyeeRows,
      submitted_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("surveys")
      .insert([{ survey_data: payload }]);

    if (error) {
      alert("Error saving data: " + error.message);
    } else {
      alert("Data sent to KPMG Central Server successfully.");
      setFormData({
        surveyorName: "",
        customerName: "",
        category: "",
        subCategory: "",
        assetSize: "",
        distance: "",
        landmarks: "",
        observations: "",
      });
      setSurveyeeRows([
        { name: "", occupation: "", contact: "", maxPrice: "", minPrice: "" },
      ]);
    }
  };

  // FETCH ALL DATA (Admin Only)
  const fetchAllData = async () => {
    const pass = prompt("Enter Admin Password to Download Data:");
    if (pass === ADMIN_PASSWORD) {
      const { data, error } = await supabase.from("surveys").select("*");
      if (error) alert(error.message);
      else {
        setAllEntries(data);
        setIsAdmin(true);
      }
    } else {
      alert("Unauthorized Access.");
    }
  };

  const exportToExcel = () => {
    const flatData = [];
    allEntries.forEach((dbRow) => {
      const s = dbRow.survey_data;
      s.surveyees.forEach((p) => {
        flatData.push({
          "Submission ID": dbRow.id,
          Date: s.submitted_at,
          Surveyor: s.surveyorName,
          Customer: s.customerName,
          Category: s.category,
          Size: s.assetSize,
          Unit: s.unit,
          Surveyee: p.name,
          "Max Price": p.maxPrice,
          "Min Price": p.minPrice,
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CentralData");
    XLSX.writeFile(wb, `KPMG_Master_Report.xlsx`);
  };

  const styles = {
    container: {
      backgroundColor: "#F5F5F5",
      minHeight: "100vh",
      paddingBottom: "50px",
      fontFamily: "Arial",
    },
    nav: {
      backgroundColor: "white",
      borderBottom: `4px solid ${KPMG_BLUE}`,
      padding: "10px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    card: {
      backgroundColor: "white",
      border: "1px solid #D9D9D9",
      marginBottom: "25px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    header: {
      backgroundColor: KPMG_BLUE,
      color: "white",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      boxSizing: "border-box",
    },
    submitBtn: {
      backgroundColor: KPMG_BLUE,
      color: "white",
      padding: "15px 50px",
      border: "none",
      fontWeight: "bold",
      cursor: "pointer",
      display: "block",
      margin: "30px auto",
    },
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/9d/KPMG_logo.svg"
          alt="KPMG"
          style={{ height: "25px" }}
        />
        <div style={{ display: "flex", gap: "10px" }}>
          {!isAdmin ? (
            <button
              onClick={fetchAllData}
              style={{
                background: "none",
                border: "none",
                color: "#ccc",
                cursor: "pointer",
              }}
            >
              <Lock size={16} />
            </button>
          ) : (
            <button
              onClick={exportToExcel}
              style={{
                backgroundColor: "#00A3A1",
                color: "white",
                border: "none",
                padding: "10px 20px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              <Download size={16} /> DOWNLOAD MASTER EXCEL
            </button>
          )}
        </div>
      </nav>

      <div
        style={{ maxWidth: "900px", margin: "30px auto", padding: "0 20px" }}
      >
        <h2
          style={{
            color: KPMG_BLUE,
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          CF SURVEY SYSTEM
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Main Info Card */}
          <div style={styles.card}>
            <div style={styles.header}>
              <User size={16} /> GENERAL INFORMATION
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                padding: "20px",
              }}
            >
              <input
                required
                placeholder="Surveyor Name"
                value={formData.surveyorName}
                onChange={(e) =>
                  setFormData({ ...formData, surveyorName: e.target.value })
                }
                style={styles.input}
              />
              <input
                required
                placeholder="Customer Name"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                style={styles.input}
              />
            </div>
          </div>

          {/* Asset Details */}
          <div style={styles.card}>
            <div style={styles.header}>
              <MapPin size={16} /> ASSET SPECIFICATIONS
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "20px",
                padding: "20px",
              }}
            >
              <select
                required
                style={styles.input}
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    subCategory: "",
                  })
                }
              >
                <option value="">Category</option>
                <option value="Land">Land</option>
                <option value="Building">Building</option>
                <option value="Flat">Flat</option>
                <option value="Shop">Shop</option>
              </select>
              <select
                style={styles.input}
                value={formData.subCategory}
                onChange={(e) =>
                  setFormData({ ...formData, subCategory: e.target.value })
                }
                disabled={!subCategoryOptions[formData.category]}
              >
                <option value="">Sub-Category</option>
                {subCategoryOptions[formData.category]?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <input
                required
                type="number"
                placeholder={`Size (${getUnit()})`}
                value={formData.assetSize}
                onChange={(e) =>
                  setFormData({ ...formData, assetSize: e.target.value })
                }
                style={styles.input}
              />
            </div>
          </div>

          {/* Grid Row Card */}
          <div style={styles.card}>
            <div style={{ ...styles.header, justifyContent: "space-between" }}>
              <span>
                <ClipboardCheck size={16} /> SURVEYEE PRICE MATRIX
              </span>
              <button
                type="button"
                onClick={() =>
                  setSurveyeeRows([
                    ...surveyeeRows,
                    {
                      name: "",
                      occupation: "",
                      contact: "",
                      maxPrice: "",
                      minPrice: "",
                    },
                  ])
                }
                style={{
                  background: "none",
                  border: "1px solid white",
                  color: "white",
                  cursor: "pointer",
                  padding: "2px 10px",
                }}
              >
                + Add Row
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9f9f9", fontSize: "12px" }}>
                  <th
                    style={{ padding: "10px", borderBottom: "1px solid #ddd" }}
                  >
                    Surveyee Name
                  </th>
                  <th
                    style={{ padding: "10px", borderBottom: "1px solid #ddd" }}
                  >
                    Max Price
                  </th>
                  <th
                    style={{ padding: "10px", borderBottom: "1px solid #ddd" }}
                  >
                    Min Price
                  </th>
                  <th
                    style={{ padding: "10px", borderBottom: "1px solid #ddd" }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {surveyeeRows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        required
                        style={{ ...styles.input, border: "none" }}
                        value={row.name}
                        onChange={(e) => {
                          const r = [...surveyeeRows];
                          r[index].name = e.target.value;
                          setSurveyeeRows(r);
                        }}
                        placeholder="Full Name"
                      />
                    </td>
                    <td>
                      <input
                        required
                        type="number"
                        style={{
                          ...styles.input,
                          border: "none",
                          textAlign: "center",
                        }}
                        value={row.maxPrice}
                        onChange={(e) => {
                          const r = [...surveyeeRows];
                          r[index].maxPrice = e.target.value;
                          setSurveyeeRows(r);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        required
                        type="number"
                        style={{
                          ...styles.input,
                          border: "none",
                          textAlign: "center",
                        }}
                        value={row.minPrice}
                        onChange={(e) => {
                          const r = [...surveyeeRows];
                          r[index].minPrice = e.target.value;
                          setSurveyeeRows(r);
                        }}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() =>
                          setSurveyeeRows(
                            surveyeeRows.filter((_, i) => i !== index)
                          )
                        }
                        style={{
                          border: "none",
                          color: "red",
                          cursor: "pointer",
                          background: "none",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="submit" style={styles.submitBtn}>
            <Send size={18} /> UPLOAD TO CENTRAL SERVER
          </button>
        </form>
      </div>
    </div>
  );
};

export default SurveyApp;
