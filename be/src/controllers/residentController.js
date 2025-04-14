import { Resident } from "../models/residentModel.js";
import { User } from "../models/userModel.js";
import { AuditLog } from "../models/systemLogModel.js";
import { getCertificateReport } from "../controllers/certificateController.js";

const getResidentStatistics = async (req, res) => {
  try {
    const { filterType, filterValue } = req.query;
    let certReports = [];
    console.log(filterType, filterValue);

    let startDate, endDate;
    const currentYear = new Date().getFullYear();

    switch (filterType) {
      case "Yearly":
        startDate = new Date(filterValue, 0, 1);
        endDate = new Date(filterValue, 11, 31, 23, 59, 59);
        certReports = await getCertificateReport({
          year: filterValue,
        });
        break;
      case "Monthly":
        startDate = new Date(currentYear, filterValue - 1, 1);
        endDate = new Date(currentYear, filterValue, 0, 23, 59, 59); // last day of the month
        certReports = await getCertificateReport({
          month: filterValue,
        });
        break;
      case "Quarterly":
        const quarter = parseInt(filterValue);
        const startMonth = (quarter - 1) * 3;
        startDate = new Date(currentYear, startMonth, 1);
        endDate = new Date(currentYear, startMonth + 3, 0, 23, 59, 59);
        certReports = await getCertificateReport({
          quarter: filterValue,
        });
        break;
      default:
        // fallback: current month
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        certReports = await getCertificateReport({
          month: filterValue || new Date().getMonth() + 1,
        });
    }

    const residents = await Resident.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // switch (filterType) {
    //   case "Yearly":
    //     certReports = await getCertificateReport({
    //       year: filterValue,
    //     });
    //     break;
    //   case "Monthly":
    //     certReports = await getCertificateReport({
    //       month: filterValue,
    //     });
    //     break;
    //   case "Quarterly":
    //     certReports = await getCertificateReport({
    //       quarter: filterValue,
    //     });
    //     break;
    //   default:
    //     certReports = await getCertificateReport({
    //       month: filterValue || new Date().getMonth() + 1,
    //     });
    // }

    let totalPopulation = 0;
    let totalHouseholds = residents.length;
    let seniorCount = 0;
    let pwdCount = 0;
    let soloParentCount = 0;
    let ofwCount = 0;
    let immigrantCount = 0;
    let osyCount = 0;

    // Initialize age group counters
    const ageGroups = {
      "0-14": 0,
      "15-29": 0,
      "30-59": 0,
      "60+": 0,
    };

    residents.forEach((resident) => {
      totalPopulation += resident.totalMembers || 0;

      // Extract all ages from household members
      const householdAges = [
        resident.headAge,
        resident.spouseAge,
        ...(resident.familyMembers?.map((member) => member.age) || []),
      ];

      // Categorize ages into age groups
      householdAges.forEach((age) => {
        if (age !== undefined && !isNaN(age)) {
          if (age >= 0 && age <= 14) ageGroups["0-14"]++;
          else if (age >= 15 && age <= 29) ageGroups["15-29"]++;
          else if (age >= 30 && age <= 59) ageGroups["30-59"]++;
          else if (age >= 60) ageGroups["60+"]++;
        }
      });

      (resident.additionalInfos || []).forEach((info) => {
        if (info?.seniorCitizen?.toLowerCase() === "yes") seniorCount++;
        if (info?.pwd?.toLowerCase() !== "n/a") pwdCount++;
        if (info?.soloParent?.toLowerCase() === "yes") soloParentCount++;
        if (info?.ofwCountry) ofwCount++;
        if (info?.immigrantNationality) immigrantCount++;
        if (info?.outOfSchool?.toLowerCase() === "yes") osyCount++;
      });
    });

    // Function to calculate percentages (avoid division by zero)
    const calculatePercentage = (count) =>
      totalPopulation > 0
        ? ((count / totalPopulation) * 100).toFixed(2)
        : "0.00";

    res.status(200).json({
      success: true,
      data: {
        totalPopulation,
        totalHouseholds,
        seniorCount,
        seniorPercentage: calculatePercentage(seniorCount),
        pwdCount,
        pwdPercentage: calculatePercentage(pwdCount),
        soloParentCount,
        soloParentPercentage: calculatePercentage(soloParentCount),
        ofwCount,
        ofwPercentage: calculatePercentage(ofwCount),
        immigrantCount,
        immigrantPercentage: calculatePercentage(immigrantCount),
        osyCount,
        osyPercentage: calculatePercentage(osyCount),
        ageGroups: {
          "0-14": {
            count: ageGroups["0-14"],
            percentage: calculatePercentage(ageGroups["0-14"]),
          },
          "15-29": {
            count: ageGroups["15-29"],
            percentage: calculatePercentage(ageGroups["15-29"]),
          },
          "30-59": {
            count: ageGroups["30-59"],
            percentage: calculatePercentage(ageGroups["30-59"]),
          },
          "60+": {
            count: ageGroups["60+"],
            percentage: calculatePercentage(ageGroups["60+"]),
          },
        },
        certReports,
      },
    });
  } catch (error) {
    console.error("Error fetching resident statistics:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const createResident = async (req, res) => {
  try {
    const newResident = new Resident(req.body);
    await newResident.save();
    res.status(201).json({
      success: true,
      message: "Resident created successfully",
      data: newResident,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find().sort({ headLastName: 1 });
    res.status(200).json({ success: true, data: residents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res
        .status(404)
        .json({ success: false, error: "Resident not found" });
    }
    res.status(200).json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateResident = async (req, res) => {
  try {
    const updatedResident = await Resident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedResident) {
      return res
        .status(404)
        .json({ success: false, error: "Resident not found" });
    }
    res.status(200).json({
      success: true,
      message: "Resident updated successfully",
      data: updatedResident,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateRequestForDeletion = async (req, res) => {
  try {
    const updatedResident = await Resident.findByIdAndUpdate(
      req.params.requestDeletionID,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedResident) {
      return res
        .status(404)
        .json({ success: false, error: "Resident not found" });
    }
    res.status(200).json({
      success: true,
      message: "Request for deletion sent!",
      data: updatedResident,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteResident = async (req, res) => {
  // try {
  //   const deletedResident = await Resident.findByIdAndDelete(req.params.id);
  //   if (!deletedResident) {
  //     return res
  //       .status(404)
  //       .json({ success: false, error: "Resident not found" });
  //   }
  //   res.status(200).json({
  //     success: true,
  //     message: "Resident deleted successfully",
  //     deletedResident,
  //   });
  // } catch (error) {
  //   res.status(500).json({ success: false, error: error.message });
  // }
  try {
    // Step 1: Delete the resident
    const deletedResident = await Resident.findByIdAndDelete(req.params.id);
    if (!deletedResident) {
      return res.status(404).json({
        success: false,
        error: "Resident not found",
      });
    }

    // Step 2: Find users linked to this resident
    const linkedUsers = await User.find({ linkedResident: req.params.id });

    // Step 3: Extract the IDs of those users
    const linkedUserIds = linkedUsers.map((user) => user._id);

    // Step 4: Delete those users
    const deletedUsers = await User.deleteMany({ _id: { $in: linkedUserIds } });

    // Step 5: Delete audit logs created by those users
    const deletedLogs = await AuditLog.deleteMany({
      user: { $in: linkedUserIds },
    });

    return res.status(200).json({
      success: true,
      message: "Resident, linked users, and audit logs deleted successfully",
      deletedResident,
      deletedUsers: deletedUsers.deletedCount,
      deletedLogs: deletedLogs.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export {
  getResident,
  getResidents,
  createResident,
  updateResident,
  deleteResident,
  getResidentStatistics,
  updateRequestForDeletion,
};
