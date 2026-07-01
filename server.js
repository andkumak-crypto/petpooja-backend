require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Petpooja Backend is Running 🚀");
});

app.get("/api/trainers", async (req, res) => {
  try {
    let page = 1;
    let hasMore = true;
    let allUsers = [];

    while (hasMore) {
      console.log(`Fetching Page ${page}...`);

      const response = await axios.get(
        `https://marketplaceadminnewapi.petpooja.com/activity-tracking/user-status?page=${page}&limit=20&sort_by=name&sort_order=asc`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PETPOOJA_TOKEN}`,
            Accept: "application/json",
            "X-Client-Type": "web",
          },
        }
      );

      allUsers.push(...response.data.data);

      hasMore = response.data.meta.has_more;

      page++;
    }

    // Only Trainers
    const trainers = allUsers.filter((user) =>
  [
    "trainner",
    "trainner_team_lead",
    "trainning_zonal_manager"
  ].includes(user.role_slug)
);
    // Checked In
    const checkedIn = trainers.filter(
      (user) => user.attendance_status === "checked_in"
    );

    // Not Checked In
    const notCheckedIn = trainers.filter(
      (user) => user.attendance_status === "not_checked_in"
    );

    res.json({
      success: true,

      totalTrainers: trainers.length,

      checkedInCount: checkedIn.length,

      notCheckedInCount: notCheckedIn.length,

      checkedIn,

      notCheckedIn,
    });

  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});