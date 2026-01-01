const express = require("express");
const PDFDocument = require("pdfkit"); // npm i pdfkit
const path = require("path");
const { authenticateJwt } = require("../middleware/auth");
const { User, Course } = require("../database/models");

const router = express.Router();

// GET /certificates/:courseId.pdf
router.get("/:courseId.pdf", authenticateJwt, async (req, res) => {
  try {
    const username = req.user.username; // from authenticateJwt
    const courseId = req.params.courseId;

    // 1) Load user with purchased courses
    const user = await User.findOne({ username }).populate("purchasedCourses").lean();
    if (!user) return res.status(404).send("User not found");

    // 2) Ensure the course is in purchasedCourses
    const purchasedIds = (user.purchasedCourses || []).map((c) => String(c._id));
    if (!purchasedIds.includes(String(courseId))) {
      return res.status(403).send("Course not purchased");
    }

    // 3) Load course to get latest title (optional since populated above)
    const course = await Course.findById(courseId).lean();
    if (!course) return res.status(404).send("Course not found");

    // 4) Stream a PDF certificate
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${username}-${courseId}-certificate.pdf"`
    );

    const doc = new PDFDocument({ size: "A4", layout: "landscape" });
    doc.pipe(res);

    // Optional background image template at server/assets/certificate-bg.png
    const bgPath = path.join(process.cwd(), "server", "assets", "certificate-bg.png");
    try {
      doc.image(bgPath, 0, 0, { width: doc.page.width, height: doc.page.height });
    } catch (e) {
      // If template not present, continue without it
    }

    const center = { x: 0, width: doc.page.width };

    doc
      .fontSize(28)
      .fillColor("#222")
      .text("Certificate of Completion", center.x, 180, { width: center.width, align: "center" });

    // Prefer a full name if stored on user; fallback to username
    const displayName = user.fullName || username;

    doc
      .fontSize(36)
      .fillColor("#111")
      .text(displayName, center.x, 250, { width: center.width, align: "center" });

    doc
      .fontSize(20)
      .fillColor("#333")
      .text(`has completed ${course.title}`, center.x, 310, {
        width: center.width,
        align: "center",
      });

    doc
      .fontSize(16)
      .fillColor("#555")
      .text(new Date().toLocaleDateString(), center.x, 360, {
        width: center.width,
        align: "center",
      });

    // signature lines (optional)
    doc.moveTo(200, 450).lineTo(450, 450).strokeColor("#999").stroke();
    doc.moveTo(650, 450).lineTo(900, 450).strokeColor("#999").stroke();
    doc.fontSize(12).fillColor("#444").text("Instructor", 200, 460, { width: 250, align: "center" });
    doc.fontSize(12).fillColor("#444").text("Director", 650, 460, { width: 250, align: "center" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate certificate");
  }
});

module.exports = router;
