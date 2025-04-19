// src/components/VisualReports/AnalyticsDashboard.js
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { ArrowUpIcon } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { checkPermission, PERMISSIONS } from "../Permission/Permissions";
import PermissionErrorModal from "../Permission/PermissionErrorModal";
import "./AnalyticsDashboard.css";
import axiosInstance from "../../axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import axios from "axios";

const AnalyticsDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [summaryData, setSummaryData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [specialSectorsData, setSpecialSectorsData] = useState([]);
  const [certSumData, setCertSumData] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  // const [timePeriod, setTimePeriod] = useState("Yearly"); // Default period
  // Families are no longer used for processing, since we’re getting API data directly.

  const [timePeriod, setTimePeriod] = useState("Monthly");
  const [selectedValue, setSelectedValue] = useState(new Date().getMonth() + 1);

  const [certificatesIssuedListData, setCertificatesIssuedListData] = useState(
    []
  );

  const certificateTypes = [
    "Barangay Clearance",
    "Certificate of Residency",
    "Certification of Residency",
    "Certificate of Appearance",
    "Certificate of Good Moral",
    "Barangay Certification",
    "Barangay Health Certification",
    "Certification of Mortuary",
    "Permit to Travel",
    "Certification of Business Closure",
    "Certificate of Indigency",
    "Certificate of No Income",
    "Certificate of Income",
    "Libreng Tulong Hatid",
    "Certification of Late Registration",
    "Oath of Undertaking",
    "Sworn Affidavit of the Barangay Council",
    "Certification of Live In Partner",
    "Certification of Relationship",
    "Solo Parent Certification",
  ];

  const getReports = async () => {
    try {
      const res = await axiosInstance.get(
        `/residents/statistics?filterType=${timePeriod}&filterValue=${selectedValue}`
      );
      if (res.data && res.data.success) {
        const stats = res.data.data;
        console.log("Data from API:", stats);

        const certificateSummary = certificateTypes.map((type) => {
          const cert = stats.certReports.find((item) => item._id === type);
          return {
            Certificate: type,
            Count: cert ? cert.count : 0,
          };
        });

        setCertSumData(certificateSummary);

        // Build summaryData based on API stats
        setSummaryData([
          {
            Title: "Total Population",
            Count: stats.totalPopulation,
            Change: "", // You may adjust if you want dynamic text here
            Description: "Total residents",
          },
          {
            Title: "Total Households",
            Count: stats.totalHouseholds,
            Change: "",
            Description: "Registered households",
          },
          {
            Title: "Senior Citizens",
            Count: stats.seniorCount,
            Change: `${stats.seniorPercentage}%`,
            Description: "of population",
          },
          {
            Title: "PWD Residents",
            Count: stats.pwdCount,
            Change: `${stats.pwdPercentage}%`,
            Description: "of population",
          },
          {
            Title: "Solo Parents",
            Count: stats.soloParentCount,
            Change: `${stats.soloParentPercentage}%`,
            Description: "of population",
          },
          {
            Title: "OFW Members",
            Count: stats.ofwCount,
            Change: `${stats.ofwPercentage}%`,
            Description: "of population",
          },
          {
            Title: "Immigrants",
            Count: stats.immigrantCount,
            Change: `${stats.immigrantPercentage}%`,
            Description: "of population",
          },
          {
            Title: "Out of School Youth",
            Count: stats.osyCount,
            Change: `${stats.osyPercentage}%`,
            Description: "of population",
          },
          // ...certificateSummary,
        ]);

        // Build ageData from the API's ageGroups data. Only include groups with count > 0.
        const ageGroups = stats.ageGroups || {};
        const processedAgeData = Object.keys(ageGroups)
          .filter((key) => ageGroups[key].count > 0)
          .map((key) => ({
            name: key,
            value: ageGroups[key].count,
            percentage: ageGroups[key].percentage,
          }));
        setAgeData(processedAgeData);

        // Build special sectors data
        const processedSectorsData = [
          { Category: "Senior Citizens", Count: stats.seniorCount },
          { Category: "PWD", Count: stats.pwdCount },
          { Category: "Solo Parents", Count: stats.soloParentCount },
          { Category: "OFW Members", Count: stats.ofwCount },
          { Category: "Immigrants", Count: stats.immigrantCount },
          { Category: "Out of School Youth", Count: stats.osyCount },
        ].filter((item) => item.Count > 0);
        setSpecialSectorsData(processedSectorsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getCertificateIssuedList = async () => {
    try {
      const res = await axiosInstance.get(
        `/certificates?filterType=${timePeriod}&filterValue=${selectedValue}`
      );
      // const res = await axios.get(`http://localhost:8003/api/certificates`);
      if (res.data && res.data.success) {
        const resData = res.data.certRecords;
        console.log("dsada:", resData);

        setCertificatesIssuedListData(resData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getReports();

    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);

    if (!checkPermission(user, PERMISSIONS.REPORTS)) {
      setShowErrorModal(true);
      return;
    }
  }, []);

  useEffect(() => {
    getCertificateIssuedList();
  }, []);

  // The timePeriod and families processing have been removed,
  // because backend API provides aggregated statistics.

  // const handleTimePeriodChange = (e) => {
  //   setTimePeriod(e.target.value);
  //   // If needed, trigger a new API call with period parameter (not shown here)
  // };

  useEffect(() => {
    // alert(timePeriod + " : " + selectedValue);
    getReports();
  }, [timePeriod, selectedValue]);

  const exportReport = async () => {
    if (!checkPermission(currentUser, PERMISSIONS.REPORTS)) {
      setShowErrorModal(true);
      return;
    }

    try {
      await axiosInstance.post("/system-logs", {
        action: "Download",
        module: "Analytics Report Export",
        user: JSON.parse(localStorage.getItem("userId") || '""'),
        details: `User ${
          currentUser?.username || "unknown"
        } exported an analytics report on ${new Date().toLocaleString()}`,
      });
    } catch (error) {
      console.error("Error logging export action:", error);
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(20);
    doc.text("Barangay Darasa Analytics Report", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      30,
      { align: "center" }
    );

    // Using first summaryData change text or fallback text
    const periodDisplay = summaryData[0]?.change || timePeriod;
    doc.text(`Period: ${periodDisplay}`, pageWidth / 2, 40, {
      align: "center",
    });

    doc.setFontSize(16);
    doc.text("Summary Statistics", 14, 50);

    const summaryTableData = summaryData.map((item) => [
      item.title,
      item.value.toString(),
      item.change,
    ]);

    doc.autoTable({
      startY: 55,
      head: [["Category", "Value", "Change"]],
      body: summaryTableData,
      theme: "grid",
      headStyles: { fillColor: [66, 153, 225] },
      styles: { fontSize: 12 },
    });

    doc.setFontSize(16);
    doc.text("Population by Age Group", 14, doc.lastAutoTable.finalY + 20);

    const ageTableData = ageData.map((item) => [
      item.name,
      item.value.toString(),
      `${item.percentage}%`,
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 25,
      head: [["Age Group", "Count", "Percentage"]],
      body: ageTableData,
      theme: "grid",
      headStyles: { fillColor: [66, 153, 225] },
    });

    doc.setFontSize(16);
    doc.text("Special Sectors Distribution", 14, doc.lastAutoTable.finalY + 20);

    const sectorsTableData = specialSectorsData.map((item) => [
      item.name,
      item.value.toString(),
      `${((item.value / (summaryData[0]?.value || 1)) * 100).toFixed(1)}%`,
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 25,
      head: [["Sector", "Count", "Percentage"]],
      body: sectorsTableData,
      theme: "grid",
      headStyles: { fillColor: [66, 153, 225] },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    const period = timePeriod.toLowerCase();
    doc.save(
      `Barangay_Darasa_Analytics_${period}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    toast.success("Report exported successfully!");
  };

  // const exportReportExcel = async () => {
  //   const worksheet = XLSX.utils.json_to_sheet(summaryData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");

  //   // Define custom header styling
  //   const headerStyle = {
  //     fill: { fgColor: { rgb: "1F53DD" } }, // Blue background
  //     font: { color: { rgb: "FFFFFF" }, bold: true }, // White bold font
  //     alignment: { horizontal: "center", vertical: "center" },
  //   };

  //   const dataStyle = {
  //     fill: {
  //       patternType: "solid",
  //       fgColor: { rgb: "FFF2F2F2" }, // Light gray
  //     },
  //     font: {
  //       color: { rgb: "FF000000" }, // Black
  //     },
  //     alignment: {
  //       horizontal: "left",
  //       vertical: "center",
  //     },
  //   };

  //   // Manually set header row with styling
  //   const headers = Object.keys(summaryData[0]);
  //   headers.forEach((headerText, idx) => {
  //     const cellAddress = XLSX.utils.encode_cell({ r: 0, c: idx });
  //     worksheet[cellAddress] = {
  //       v: headerText,
  //       s: headerStyle,
  //     };
  //   });

  //   // Style data rows
  //   summaryData.forEach((summary, rowIdx) => {
  //     headers.forEach((key, colIdx) => {
  //       const cellAddress = XLSX.utils.encode_cell({
  //         r: rowIdx + 1,
  //         c: colIdx,
  //       }); // +1 to skip header
  //       if (!worksheet[cellAddress]) return; // if cell already set by json_to_sheet

  //       worksheet[cellAddress].s = dataStyle;
  //     });
  //   });

  //   // Apply column widths (optional, adjust as needed)
  //   worksheet["!cols"] = headers.map(() => ({ wch: 25 }));

  //   const excelBuffer = XLSX.write(workbook, {
  //     bookType: "xlsx",
  //     type: "array",
  //   });

  //   const fileData = new Blob([excelBuffer], {
  //     type: "application/octet-stream",
  //   });

  //   const fileName = `Brgy-Summary-${timePeriod}-${
  //     selectedValue ? selectedValue : "0"
  //   }.xlsx`;
  //   saveAs(fileData, fileName);

  //   await axiosInstance.post("/system-logs", {
  //     action: "Download",
  //     module: "Analytics Report Export",
  //     user: JSON.parse(localStorage.getItem("userId") || '""'),
  //     details: `User ${
  //       currentUser?.username || "unknown"
  //     } exported an analytics report on ${new Date().toLocaleString()}`,
  //   });

  //   toast.success("Summary report exported!");
  // };

  const exportReportExcel = async () => {
    const workbook = XLSX.utils.book_new();

    // Define styles
    const headerStyle = {
      fill: { patternType: "solid", fgColor: { rgb: "1F53DD" } },
      font: { color: { rgb: "FFFFFF" }, bold: true },
      alignment: { horizontal: "center", vertical: "center" },
    };

    const dataStyle = {
      fill: { patternType: "solid", fgColor: { rgb: "F2F2F2" } },
      font: { color: { rgb: "000000" } },
      alignment: { horizontal: "left", vertical: "center" },
    };

    // Helper function to convert JSON data to styled AoA
    const buildSection = (data, applyStyle = true) => {
      if (!data || data.length === 0) return [];

      const headers = Object.keys(data[0]);
      const section = [];

      // Header row
      section.push(headers.map((header) => ({ v: header, s: headerStyle })));

      // Data rows
      data.forEach((row) => {
        const styledRow = headers.map((key) => ({
          v: row[key],
          s: applyStyle ? dataStyle : undefined,
        }));
        section.push(styledRow);
      });

      return section;
    };

    // Combine sections with spacing
    let fullData = [];

    fullData = fullData.concat(buildSection(summaryData));
    fullData.push([]); // Empty row

    fullData = fullData.concat(buildSection(specialSectorsData));
    fullData.push([]); // Empty row

    fullData = fullData.concat(buildSection(certSumData));

    // Create sheet from AoA
    const worksheet = XLSX.utils.aoa_to_sheet(fullData);

    // Optional: Set column widths
    const widestSection = [summaryData, specialSectorsData, certSumData].reduce(
      (acc, cur) => {
        if (cur && cur.length > 0 && Object.keys(cur[0]).length > acc)
          return Object.keys(cur[0]).length;
        return acc;
      },
      0
    );
    worksheet["!cols"] = Array(widestSection).fill({ wch: 25 });

    // Append and export
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    const fileName = `Brgy-Summary-${timePeriod}-${selectedValue || "0"}.xlsx`;
    saveAs(fileData, fileName);

    // Log system activity
    await axiosInstance.post("/system-logs", {
      action: "Download",
      module: "Analytics Report Export",
      user: JSON.parse(localStorage.getItem("userId") || '""'),
      details: `User ${
        currentUser?.username || "unknown"
      } exported an analytics report on ${new Date().toLocaleString()}`,
    });

    toast.success("Summary report exported!");
  };

  const COLORS = [
    "#4C51BF",
    "#48BB78",
    "#4299E1",
    "#ED8936",
    "#9F7AEA",
    "#ED64A6",
  ];

  const NoDataMessage = () => (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#666",
        fontStyle: "italic",
      }}
    >
      No data available for the selected time period
    </div>
  );

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
    let value = "";
    switch (e.target.value) {
      case "Monthly":
        value = new Date().getMonth() + 1;
        break;
      case "Yearly":
        value = new Date().getFullYear();
        break;
      case "Quarterly":
        value = 1;
        break;
      default:
        value = new Date().getMonth() + 1;
    }
    setSelectedValue(value);
  };

  const handleValueChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const quarters = [
    { label: "Q1 (Jan - Mar)", value: 1 },
    { label: "Q2 (Apr - Jun)", value: 2 },
    { label: "Q3 (Jul - Sep)", value: 3 },
    { label: "Q4 (Oct - Dec)", value: 4 },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 26 }, (_, i) => ({
    label: `${currentYear - i}`,
    value: currentYear - i,
  }));

  const COLORSSPEC = ["#4299E1", "#48BB78", "#ED8936", "#F56565", "#9F7AEA"];

  const certificateColors = [
    "#4299E1", // Barangay Clearance
    "#48BB78", // Certificate of Residency
    "#38B2AC", // Certification of Residency
    "#ED8936", // Certificate of Appearance
    "#F56565", // Certificate of Good Moral
    "#9F7AEA", // Barangay Certification
    "#ECC94B", // Barangay Health Certification
    "#A0AEC0", // Certification of Mortuary
    "#F6AD55", // Permit to Travel
    "#FC8181", // Certification of Business Closure
    "#68D391", // Certificate of Indigency
    "#63B3ED", // Certificate of No Income
    "#B794F4", // Certificate of Income
    "#F687B3", // Libreng Tulong Hatid
    "#4FD1C5", // Certification of Late Registration
    "#FBD38D", // Oath of Undertaking
    "#CBD5E0", // Sworn Affidavit of the Barangay Council
    "#81E6D9", // Certification of Live In Partner
    "#FBB6CE", // Certification of Relationship
    "#A3BFFA", // Solo Parent Certification
  ];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div className="welcome-section">
          <div className="brgy-logo-container">
            <img
              src="/images/darasa-logo.png"
              alt="Darasa Logo"
              className="brgy-logo"
              onError={(e) => console.error("Error loading image:", e)}
            />
          </div>
          <div className="title-section">
            <h1>Barangay Darasa</h1>
            <p>Profiling System Analytics Dashboard</p>
          </div>
          <div className="controls-section">
            {/* <select
              className="time-select"
              value={timePeriod}
              onChange={handleTimePeriodChange}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select> */}
            <select
              className="time-select"
              value={timePeriod}
              onChange={handleTimePeriodChange}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>

            {/* Sub Filter based on timePeriod */}
            {timePeriod === "Monthly" && (
              <select value={selectedValue} onChange={handleValueChange}>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            )}

            {timePeriod === "Quarterly" && (
              <select value={selectedValue} onChange={handleValueChange}>
                {quarters.map((quarter) => (
                  <option key={quarter.value} value={quarter.value}>
                    {quarter.label}
                  </option>
                ))}
              </select>
            )}

            {timePeriod === "Yearly" && (
              <select value={selectedValue} onChange={handleValueChange}>
                {years.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            )}
            <button className="export-button" onClick={exportReportExcel}>
              Export Report
            </button>
          </div>
        </div>

        <div className="summary-grid">
          {summaryData.map((item, index) => (
            <div key={index} className="summary-card">
              <div className="card-content">
                <p className="card-title">{item.Title}</p>
                <div className="value-section">
                  <h2 className="card-value">{item.Count}</h2>
                  <span className="card-change">
                    <ArrowUpIcon className="h-4 w-4" />
                    {item.Change}
                  </span>
                </div>
                <p className="card-subtext">{item.Description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="charts-grid">
          <div className="chart-container">
            <h3 className="chart-title">Population by Age Group</h3>
            <div className="chart-content">
              {ageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={ageData}
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      innerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                      }
                    >
                      {ageData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Population"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <NoDataMessage />
              )}
            </div>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Special Sectors Distribution</h3>
            <div className="chart-content">
              {specialSectorsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={specialSectorsData}
                    layout="vertical"
                    margin={{ left: 150 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="Category" width={140} />
                    <Tooltip
                      formatter={(value) => [`${value} residents`, ""]}
                    />
                    <Legend />
                    <Bar
                      dataKey="Count"
                      radius={[0, 4, 4, 0]}
                      label={{ position: "right", formatter: (value) => value }}
                    >
                      {specialSectorsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORSSPEC[index % COLORSSPEC.length]} // cycle through COLORS
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <NoDataMessage />
              )}
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Certificates Issued Count</h3>
          <div className="chart-content">
            {certSumData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={certSumData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Certificate" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Count">
                    {certSumData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          certificateColors[index % certificateColors.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataMessage />
            )}
          </div>
        </div>

        <div className="certificate-issued-container">
          <p>List of Certificates Issued</p>
          <div className="certificate-issued-inner-container">
            {certificatesIssuedListData.map((certificate, index) => {
              const personData = certificate.data[0]; // first and only data object
              const issuedTo = personData?.requestedBy || "Unknown";
              const timestamp = new Date(
                certificate.timestamp
              ).toLocaleString();

              return (
                <div className="certificate-issued" key={index}>
                  <p>
                    <span style={{
                                  color:
                                    certificateColors[
                                      index % certificateColors.length
                                    ],
                                }}>{certificate.type}</span> was issued to
                    <span style={{
                                  color:
                                    certificateColors[
                                      index % certificateColors.length
                                    ],
                                }}> {issuedTo} </span> by{" "}
                    <span style={{
                                  color:
                                    certificateColors[
                                      index % certificateColors.length
                                    ],
                                }}>{certificate.printedBy?.username || "N/A"}</span> on{" "}
                    <span style={{
                                  color:
                                    certificateColors[
                                      index % certificateColors.length
                                    ],
                                }}>{timestamp}</span>
                  </p>
                  <p>Details</p>
                  <div className="certificate-issued-details">
                    {personData &&
                      Object.entries(personData).map(([key, value], i) => {
                        // Format key: from "dateOfIssuance" → "Date Of Issuance"
                        const formattedKey = key
                          .replace(/([A-Z])/g, " $1") // Add space before capital letters
                          .replace(/^./, (char) => char.toUpperCase()); // Capitalize first letter

                        return (
                          <p key={i}>
                            <strong>
                              <span
                                style={{
                                  color:
                                    certificateColors[
                                      index % certificateColors.length
                                    ],
                                }}
                              >
                                {formattedKey}:
                              </span>
                            </strong>{" "}
                            {value}
                          </p>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <PermissionErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default AnalyticsDashboard;
