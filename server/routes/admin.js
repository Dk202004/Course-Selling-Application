const express = require("express");
const jwt = require("jsonwebtoken");
const { SECRET, authenticateJwt } = require("../middleware/auth");
const { Admin, Course } = require("../database/models");
const z = require("zod");
const { cloudinary, upload } = require("../services/upload");

const router = express.Router();

let signupProps = z.object({
  username: z.string().min(1).max(50).email(),
  password: z
    .string()
    .min(8, "Password must be atleast 8 characters")
    .max(50, "Password must be less than 50 characters"),
});

router.post("/signup", async (req, res) => {
  const parsedInput = signupProps.safeParse(req.body);
  if (!parsedInput.success) {
    res.status(411).json({ message: parsedInput.error.issues[0].message });
    return;
  }
  const username = parsedInput.data.username;
  const password = parsedInput.data.password;

  const user = await Admin.findOne({ username });
  if (user) {
    res.status(403).json({ message: "Admin already exists" });
  } else {
    const newUser = new Admin({ username, password });
    await newUser.save();
    const token = jwt.sign({ username, role: "admin" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Admin created successfully", token });
  }
});

router.get("/me", authenticateJwt, (req, res) => {
  res.json(req.user.username);
});

router.post("/login", async (req, res) => {
  const parsedInput = signupProps.safeParse(req.body);
  if (!parsedInput.success) {
    res.status(411).json({ message: parsedInput.error.issues[0].message });
    return;
  }
  const username = parsedInput.data.username;
  const password = parsedInput.data.password;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = jwt.sign({ username, role: "admin" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
});

router.post(
  "/courses",
  authenticateJwt,
  upload.single("video"),
  async (req, res) => {
    try {
      const { title, description, price, imageLink, published } = req.body;
      const video = req.file;
      if (!video) {
        return res.status(400).json({ error: "Video file is required" });
      }
      const uploadResult = await cloudinary.uploader.upload(video.path, {
        resource_type: "video",
        folder: "videos",
      });
      const newCourse = new Course({
        title,
        description,
        price,
        imageLink,
        video: uploadResult.secure_url,
        published,
      });
      const savedCourse = await newCourse.save();
      res.json({ message: "Course created successfully", data: savedCourse });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

router.get("/courses/:courseId", authenticateJwt, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  res.json({ course });
});

router.put("/courses/:courseId", authenticateJwt, upload.single("video"), async (req, res) => {
    try {
      const { courseId } = req.params;
      const updateData = req.body;

      // If a new video is uploaded
      if (req.file) {
        const videoUpload = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "video",
          folder: "videos",
        });
        updateData.video = videoUpload.secure_url;
      }

      const course = await Course.findByIdAndUpdate(courseId, updateData, {
        new: true,
      });

      if (course) {
        res.json({ message: "Course updated successfully", data: course });
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating course" });
    }
  }
);

router.delete("/courses/:courseId", authenticateJwt, async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.courseId, req.body, {
    new: true,
  });
  if (course) {
    res.json({ message: "Course deleted successfully" });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

router.get("/courses", authenticateJwt, async (req, res) => {
  const courses = await Course.find({});
  res.json({ courses });
});

module.exports = router;
