// src/components/Course.jsx

import {
  Card,
  Typography,
  TextField,
  Grid,
} from "@mui/material";
import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { courseState } from "../store/atoms/course";
import {
  courseTitle,
  isCourseLoading,
} from "../store/selectors/course";
import { Loading } from "./Loading";

function Course() {
  let { courseId } = useParams();
  const setCourse = useSetRecoilState(courseState);
  const courseLoading = useRecoilValue(isCourseLoading);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/admin/courses/${courseId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((res) => {
        setCourse({ isLoading: false, course: res.data.course });
      });
  }, [courseId, setCourse]);

  if (courseLoading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <GrayTopper />
      <Grid container spacing={2}>
        <Grid item lg={8} md={12} sm={12}>
          <UpdateCard />
        </Grid>
        <Grid item lg={4} md={12} sm={12}>
          <CourseCard />
        </Grid>
      </Grid>
    </div>
  );
}

function GrayTopper() {
  const title = useRecoilValue(courseTitle);
  return (
    <div>
      <Typography
        style={{
          color: "white",
          fontWeight: 600,
          margin: "20px",
          marginBottom: "40px",
        }}
        variant="h4"
        textAlign={"center"}
      >
        {title}
      </Typography>
    </div>
  );
}

function UpdateCard() {
  const [courseDetails, setCourse] = useRecoilState(courseState);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [video, setVideo] = useState(null);
  const [isMouseOver, setIsMouseOver] = useState(false);

  useEffect(() => {
    if (courseDetails?.course) {
      setTitle(courseDetails.course.title || "");
      setDescription(courseDetails.course.description || "");
      setImage(courseDetails.course.imageLink || "");
      setPrice(courseDetails.course.price || "");
    }
  }, [courseDetails]);

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("imageLink", image);
      formData.append("price", price);
      formData.append("published", true);

      if (video) {
        formData.append("video", video);
      }

      const response = await axios.put(
        `http://localhost:3000/admin/courses/${courseDetails.course._id}`,
        formData,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setCourse({ course: response.data.data, isLoading: false });
      alert("Course updated successfully");
    } catch (err) {
      console.error(err);
      alert("Error updating course");
    }
  };

  return (
    <div className="card-div">
      <Card
        className="cardstyle"
        variant="outlined"
        sx={{ minWidth: 350, minHeight: 385 }}
        style={{
          display: "flex",
          zIndex: 1,
          marginBottom: "40px",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
          boxShadow: isMouseOver ? "0 0 50px #601b99" : "0 0 10px #601b99",
        }}
        onMouseOver={() => setIsMouseOver(true)}
        onMouseLeave={() => setIsMouseOver(false)}
      >
        <Typography variant="h6" sx={{ fontSize: "18px" }}>
          Update course details
        </Typography>
        <br />
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 10 }}
          fullWidth
          label="Title"
          variant="outlined"
        />
        <TextField
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: 10 }}
          fullWidth
          label="Description"
          variant="outlined"
        />
        <TextField
          value={image}
          onChange={(e) => setImage(e.target.value)}
          style={{ marginBottom: 10 }}
          fullWidth
          label="Image link"
          variant="outlined"
        />
        <TextField
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ marginBottom: 10 }}
          fullWidth
          label="Price"
          variant="outlined"
        />

        {/* New video input */}
        <input
          type="file"
          accept="video/*"
          style={{ margin: "10px 0" }}
          onChange={(e) => setVideo(e.target.files[0])}
        />

        <div>
          <button
            className="button-nav"
            style={{ width: "150px" }}
            onClick={handleUpdate}
          >
            Update course
          </button>
        </div>
      </Card>
    </div>
  );
}

// Dummy CourseCard component for layout (replace with your real one)
function CourseCard() {
   const [courseDetails, setCourse] = useRecoilState(courseState);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [video, setVideo] = useState(null); // new state
  const [isMouseOver, setIsMouseOver] = useState(false);

  useEffect(() => {
    if (courseDetails) {
      setTitle(courseDetails.course.title || "");
      setDescription(courseDetails.course.description || "");
      setImage(courseDetails.course.imageLink || "");
      setPrice(courseDetails.course.price || "");
    }
  }, [courseDetails]);

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("imageLink", image);
      formData.append("price", price);
      formData.append("published", true);

      if (video) {
        formData.append("video", video); // attach video file
      }

      const response = await axios.put(
        "http://localhost:3000/admin/courses/" + courseDetails.course._id,
        formData,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // update recoil state
      setCourse({ course: response.data.data, isLoading: false });
      alert("Course updated successfully");
    } catch (err) {
      console.error(err);
      alert("Error updating course");
    }
  };

  return (
    <div className="card-div">
      <Card
        className="cardstyle"
        variant="outlined"
        sx={{ minWidth: 350, minHeight: 385 }}
        style={{
          display: "flex",
          zIndex: 1,
          marginBottom: "40px",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
          boxShadow: isMouseOver ? "0 0 50px #601b99" : "0 0 10px #601b99",
        }}
        onMouseOver={() => setIsMouseOver(true)}
        onMouseLeave={() => setIsMouseOver(false)}
      >
        <Typography variant="h6" sx={{ fontSize: "18px" }}>
          Update course details
        </Typography>
        <br />
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 10 }}
          fullWidth
          label="Title"
          variant="outlined"
        />
        <TextField
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ marginBottom: 10 }}
          fullWidth
          label="Description"
          variant="outlined"
        />
        <TextField
          value={image}
          onChange={(e) => setImage(e.target.value)}
          style={{ marginBottom: 10 }}
          fullWidth
          label="Image link"
          variant="outlined"
        />
        <TextField
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ marginBottom: 10 }}
          fullWidth
          label="Price"
          variant="outlined"
        />

        {/* New video input */}
        <input
          type="file"
          accept="video/*"
          style={{ margin: "10px 0" }}
          onChange={(e) => setVideo(e.target.files[0])}
        />

        <div>
          <button
            className="button-nav"
            style={{ width: "150px" }}
            onClick={handleUpdate}
          >
            Update course
          </button>
          <Delcourse />
        </div>
      </Card>
    </div>
  );
}

export default Course;
