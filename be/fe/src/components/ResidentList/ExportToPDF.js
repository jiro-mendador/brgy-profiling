import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useContext } from "react";
import { UserContext } from "../../contexts/userContext";
import axiosInstance from "../../axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

const ExportToPDF = ({ data, label, icon, type }) => {
  const { currentUser } = useContext(UserContext);

  const generatePDF = async (e) => {
    e.stopPropagation();
    const doc = new jsPDF();
    let residents = data;

    const darasa = "../../public/images/darasa-logo.png";
    const system = "../../public/images/system-logo.png";
    const tanauan = "../../public/images/tanauan-logo.png";

    // ==== ADD HEADER TEXT ====
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Baranggay Darasa Resident Information Report", 105, 20, {
      align: "center",
    });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const today = new Date();
    const formatted = `${
      today.getMonth() + 1
    }/${today.getDate()}/${today.getFullYear()}`;
    doc.text(`Date Printed: ${formatted}`, 105, 28, {
      align: "center",
    });
    doc.text(
      `Prepared By: ${currentUser.username} (${currentUser.role})`,
      105,
      34,
      {
        align: "center",
      }
    );

    if (type) {
      doc.text(`Report Type: ${type} Residents`, 105, 40, {
        align: "center",
      });
    }

    doc.setDrawColor(0);
    doc.line(10, 44, 200, 44); // line after header

    let currentY = 50;

    // Helper to convert object to rows
    const formatObjectToRows = (obj) =>
      Object.entries(obj).map(([key, value]) => ({
        field: key,
        value:
          value === null || value === undefined
            ? "N/A"
            : typeof value === "boolean"
            ? value
              ? "Yes"
              : "No"
            : value.toString(),
      }));

    residents.forEach((resident, i) => {
      if (i > 0) {
        doc.addPage(); // add new page for each household
        currentY = 20;
      }

      // HEADER
      doc.setFontSize(14);
      if (residents.length > 1) {
        doc.text(`Household ${i + 1}: ${resident.householdNo}`, 14, currentY);
      } else {
        doc.text(`Household : ${resident.householdNo}`, 14, currentY);
      }

      // HEAD & SPOUSE
      const headSpouseFields = {
        "Household No": resident.householdNo,
        "Relationship To Head": resident.relationshipToHouseHoldHead,
        "House/Lot/Block No": resident.houseLotBlockNo,

        // Head
        "Head Name": `${resident.headFirstName} ${resident.headMiddleName} ${resident.headLastName}`,
        "Head Age": resident.headAge,
        "Head Birthday": resident.headBirthday,
        "Head Sex": resident.headSex,
        "Head Nationality": resident.headNationality,
        "Head Ethnicity": resident.headEthnicity,
        "Head Religion": resident.headReligion,
        "Head Place of Birth": resident.headPlaceOfBirth,
        "Head Marital Status": resident.headMaritalStatus,
        "Head School Level": resident.headSchoolLevel,
        "Head Place of School": resident.headPlaceOfSchool,
        "Head Education": resident.headHighestLevelOfEducation,

        // Spouse
        "Spouse Name": `${resident.spouseFirstName} ${resident.spouseMiddleName} ${resident.spouseLastName}`,
        "Spouse Age": resident.spouseAge,
        "Spouse Birthday": resident.spouseBirthday,
        "Spouse Sex": resident.spouseSex,
        "Spouse Nationality": resident.spouseNationality,
        "Spouse Ethnicity": resident.spouseEthnicity,
        "Spouse Religion": resident.spouseReligion,
        "Spouse Place of Birth": resident.spousePlaceOfBirth,
        "Spouse Marital Status": resident.spouseMaritalStatus,
        "Spouse School Level": resident.spouseSchoolLevel,
        "Spouse Place of School": resident.spousePlaceOfSchool,
        "Spouse Relationship to Head":
          resident.spouseRelationshipToHouseHoldHead,
        "Spouse Registered Voter": resident.spouseIsRegisteredVoter
          ? "Yes"
          : "No",
      };

      autoTable(doc, {
        head: [["Head & Spouse Info", "Value"]],
        body: formatObjectToRows(headSpouseFields).map((row) => [
          row.field,
          row.value,
        ]),
        startY: currentY + 3,
      });

      // ADDITIONAL INFO
      const additional = resident.additionalInfos?.[0] || {};
      autoTable(doc, {
        head: [["Additional Information", "Value"]],
        body: formatObjectToRows(additional).map((row) => [
          row.field,
          row.value,
        ]),
        startY: doc.lastAutoTable.finalY + 10,
      });

      // FAMILY MEMBERS
      const members = resident.familyMembers || [];
      members.forEach((member, idx) => {
        autoTable(doc, {
          head: [[`Family Member ${idx + 1}`, "Value"]],
          body: formatObjectToRows(member).map((row) => [row.field, row.value]),
          startY: doc.lastAutoTable.finalY + 10,
        });
      });
    });

    let fileName = "Resident-List";
    if (residents.length <= 1) {
      fileName = `Household-${residents[0].householdNo}`;
    }
    doc.save(fileName + `-${formatted}.pdf`);

    await axiosInstance.post("/system-logs", {
      action: "Download",
      module: "Resident Management",
      user: JSON.parse(localStorage.getItem("userId") || '""'), // Ensures proper formatting
      details: `User ${currentUser.username} exported ${fileName}${
        type && type !== "All" ? ` of type ${type}` : ""
      } report on ${formatted}`,
    });

    toast.success("Data exported successfully!");
  };

  return (
    <button className="export-all-indiv-button" onClick={generatePDF}>
      {icon && <i className="fas fa-file"></i>}
      {label}
    </button>
  );
};

const ExportToExcel = ({ data, label, icon, type }) => {
  const { currentUser } = useContext(UserContext);
  const today = new Date();
  const formatted = `${
    today.getMonth() + 1
  }/${today.getDate()}/${today.getFullYear()}`;

  const exportToExcel = async (e) => {
    e.stopPropagation();
    // Prepare data: flatten each resident
    const residents = data.map((res) => ({
      "Household No": res.householdNo,
      Cluster: res.cluster,
      "Brgy Health Worker": res.brgyHealthWorker,
      "House Lot Block No": res.houseLotBlockNo,
      "Door Input": res.doorInput,
      "4Ps ID No": res.fourPsIdNo,

      // Head of the Household
      "Head Name": `${res.headFirstName} ${res.headMiddleName || ""} ${
        res.headLastName
      }`,
      "Head Age": res.headAge,
      "Head Sex": res.headSex,
      "Head Birthday": new Date(res.headBirthday).toLocaleDateString(),
      "Head Place of Birth": res.headPlaceOfBirth,
      "Head Nationality": res.headNationality,
      "Head Marital Status": res.headMaritalStatus,
      "Head Religion": res.headReligion,
      "Head Ethnicity": res.headEthnicity,
      "Head Highest Level of Education": res.headHighestLevelOfEducation,
      "Head School Level": res.headSchoolLevel,
      "Head Place of School": res.headPlaceOfSchool,

      // Spouse Information
      "Spouse Name": `${res.spouseFirstName || ""} ${res.spouseLastName || ""}`,
      "Spouse Age": res.spouseAge || "",
      "Spouse Sex": res.spouseSex,
      "Spouse Birthday": res.spouseBirthday
        ? new Date(res.spouseBirthday).toLocaleDateString()
        : "",
      "Spouse Place of Birth": res.spousePlaceOfBirth,
      "Spouse Nationality": res.spouseNationality,
      "Spouse Marital Status": res.spouseMaritalStatus,
      "Spouse Religion": res.spouseReligion,
      "Spouse Ethnicity": res.spouseEthnicity,
      "Spouse Registered Voter": res.spouseIsRegisteredVoter ? "Yes" : "No",
      "Spouse School Level": res.spouseSchoolLevel,
      "Spouse Place of School": res.spousePlaceOfSchool,

      ...Object.fromEntries(
        res.familyMembers?.flatMap((member, index) => [
          [`Family Member #${index + 1} First Name`, member.firstName || ""],
          [`Family Member #${index + 1} Middle Name`, member.middleName || ""],
          [`Family Member #${index + 1} Last Name`, member.lastName || ""],
          [
            `Family Member #${index + 1} Relationship`,
            member.relationship || "",
          ],
          [`Family Member #${index + 1} Age`, member.age || ""],
          [`Family Member #${index + 1} Sex`, member.sex || ""],
          [`Family Member #${index + 1} Birthday`, member.birthday || ""],
          [
            `Family Member #${index + 1} Place of Birth`,
            member.placeOfBirth || "",
          ],
          [`Family Member #${index + 1} Nationality`, member.nationality || ""],
          [
            `Family Member #${index + 1} Marital Status`,
            member.maritalStatus || "",
          ],
          [`Family Member #${index + 1} Religion`, member.religion || ""],
          [`Family Member #${index + 1} Ethnicity`, member.ethnicity || ""],
          [
            `Family Member #${index + 1} Registered Voter`,
            member.isRegisteredVoter ? "Yes" : "No",
          ],
          [
            `Family Member #${index + 1} School Level`,
            member.schoolLevel || "",
          ],
          [
            `Family Member #${index + 1} Place of School`,
            member.placeOfSchool || "",
          ],
        ])
      ),

      ...Object.fromEntries(
        res.additionalInfos?.flatMap((info, index) => [
          [`Add. Info #${index + 1} Name`, info.name || ""],
          [`Add. Info #${index + 1} Pregnant`, info.pregnant || ""],
          [
            `Add. Info #${index + 1} Months Pregnant`,
            info.pregnantMonths || "",
          ],
          [
            `Add. Info #${index + 1} Family Planning`,
            info.familyPlanning || "",
          ],
          [`Add. Info #${index + 1} PWD`, info.pwd || ""],
          [`Add. Info #${index + 1} Solo Parent`, info.soloParent || ""],
          [`Add. Info #${index + 1} Senior Citizen`, info.seniorCitizen || ""],
          [`Add. Info #${index + 1} Maintenance`, info.maintenance || ""],
          [`Add. Info #${index + 1} PhilHealth`, info.philhealth || ""],
          [`Add. Info #${index + 1} House Lot`, info.houseLot || ""],
          [`Add. Info #${index + 1} Water Supply`, info.waterSupply || ""],
          [`Add. Info #${index + 1} Comfort Room`, info.comfortRoom || ""],
          [`Add. Info #${index + 1} OFW Country`, info.ofwCountry || ""],
          [
            `Add. Info #${index + 1} Years in Service`,
            info.yearsInService || "",
          ],
          [`Add. Info #${index + 1} Out of School`, info.outOfSchool || ""],
          [
            `Add. Info #${index + 1} Immigrant Nationality`,
            info.immigrantNationality || "",
          ],
          [`Add. Info #${index + 1} Years of Stay`, info.yearsOfStay || ""],
          [`Add. Info #${index + 1} Residence`, info.residence || ""],
        ])
      ),

      // // Family Members
      // "Family Members": res.familyMembers
      //   .map((member, index) => {
      //     return `Family Member #${index + 1}
      //   - First Name: ${member.firstName}
      //   - Middle Name: ${member.middleName}
      //   - Last Name: ${member.lastName}
      //   - Relationship: ${member.relationship}
      //   - Age: ${member.age}
      //   - Sex: ${member.sex}
      //   - Birthday: ${member.birthday}
      //   - Place of Birth: ${member.placeOfBirth}
      //   - Nationality: ${member.nationality}
      //   - Marital Status: ${member.maritalStatus}
      //   - Religion: ${member.religion}
      //   - Ethnicity: ${member.ethnicity}
      //   - Registered Voter: ${member.isRegisteredVoter ? "Yes" : "No"}
      //   - School Level: ${member.schoolLevel}
      //   - Place of School: ${member.placeOfSchool}`;
      //   })
      //   .join("\n\n"),

      // // Additional Information
      // "Additional Info": res.additionalInfos
      //   .map((info, index) => {
      //     return `Additional Info #${index + 1}
      //   - Name: ${info.name}
      //   - Pregnant: ${info.pregnant}
      //   - Months Pregnant: ${info.pregnantMonths}
      //   - Family Planning: ${info.familyPlanning}
      //   - PWD: ${info.pwd}
      //   - Solo Parent: ${info.soloParent}
      //   - Senior Citizen: ${info.seniorCitizen}
      //   - Maintenance: ${info.maintenance}
      //   - PhilHealth: ${info.philhealth}
      //   - House Lot: ${info.houseLot}
      //   - Water Supply: ${info.waterSupply}
      //   - Comfort Room: ${info.comfortRoom}
      //   - OFW Country: ${info.ofwCountry}
      //   - Years in Service: ${info.yearsInService}
      //   - Out of School: ${info.outOfSchool}
      //   - Immigrant Nationality: ${info.immigrantNationality}
      //   - Years of Stay: ${info.yearsOfStay}
      //   - Residence: ${info.residence}`;
      //   })
      //   .join("\n\n"),

      // // Family Members
      // "Family Members": res.familyMembers
      //   .map((member) => {
      //     return `${member.firstName} ${member.lastName} (${member.relationship}, Age: ${member.age}, Sex: ${member.sex})`;
      //   })
      //   .join(", "),

      // // Additional Information
      // "Additional Info": res.additionalInfos
      //   .map((info) => {
      //     return `Name: ${info.name}, Pregnant: ${info.pregnant}, Months Pregnant: ${info.pregnantMonths}, Family Planning: ${info.familyPlanning}, PWD: ${info.pwd}, Solo Parent: ${info.soloParent}, Senior Citizen: ${info.seniorCitizen}, Maintenance: ${info.maintenance}, PhilHealth: ${info.philhealth}, House Lot: ${info.houseLot}, Water Supply: ${info.waterSupply}, Comfort Room: ${info.comfortRoom}, OFW Country: ${info.ofwCountry}, Years in Service: ${info.yearsInService}, Out of School: ${info.outOfSchool}, Immigrant Nationality: ${info.immigrantNationality}, Years of Stay: ${info.yearsOfStay}, Residence: ${info.residence}`;
      //   })
      //   .join(", "),
    }));

    // Create worksheet and workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(residents);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Residents");

    // Define custom header styling
    const headerStyle = {
      fill: { fgColor: { rgb: "1F53DD" } }, // Blue background
      font: { color: { rgb: "FFFFFF" }, bold: true }, // White bold font
      alignment: { horizontal: "center", vertical: "center" },
    };

    // const dataStyle = {
    //   fill: {
    //     patternType: "solid",
    //     fgColor: { rgb: "FFF2F2F2" }, // Light gray
    //   },
    //   font: {
    //     color: { rgb: "FF000000" }, // Black
    //   },
    //   alignment: {
    //     horizontal: "left",
    //     vertical: "center",
    //   },
    // };

    // const getDataStyle = (data) => {
    //   return {
    //     fill: {
    //       patternType: "solid",
    //       fgColor: { rgb: "FFF2F2F2" }, // Light gray
    //     },
    //     font: {
    //       color: { rgb: "FF000000" }, // Black
    //     },
    //     alignment: {
    //       horizontal: typeof data === "number" ? "center" : "left", // Center for numbers, left for others
    //       vertical: "center",
    //     },
    //   };
    // };


    // Manually set header row with styling
    // const headers = Object.keys(residents[0]);
    const headers = Array.from(
      new Set(residents.flatMap((resident) => Object.keys(resident)))
    );

    headers.forEach((headerText, idx) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: idx });
      worksheet[cellAddress] = {
        v: headerText,
        s: headerStyle,
      };
    });

    residents.forEach((resident, rowIdx) => {
      headers.forEach((key, colIdx) => {
        const cellAddress = XLSX.utils.encode_cell({
          r: rowIdx + 1, // +1 to skip header
          c: colIdx,
        });

        // Set default empty string if the cell doesn't exist
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { v: "", t: "s" }; // set empty string if no value
        }

        // Adjust data style dynamically based on the data type (number or not)
        const dataStyle = {
          fill: {
            patternType: "solid",
            fgColor: { rgb: "FFF2F2F2" }, // Light gray
          },
          font: {
            color: { rgb: "FF000000" }, // Black
          },
          alignment: {
            horizontal: typeof resident[key] === "number" ? "center" : "left", // Center for numbers, left for others
            vertical: "center",
          },
        };

        // Apply the style to the current cell
        worksheet[cellAddress].s = dataStyle;
      });
    });

    // // Style data rows
    // residents.forEach((resident, rowIdx) => {
    //   headers.forEach((key, colIdx) => {
    //     const cellAddress = XLSX.utils.encode_cell({
    //       r: rowIdx + 1,
    //       c: colIdx,
    //     }); // +1 to skip header
    //     if (!worksheet[cellAddress]) {
    //       worksheet[cellAddress] = { v: "", t: "s" }; // set empty string if no value
    //     }
    //     worksheet[cellAddress].s = dataStyle;
    //     // if (!worksheet[cellAddress]) return; // if cell already set by json_to_sheet

    //     // worksheet[cellAddress].s = dataStyle;
    //   });
    // });

    // Apply column widths (optional, adjust as needed)
    worksheet["!cols"] = headers.map(() => ({ wch: 50 }));

    // Export Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    let fileName = "Resident-List";
    if (residents.length <= 1) {
      fileName = `Household-${residents[0]["Household No"]}`;
    }

    if (type) {
      saveAs(fileData, `${type} ${fileName}-${formatted}.xlsx`);
    } else {
      saveAs(fileData, `${fileName}-${formatted}.xlsx`);
    }

    await axiosInstance.post("/system-logs", {
      action: "Download",
      module: "Resident Management",
      user: JSON.parse(localStorage.getItem("userId") || '""'), // Ensures proper formatting
      details: `User ${currentUser.username} exported ${fileName}${
        type && type !== "All" ? ` of type ${type}` : ""
      } report on ${formatted}`,
    });

    toast.success("Data exported successfully!");
  };

  return (
    <button className="export-all-indiv-button" onClick={exportToExcel}>
      {icon && <i className="fas fa-file"></i>}
      {label}
    </button>
  );
};

export default ExportToExcel;
