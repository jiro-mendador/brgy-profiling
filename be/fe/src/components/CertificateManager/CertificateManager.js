import React, { useState, useMemo, useEffect } from "react";
import { Search, Download, FileText } from "lucide-react";
import { logActivity } from "../../utils/auditLogger";
import {
  checkPermission,
  handlePermissionError,
  PERMISSIONS,
} from "../Permission/Permissions";
import PermissionErrorModal from "../Permission/PermissionErrorModal";
import "./CertificateManager.css";
import axiosInstance from "../../axios";
import { toast } from "react-toastify";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

const CertificateManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadStatus, setDownloadStatus] = useState({
    loading: false,
    error: null,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [barangayClearanceData, setBarangayClearanceData] = useState({
    name: "",
    birthPlace: "",
    age: "",
    civilStatus: "",
    birthday: "",
    parents: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [residencyDatav1, setResidencyDatav1] = useState({
    name: "",
    age: "",
    nationality: "",
    gender: "",
    civilStatus: "",
    streetAddress: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [residencyDatav2, setResidencyDatav2] = useState({
    name: "",
    age: "",
    streetAddress: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [appearanceData, setAppearanceData] = useState({
    name: "",
    appearanceDate: "",
    eventProgram: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [goodMoralData, setGoodMoralData] = useState({
    name: "",
    age: "",
    streetAddress: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [brgyCertData, setBrgyCertData] = useState({
    name: "",
    // age: "",
    birthday: "",
    parents: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [healthData, setHealthData] = useState({
    name: "",
    age: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [mortuaryData, setMortuaryData] = useState({
    name: "",
    age: "",
    streetAddress: "",
    dateOfDeath: "",
    cause: "",
    seniorID: "",
    seniorIssuanceDate: "",
    heirName: "",
    requestorLastName: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [travelData, setTravelData] = useState({
    name: "",
    civilStatus: "",
    age: "",
    location: "",
    thingsOrAnimalsCarrying: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [businessPermitData, setBusinessPermitData] = useState({
    name: "",
    civilStatus: "",
    age: "",
    location: "",
    thingsOrAnimalsCarrying: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [businessClosureData, setBusinessClosureData] = useState({
    name: "",
    businessName: "",
    closureDate: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [indigencyData, setIndigencyData] = useState({
    name: "",
    age: "",
    gender: "",
    civilStatus: "",
    streetAddress: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [noIncomeData, setNoIncomeData] = useState({
    name: "",
    age: "",
    streetAddress: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [incomeData, setIncomeData] = useState({
    name: "",
    age: "",
    streetAddress: "",
    businessName: "",
    income: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [tulongHatidData, setTulongHatidData] = useState({
    name: "",
    age: "",
    streetAddress: "",
    beneficiaryRelationship: "",
    beneficiaryName: "",
    dateOfDeath: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [lateRegData, setLateRegData] = useState({
    name: "",
    gender: "",
    birthday: "",
    birthplace: "",
    parents: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [oathData, setOathData] = useState({
    name: "",
    age: "",
    streetAddress: "",
    yearsOfResidence: "",
    dateSigned: "",
    validUntil: "",
  });

  const [councilAffidavitData, setCouncilAffidavitData] = useState({
    name: "",
    nationality: "",
    streetAddress: "",
    setHandDate: "",
    dateSworned: "",
  });

  const [liveInData, setLiveInData] = useState({
    partnersName: "",
    streetAddress: "",
    since: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [relationshipData, setRelationshipData] = useState({
    name: "",
    age: "",
    streetAddress: "",
    daughterInLawName: "",
    daughterInLawAge: "",
    daughterInLawBirthday: "",
    requestor: "",
    purpose: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  const [soloParentData, setSoloParentData] = useState({
    name: "",
    age: "",
    streetAddress: "",
    numberOfChildren: "",
    childrenNames: "",
    dateOfIssuance: "",
    validUntil: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    setCurrentUser(user);

    if (!checkPermission(user, PERMISSIONS.CERTIFICATES)) {
      setShowErrorModal(true);
      return;
    }
  }, []);

  const certificates = {
    "Personal Documents": [
      {
        name: "Barangay Clearance",
        description:
          "Official document certifying individual has no criminal record",
        templateUrls: [
          // "/templates/personal/barangay-clearance1.docx",
          "/templates/personal/barangay-clearance2.docx",
          // "/templates/personal/barangay-clearance3.docx",
        ],
      },
      {
        name: "Certificate of Residency",
        description: "Confirms current residence status in the barangay",
        templateUrls: [
          "/templates/personal/certificate-of-residency1.docx",
          // "/templates/personal/certificate-of-residency2.docx",
        ],
      },
      {
        name: "Certification of Residency",
        description:
          "Verifies long-term residency status and history in the barangay",
        templateUrls: "/templates/personal/certification-of-residency.docx",
      },
      {
        name: "Certificate of Appearance",
        description: "Certifies individual appeared at the barangay office",
        templateUrl: "/templates/personal/certificate-of-appearance.docx",
      },
      {
        name: "Certificate of Good Moral",
        description: "Attests to the good moral character of an individual",
        templateUrl: "/templates/personal/good-moral-certificate.docx",
      },
      {
        name: "Barangay Certification",
        description: "General purpose barangay certification",
        templateUrl: [
          "/templates/personal/certification-signedby-K.templo.docx",
          // "/templates/personal/certification-signedby-K.barrogo.docx",
          // "/templates/personal/certification-signedby-K.villegas.docx",
          // "/templates/personal/certification-signedby-K.onsay.docx",
          // "/templates/personal/certification-signedby-K.carandang.docx",
          // "/templates/personal/certification-signedby-K.arguilles-temp1.docx",
          // "/templates/personal/certification-signedby-K.arguilles-temp2.docx",
          // "/templates/personal/certification-signedby-K.sumargo-temp1.docx",
          // "/templates/personal/certification-signedby-K.sumargo-temp2.docx",
          // "/templates/personal/certification-signedby-K.castillo-temp1.docx",
          // "/templates/personal/certification-signedby-K.castillo-temp2.docx",
          // "/templates/personal/certification-signedby-K.castillo-temp3.docx",
          // "/templates/personal/certification-signedby-K.castillo-temp4.docx",
        ],
      },
    ],
    "Health Documents": [
      {
        name: "Barangay Health Certification",
        description: "Certifies health status of an individual",
        // templateUrl: "/templates/health/health-certification.docx",
        templateUrl: "/templates/health/health-certification1.docx",
      },
      {
        name: "Certification of Mortuary",
        description: "Documentation for mortuary services",
        // templateUrl: "/templates/health/mortuary-certification.docx",
        templateUrl: "/templates/health/mortuary-certificate.docx",
      },
    ],
    "Travel Documents": [
      {
        name: "Permit to Travel",
        description: "Authorization for travel purposes",
        templateUrl: "/templates/travel/travel-permit.docx",
      },
    ],
    "Business Documents": [
      // ! NO DOCS AVAILABLE FOR THIS ONE
      // {
      //   name: "Business Permit",
      //   description: "Official permit to operate a business in the barangay",
      //   templateUrl: "/templates/business/business-permit.docx",
      // },
      {
        name: "Certification of Business Closure",
        description: "Official certification of business cessation",
        templateUrl: "/templates/business/business-closure.docx",
      },
    ],
    "Financial Documents": [
      {
        name: "Certificate of Indigency",
        description:
          "Certifies individual as qualified for financial assistance",
        templateUrl: "/templates/financial/certificate-of-indigency.docx",
      },
      {
        name: "Certificate of No Income",
        description: "Confirms individual has no regular source of income",
        templateUrl: "/templates/financial/no-income-certificate.docx",
      },
      {
        name: "Certificate of Income",
        description: "Confirms individual has a regular source of income",
        templateUrl: "/templates/financial/income-certificate.docx",
      },
      {
        name: "Libreng Tulong Hatid",
        description:
          "Certification for financial assistance with funeral and transportation services for bereaved families",
        templateUrl: "/templates/financial/libreng-tulong-hatid.docx",
      },
    ],
    "Legal Documents": [
      {
        name: "Certification of Late Registration",
        description: "Confirms late registration of civil documents",
        templateUrl: "/templates/legal/late-registration-cert.docx",
      },
      {
        name: "Oath of Undertaking",
        description: "Legal sworn statement of commitment",
        templateUrl: "/templates/legal/oath-of-undertaking.docx",
      },
      {
        name: "Sworn Affidavit of the Barangay Council",
        description: "Official affidavit from the Barangay Council",
        templateUrl: "/templates/legal/council-affidavit.docx",
      },
    ],
    "Relationship Documents": [
      {
        name: "Certification of Live In Partner",
        description: "Confirms cohabitation status of partners",
        templateUrl: "/templates/relationship/live-in-partner-certificate.docx",
      },
      {
        name: "Certification of Relationship",
        description: "Verifies relationship between two individuals",
        templateUrl: "/templates/relationship/certificate-of-relationship.docx",
      },
    ],
    "Special Documents": [
      {
        name: "Solo Parent Certification",
        description: "Certifies status as a solo parent",
        templateUrl: "/templates/special/solo-parent-certificate.docx",
      },
    ],
  };

  const allDocuments = useMemo(() => {
    return Object.entries(certificates).flatMap(([category, docs]) =>
      docs.map((doc) => ({
        ...doc,
        category,
      }))
    );
  }, []);

  const filteredDocuments = useMemo(() => {
    if (!searchTerm) {
      return null;
    }

    const searchLower = searchTerm.toLowerCase();
    return allDocuments.filter((doc) => {
      const nameMatch = doc.name.toLowerCase().includes(searchLower);
      const descriptionMatch = doc.description
        .toLowerCase()
        .includes(searchLower);
      const templateMatch =
        (doc.templateUrl &&
          typeof doc.templateUrl === "string" &&
          doc.templateUrl.toLowerCase().includes(searchLower)) ||
        (doc.templateUrls &&
          Array.isArray(doc.templateUrls) &&
          doc.templateUrls.some((url) =>
            url.toLowerCase().includes(searchLower)
          ));

      return nameMatch || descriptionMatch || templateMatch;
    });
  }, [searchTerm, allDocuments]);

  const handleDownload = async (templateUrls, certName) => {
    if (!checkPermission(currentUser, PERMISSIONS.CERTIFICATES)) {
      setShowErrorModal(true);
      return;
    }
    setDownloadStatus({ loading: true, error: null });
    modifyWordFile(templateUrls, certName);

    // try {
    //   const baseUrl = window.location.origin;
    //   const urls = Array.isArray(templateUrls) ? templateUrls : [templateUrls];

    //   const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    //   const username = currentUser?.username || "systemadmin";

    //   await Promise.all(
    //     urls.map(async (templateUrl) => {
    //       const fullUrl = `${baseUrl}${templateUrl}`;

    //       const response = await fetch(fullUrl, {
    //         method: "GET",
    //         headers: {
    //           "Content-Type":
    //             "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    //         },
    //       });

    //       if (!response.ok) {
    //         throw new Error(`Failed to download template (${response.status})`);
    //       }

    //       const blob = await response.blob();
    //       const url = window.URL.createObjectURL(blob);
    //       const link = document.createElement("a");
    //       link.href = url;
    //       const filename = templateUrl.split("/").pop();
    //       link.download = filename;

    //       // // Log the download activity with proper user format
    //       // logActivity(username, 'Download', 'Certificate Management', {
    //       //     certificateName: certName,
    //       //     templateFile: filename,
    //       //     downloadedAt: new Date().toISOString()
    //       // });

    //       document.body.appendChild(link);
    //       link.click();
    //       document.body.removeChild(link);
    //       window.URL.revokeObjectURL(url);
    //     })
    //   );

    //   // Make sure the userId is properly formatted before making the API request
    //   const userId = JSON.parse(localStorage.getItem("userId") || "null");

    //   await axiosInstance.post("/system-logs", {
    //     action: "Download",
    //     module: "Manage Certificate Templates",
    //     user: userId, // Ensures proper formatting (null if unavailable)
    //     details: `User ${username} downloaded ${certName} (${
    //       urls.length > 1 ? "multiple files" : urls[0].split("/").pop()
    //     })`,
    //   });

    //   toast.success(`${certName} File downloaded successfully!`);

    //   setDownloadStatus({ loading: false, error: null });
    // } catch (error) {
    //   console.error("Download error:", error);
    //   setDownloadStatus({
    //     loading: false,
    //     error: "Failed to download template. Please try again later.",
    //   });
    // }
  };

  const modifyWordFile = async (templateUrls, certName) => {
    let data = {};
    switch (certName) {
      case "Barangay Clearance":
        data = barangayClearanceData;
        break;
      case "Certificate of Residency":
        data = residencyDatav1;
        break;
      case "Certification of Residency":
        data = residencyDatav2;
        break;
      case "Certificate of Appearance":
        data = appearanceData;
        break;
      case "Certificate of Good Moral":
        data = goodMoralData;
        break;
      case "Barangay Certification":
        data = brgyCertData;
        break;
      case "Barangay Health Certification":
        data = healthData;
        break;
      case "Certification of Mortuary":
        data = mortuaryData;
        break;
      case "Permit to Travel":
        data = travelData;
        break;
      case "Business Permit":
        data = businessPermitData;
        break;
      case "Certification of Business Closure":
        data = businessClosureData;
        break;
      case "Certificate of Indigency":
        data = indigencyData;
        break;
      case "Certificate of No Income":
        data = noIncomeData;
        break;
      case "Certificate of Income":
        data = incomeData;
        break;
      case "Libreng Tulong Hatid":
        data = tulongHatidData;
        break;
      case "Certification of Late Registration":
        data = lateRegData;
        break;
      case "Oath of Undertaking":
        data = oathData;
        break;
      case "Sworn Affidavit of the Barangay Council":
        data = councilAffidavitData;
        break;
      case "Certification of Live In Partner":
        data = liveInData;
        break;
      case "Certification of Relationship":
        data = relationshipData;
        break;
      case "Solo Parent Certification":
        data = soloParentData;
        break;
      default:
        data = {};
    }

    const response = await fetch(templateUrls); // Load existing Word file
    const arrayBuffer = await response.arrayBuffer();

    const zip = new PizZip(arrayBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Inject variables
    doc.setData(data);

    try {
      doc.render();
      const blob = doc.getZip().generate({ type: "blob" });
      saveAs(blob, `${certName}.docx`);

      const certificateRecRes = await axiosInstance.post("/certificates", {
        type: certName,
        printedBy: currentUser.id,
        data: data,
      });

      console.log(certificateRecRes);

      if (certificateRecRes.data.message) {
        await axiosInstance.post("/system-logs", {
          action: "Download",
          module: "Manage Certificate Templates",
          user: currentUser.id,
          details: `User ${currentUser.username} downloaded ${certName}`,
        });

        toast.success(
          `${certName} File downloaded and record saved successfully!`
        );
      } else {
        toast.error(
          `${certName} Cannot Save Record Right Now. Please try again later.`
        );
      }

      setDownloadStatus({ loading: false, error: null });
      setBarangayClearanceData({
        name: "",
        birthPlace: "",
        age: "",
        civilStatus: "",
        birthday: "",
        parents: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setResidencyDatav1({
        name: "",
        age: "",
        nationality: "",
        gender: "",
        civilStatus: "",
        streetAddress: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setResidencyDatav2({
        name: "",
        age: "",
        streetAddress: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setAppearanceData({
        name: "",
        appearanceDate: "",
        eventProgram: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setGoodMoralData({
        name: "",
        age: "",
        streetAddress: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setBrgyCertData({
        name: "",
        birthday: "",
        // age: "",
        parents: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setHealthData({
        name: "",
        age: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setMortuaryData({
        name: "",
        age: "",
        streetAddress: "",
        dateOfDeath: "",
        cause: "",
        seniorID: "",
        seniorIssuanceDate: "",
        heirName: "",
        requestorLastName: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setTravelData({
        name: "",
        civilStatus: "",
        age: "",
        location: "",
        thingsOrAnimalsCarrying: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setBusinessClosureData({
        name: "",
        businessName: "",
        closureDate: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setIndigencyData({
        name: "",
        age: "",
        gender: "",
        civilStatus: "",
        streetAddress: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setNoIncomeData({
        name: "",
        age: "",
        streetAddress: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setIncomeData({
        name: "",
        age: "",
        streetAddress: "",
        businessName: "",
        income: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setTulongHatidData({
        name: "",
        age: "",
        streetAddress: "",
        beneficiaryRelationship: "",
        beneficiaryName: "",
        dateOfDeath: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setLateRegData({
        name: "",
        gender: "",
        birthday: "",
        birthplace: "",
        parents: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setOathData({
        name: "",
        age: "",
        streetAddress: "",
        yearsOfResidence: "",
        dateSigned: "",
        validUntil: "",
      });
      setCouncilAffidavitData({
        name: "",
        nationality: "",
        streetAddress: "",
        setHandDate: "",
        dateSworned: "",
      });
      setLiveInData({
        partnersName: "",
        streetAddress: "",
        since: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setRelationshipData({
        name: "",
        age: "",
        streetAddress: "",
        daughterInLawName: "",
        daughterInLawAge: "",
        daughterInLawBirthday: "",
        requestor: "",
        purpose: "",
        dateOfIssuance: "",
        validUntil: "",
      });
      setSoloParentData({
        name: "",
        age: "",
        streetAddress: "",
        numberOfChildren: "",
        childrenNames: "",
        dateOfIssuance: "",
        validUntil: "",
      });
    } catch (error) {
      console.error("Error modifying DOCX:", error);
    }
  };

  const handleClearanceInputChange = (e) => {
    const { name, value } = e.target;
    setBarangayClearanceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResidencyInputChangeV1 = (e) => {
    const { name, value } = e.target;
    setResidencyDatav1((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResidencyInputChangeV2 = (e) => {
    const { name, value } = e.target;
    setResidencyDatav2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAppearanceInputChange = (e) => {
    const { name, value } = e.target;
    setAppearanceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoodMoralInputChange = (e) => {
    const { name, value } = e.target;
    setGoodMoralData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBrgyCertInputChange = (e) => {
    const { name, value } = e.target;
    setBrgyCertData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHealthInputChange = (e) => {
    const { name, value } = e.target;
    setHealthData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMortuaryInputChange = (e) => {
    const { name, value } = e.target;
    setMortuaryData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTravelInputChange = (e) => {
    const { name, value } = e.target;
    setTravelData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBusinessClosureInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessClosureData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIndigencyInputChange = (e) => {
    const { name, value } = e.target;
    setIndigencyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNoIncomeInputChange = (e) => {
    const { name, value } = e.target;
    setNoIncomeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIncomeInputChange = (e) => {
    const { name, value } = e.target;
    setIncomeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTulongHatidInputChange = (e) => {
    const { name, value } = e.target;
    setTulongHatidData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLateRegInputChange = (e) => {
    const { name, value } = e.target;
    setLateRegData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOathInputChange = (e) => {
    const { name, value } = e.target;
    setOathData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCouncilAffidavitInputChange = (e) => {
    const { name, value } = e.target;
    setCouncilAffidavitData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLiveInInputChange = (e) => {
    const { name, value } = e.target;
    setLiveInData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRelationshipInputChange = (e) => {
    const { name, value } = e.target;
    setRelationshipData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSoloParentInputChange = (e) => {
    const { name, value } = e.target;
    setSoloParentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCertificateInputs = (type) => {
    switch (type) {
      case "Barangay Clearance":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={barangayClearanceData.name}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Birth Place:</label>
              <input
                type="text"
                name="birthPlace"
                value={barangayClearanceData.birthPlace}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={barangayClearanceData.age}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Civil Status:</label>
              <input
                type="text"
                name="civilStatus"
                value={barangayClearanceData.civilStatus}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Birthday:</label>
              <input
                type="date"
                name="birthday"
                value={barangayClearanceData.birthday}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>
                Name of Parents{" "}
                <span className="hint">put an 'and' in between</span> :
              </label>
              <input
                type="text"
                name="parents"
                value={barangayClearanceData.parents}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={barangayClearanceData.purpose}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={barangayClearanceData.dateOfIssuance}
                onChange={handleClearanceInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={barangayClearanceData.validUntil}
                onChange={handleClearanceInputChange}
              />
            </div>
          </>
        );
      case "Certificate of Residency":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={residencyDatav1.name}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Nationality:</label>
              <input
                type="text"
                name="nationality"
                value={residencyDatav1.nationality}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={residencyDatav1.age}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Civil Status:</label>
              <input
                type="text"
                name="civilStatus"
                value={residencyDatav1.civilStatus}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Gender:</label>
              <input
                type="text"
                name="gender"
                value={residencyDatav1.gender}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={residencyDatav1.streetAddress}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={residencyDatav1.purpose}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={residencyDatav1.dateOfIssuance}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={residencyDatav1.validUntil}
                onChange={handleResidencyInputChangeV1}
              />
            </div>
          </>
        );
      case "Certification of Residency":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={residencyDatav2.name}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={residencyDatav2.age}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={residencyDatav2.streetAddress}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={residencyDatav2.purpose}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={residencyDatav2.dateOfIssuance}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={residencyDatav2.validUntil}
                onChange={handleResidencyInputChangeV2}
              />
            </div>
          </>
        );
      case "Certificate of Appearance":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={appearanceData.name}
                onChange={handleAppearanceInputChange}
              />
            </div>
            <div>
              <label>Event/Program</label>
              <input
                type="text"
                name="eventProgram"
                value={appearanceData.eventProgram}
                onChange={handleAppearanceInputChange}
              />
            </div>
            <div>
              <label>Appearance Date:</label>
              <input
                type="date"
                name="appearanceDate"
                value={appearanceData.appearanceDate}
                onChange={handleAppearanceInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={appearanceData.dateOfIssuance}
                onChange={handleAppearanceInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={appearanceData.validUntil}
                onChange={handleAppearanceInputChange}
              />
            </div>
          </>
        );
      case "Certificate of Good Moral":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={goodMoralData.name}
                onChange={handleGoodMoralInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={goodMoralData.age}
                onChange={handleGoodMoralInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={goodMoralData.streetAddress}
                onChange={handleGoodMoralInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={goodMoralData.purpose}
                onChange={handleGoodMoralInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={goodMoralData.dateOfIssuance}
                onChange={handleGoodMoralInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={goodMoralData.validUntil}
                onChange={handleGoodMoralInputChange}
              />
            </div>
          </>
        );
      case "Barangay Certification":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={brgyCertData.name}
                onChange={handleBrgyCertInputChange}
              />
            </div>
            <div>
              <label>Birthday:</label>
              <input
                type="date"
                name="birthday"
                value={brgyCertData.birthday}
                onChange={handleBrgyCertInputChange}
              />
            </div>
            <div>
              <label>
                Name of Parents{" "}
                <span className="hint">put an 'and' in between</span> :
              </label>
              <input
                type="text"
                name="parents"
                value={brgyCertData.parents}
                onChange={handleBrgyCertInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={brgyCertData.purpose}
                onChange={handleBrgyCertInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={brgyCertData.dateOfIssuance}
                onChange={handleBrgyCertInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={brgyCertData.validUntil}
                onChange={handleBrgyCertInputChange}
              />
            </div>
          </>
        );
      case "Barangay Health Certification":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={healthData.name}
                onChange={handleHealthInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={healthData.age}
                onChange={handleHealthInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={healthData.purpose}
                onChange={handleHealthInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={healthData.dateOfIssuance}
                onChange={handleHealthInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={healthData.validUntil}
                onChange={handleHealthInputChange}
              />
            </div>
          </>
        );
      case "Certification of Mortuary":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={mortuaryData.name}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={mortuaryData.age}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Street Address:</label>
              <input
                type="text"
                name="streetAddress"
                value={mortuaryData.streetAddress}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Cause of Death:</label>
              <input
                type="text"
                name="cause"
                value={mortuaryData.cause}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Date of Death:</label>
              <input
                type="date"
                name="dateOfDeath"
                value={mortuaryData.dateOfDeath}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Senior Citizen ID:</label>
              <input
                type="text"
                name="seniorID"
                value={mortuaryData.seniorID}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Date of Senior ID Issuance:</label>
              <input
                type="date"
                name="seniorIssuanceDate"
                value={mortuaryData.seniorIssuanceDate}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Heir Name:</label>
              <input
                type="text"
                name="heirName"
                value={mortuaryData.heirName}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Requestor Surname:</label>
              <input
                type="text"
                name="requestorLastName"
                value={mortuaryData.requestorLastName}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={mortuaryData.dateOfIssuance}
                onChange={handleMortuaryInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={mortuaryData.validUntil}
                onChange={handleMortuaryInputChange}
              />
            </div>
          </>
        );
      case "Permit to Travel":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={travelData.name}
                onChange={handleTravelInputChange}
              />
            </div>
            <div>
              <label>Civil Status:</label>
              <input
                type="text"
                name="civilStatus"
                value={travelData.civilStatus}
                onChange={handleTravelInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={travelData.age}
                onChange={handleTravelInputChange}
              />
            </div>
            <div>
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={travelData.location}
                onChange={handleTravelInputChange}
              />
            </div>
            <div>
              <label>
                Things/Animals Carrying{" "}
                <span className="hint">Ex. 15 Roosters, etc.</span> :
              </label>
              <input
                type="text"
                name="thingsOrAnimalsCarrying"
                value={travelData.thingsOrAnimalsCarrying}
                onChange={handleTravelInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={travelData.dateOfIssuance}
                onChange={handleTravelInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={travelData.validUntil}
                onChange={handleTravelInputChange}
              />
            </div>
          </>
        );
      case "Certification of Business Closure":
        return (
          <>
            <div>
              <label>Owner Name:</label>
              <input
                type="text"
                name="name"
                value={businessClosureData.name}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
            <div>
              <label>Business Name:</label>
              <input
                type="text"
                name="businessName"
                value={businessClosureData.businessName}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
            <div>
              <label>Closure Date:</label>
              <input
                type="date"
                name="closureDate"
                value={businessClosureData.closureDate}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={businessClosureData.purpose}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={businessClosureData.dateOfIssuance}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={businessClosureData.validUntil}
                onChange={handleBusinessClosureInputChange}
              />
            </div>
          </>
        );
      case "Certificate of Indigency":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={indigencyData.name}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={indigencyData.age}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <input
                type="text"
                name="gender"
                value={indigencyData.gender}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Civil Status:</label>
              <input
                type="text"
                name="civilStatus"
                value={indigencyData.civilStatus}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={indigencyData.streetAddress}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={indigencyData.purpose}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={indigencyData.dateOfIssuance}
                onChange={handleIndigencyInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={indigencyData.validUntil}
                onChange={handleIndigencyInputChange}
              />
            </div>
          </>
        );
      case "Certificate of No Income":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={noIncomeData.name}
                onChange={handleNoIncomeInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={noIncomeData.age}
                onChange={handleNoIncomeInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={noIncomeData.streetAddress}
                onChange={handleNoIncomeInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={noIncomeData.purpose}
                onChange={handleNoIncomeInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={noIncomeData.dateOfIssuance}
                onChange={handleNoIncomeInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={noIncomeData.validUntil}
                onChange={handleNoIncomeInputChange}
              />
            </div>
          </>
        );
      case "Certificate of Income":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={incomeData.name}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={incomeData.age}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={incomeData.streetAddress}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Business Name:</label>
              <input
                type="text"
                name="businessName"
                value={incomeData.businessName}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Monthly Income:</label>
              <input
                type="number"
                name="income"
                value={incomeData.income}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={incomeData.purpose}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={incomeData.dateOfIssuance}
                onChange={handleIncomeInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={incomeData.validUntil}
                onChange={handleIncomeInputChange}
              />
            </div>
          </>
        );
      case "Libreng Tulong Hatid":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={tulongHatidData.name}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={tulongHatidData.age}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={tulongHatidData.streetAddress}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Relationship to the Beneficiary:</label>
              <input
                type="text"
                name="beneficiaryRelationship"
                value={tulongHatidData.beneficiaryRelationship}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Beneficiary Name:</label>
              <input
                type="text"
                name="beneficiaryName"
                value={tulongHatidData.beneficiaryName}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Date of Death:</label>
              <input
                type="date"
                name="dateOfDeath"
                value={tulongHatidData.dateOfDeath}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={tulongHatidData.dateOfIssuance}
                onChange={handleTulongHatidInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={tulongHatidData.validUntil}
                onChange={handleTulongHatidInputChange}
              />
            </div>
          </>
        );
      case "Certification of Late Registration":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={lateRegData.name}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <input
                type="text"
                name="gender"
                value={lateRegData.gender}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={lateRegData.streetAddress}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Date of Birth:</label>
              <input
                type="date"
                name="birthday"
                value={lateRegData.birthday}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Place of Birth:</label>
              <input
                type="text"
                name="birthplace"
                value={lateRegData.birthplace}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>
                Parents Fullname{" "}
                <span className="hint">put an 'and' in between</span> :
              </label>
              <input
                type="text"
                name="parents"
                value={lateRegData.parents}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={lateRegData.purpose}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={lateRegData.dateOfIssuance}
                onChange={handleLateRegInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={lateRegData.validUntil}
                onChange={handleLateRegInputChange}
              />
            </div>
          </>
        );
      case "Oath of Undertaking":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={oathData.name}
                onChange={handleOathInputChange}
              />
            </div>
            <div>
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={oathData.age}
                onChange={handleOathInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={oathData.streetAddress}
                onChange={handleOathInputChange}
              />
            </div>
            <div>
              <label>Years of Residence:</label>
              <input
                type="number"
                name="yearsOfResidence"
                value={oathData.yearsOfResidence}
                onChange={handleOathInputChange}
              />
            </div>
            <div>
              <label>Date Signed:</label>
              <input
                type="date"
                name="dateSigned"
                value={oathData.dateSigned}
                onChange={handleOathInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={oathData.validUntil}
                onChange={handleOathInputChange}
              />
            </div>
          </>
        );
      case "Sworn Affidavit of the Barangay Council":
        return (
          <>
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={councilAffidavitData.name}
                onChange={handleCouncilAffidavitInputChange}
              />
            </div>
            <div>
              <label>Nationality:</label>
              <input
                type="text"
                name="nationality"
                value={councilAffidavitData.nationality}
                onChange={handleCouncilAffidavitInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={councilAffidavitData.streetAddress}
                onChange={handleCouncilAffidavitInputChange}
              />
            </div>
            <div>
              <label>Hand Setting Date:</label>
              <input
                type="date"
                name="setHandDate"
                value={councilAffidavitData.setHandDate}
                onChange={handleCouncilAffidavitInputChange}
              />
            </div>
            <div>
              <label>Date Sworned:</label>
              <input
                type="date"
                name="dateSworned"
                value={councilAffidavitData.dateSworned}
                onChange={handleCouncilAffidavitInputChange}
              />
            </div>
          </>
        );
      case "Certification of Live In Partner":
        return (
          <>
            <div>
              <label>
                Names <span className="hint">Woman's and Man's</span> :{" "}
              </label>
              <input
                type="text"
                name="partnersName"
                value={liveInData.partnersName}
                onChange={handleLiveInInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={liveInData.streetAddress}
                onChange={handleLiveInInputChange}
              />
            </div>
            <div>
              <label>Since</label>
              <input
                type="date"
                name="since"
                value={liveInData.since}
                onChange={handleLiveInInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={liveInData.purpose}
                onChange={handleLiveInInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={liveInData.dateOfIssuance}
                onChange={handleLiveInInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={liveInData.validUntil}
                onChange={handleLiveInInputChange}
              />
            </div>
          </>
        );
      case "Certification of Relationship":
        return (
          <>
            <div>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={relationshipData.name}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={relationshipData.age}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={relationshipData.streetAddress}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Daughter-In-Law Name</label>
              <input
                type="text"
                name="daughterInLawName"
                value={relationshipData.daughterInLawName}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Daughter-In-Law Age</label>
              <input
                type="number"
                name="daughterInLawAge"
                value={relationshipData.daughterInLawAge}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Daughter-In-Law Birthday</label>
              <input
                type="date"
                name="daughterInLawBirthday"
                value={relationshipData.daughterInLawBirthday}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Requested By</label>
              <input
                type="text"
                name="requestor"
                value={relationshipData.requestor}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Purpose:</label>
              <input
                type="text"
                name="purpose"
                value={relationshipData.purpose}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={relationshipData.dateOfIssuance}
                onChange={handleRelationshipInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={relationshipData.validUntil}
                onChange={handleRelationshipInputChange}
              />
            </div>
          </>
        );
      case "Solo Parent Certification":
        return (
          <>
            <div>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={soloParentData.name}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={soloParentData.age}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Street Address</label>
              <input
                type="text"
                name="streetAddress"
                value={soloParentData.streetAddress}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Number of Children</label>
              <input
                type="number"
                name="numberOfChildren"
                value={soloParentData.numberOfChildren}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Children Names</label>
              <input
                type="text"
                name="childrenNames"
                value={soloParentData.childrenNames}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Date of Issuance:</label>
              <input
                type="date"
                name="dateOfIssuance"
                value={soloParentData.dateOfIssuance}
                onChange={handleSoloParentInputChange}
              />
            </div>
            <div>
              <label>Valid Until:</label>
              <input
                type="date"
                name="validUntil"
                value={soloParentData.validUntil}
                onChange={handleSoloParentInputChange}
              />
            </div>
          </>
        );
      default:
        console.log("Nothing...");
    }
  };

  return (
    <div className="certificate-manager-container">
      <header className="certificate-header">
        <h1>Certificate Management</h1>
        <p>Download and manage official barangay certificates and documents</p>
      </header>

      <div className="search-container">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {downloadStatus.error && (
        <div className="error-message">{downloadStatus.error}</div>
      )}

      <div className="document-sections">
        {searchTerm ? (
          <div className="search-results">
            {filteredDocuments?.length === 0 ? (
              <div className="no-results">
                No documents found matching your search.
              </div>
            ) : (
              <div className="document-list">
                {filteredDocuments?.map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="document-icon">
                      <FileText size={20} />
                      <div className="document-details">
                        <h4>{doc.name}</h4>
                        <p>{doc.description}</p>
                        <span className="document-category">
                          {doc.category}
                        </span>
                      </div>
                    </div>
                    <div className="certificate-inputs-div">
                      {getCertificateInputs(doc.name)}
                    </div>
                    <button
                      className={`download-button ${
                        downloadStatus.loading ? "loading" : ""
                      }`}
                      onClick={() =>
                        handleDownload(
                          doc.templateUrls || doc.templateUrl,
                          doc.name
                        )
                      }
                      disabled={downloadStatus.loading}
                      title="Download template"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          Object.entries(certificates).map(([section, docs]) => (
            <div key={section} className="document-section">
              <div className="section-header">
                <h3 className="section-title">{section}</h3>
              </div>
              <div className="document-list">
                {docs.map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="document-icon">
                      <FileText size={20} />
                      <div className="document-details">
                        <h4>{doc.name}</h4>
                        <p>{doc.description}</p>
                      </div>
                    </div>
                    <div className="certificate-inputs-div">
                      {getCertificateInputs(doc.name)}
                    </div>
                    <button
                      className={`download-button ${
                        downloadStatus.loading ? "loading" : ""
                      }`}
                      onClick={() =>
                        handleDownload(
                          doc.templateUrls || doc.templateUrl,
                          doc.name
                        )
                      }
                      disabled={downloadStatus.loading}
                      title="Download template"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <PermissionErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default CertificateManager;
