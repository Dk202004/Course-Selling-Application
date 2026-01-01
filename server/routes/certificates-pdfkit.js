const express = require('express');
const PDFDocument = require('pdfkit');
const path = require('path');

const router = express.Router();

router.get('/:courseId.pdf', async (req, res) => {
  const user = req.user;
  const courseId = req.params.courseId;

  const course = await db.course.findById(courseId);
  const completed = await db.progress.hasCompleted(user.id, courseId);
  if (!completed) return res.status(403).send('Not completed');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${user.fullName}-${courseId}-certificate.pdf"`);

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
  doc.pipe(res);

  const bgPath = path.join(process.cwd(), 'assets', 'certificate-bg.png');
  doc.image(bgPath, 0, 0, { width: doc.page.width, height: doc.page.height });

  doc.fontSize(36).fillColor('#111').text(user.fullName, 0, 270, { width: doc.page.width, align: 'center' });
  doc.fontSize(20).fillColor('#333').text(`has completed ${course.title}`, 0, 330, { width: doc.page.width, align: 'center' });
  doc.fontSize(16).fillColor('#555').text(new Date().toLocaleDateString(), 0, 390, { width: doc.page.width, align: 'center' });

  doc.end();
});

module.exports = router;
