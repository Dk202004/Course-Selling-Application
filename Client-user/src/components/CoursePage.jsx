// src/components/Courses.jsx
import { Box, Card, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CardContent from "@mui/material/CardContent";
import { CardActionArea } from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import DownloadIcon from "@mui/icons-material/Download";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import "./courseStyle.css";

function Courses() {
  const [course, setCourse] = useState({});
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [agree, setAgree] = useState(false); // ADD
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const courseResponse = await axios.get(
          `http://localhost:3000/users/courses/${id}`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        setCourse(courseResponse.data.course);

        const purchasedCoursesResponse = await axios.get(
          "http://localhost:3000/users/purchasedCourses",
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        setPurchasedCourses(purchasedCoursesResponse.data.purchasedCourses);

        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const isCoursePurchased = purchasedCourses.some((item) => item._id === id);
    setIsPurchased(isCoursePurchased);
  }, [id, purchasedCourses]);

  const handleBuyNow = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `http://localhost:3000/users/courses/${id}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      toast.success(response.data.message);
      setPurchasedCourses([...purchasedCourses, response.data.purchasedCourse]);
      setIsPurchased(true);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/certificates/${id}.pdf`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      ); // blob download with Axios [web:84]

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${course?.title || "certificate"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Failed to download certificate");
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "300px",
        }}
      >
        <CircularProgress color="secondary" />
      </div>
    );
  }

  return (
    <div className="single-course">
      <div className="text-container">
        <div>
          <img
            src={course?.imageLink}
            alt={course?.imageLink}
            width={"200px"}
            style={{ borderRadius: "20px" }}
          />
        </div>
        <div>
          <h5 style={{ color: "white", fontSize: "25px" }}>{course?.title}</h5>
        </div>

        <div>
          <p
            style={{
              color: "white",
              fontSize: "10px",
              fontStyle: "italic",
            }}
          >
            {course?.description}
          </p>
        </div>

        <div>
          {!isPurchased ? (
            <button
              className="button-btn"
              style={{ width: "180px" }}
              onClick={handleBuyNow}
            >
              BUY NOW @${course?.price}
            </button>
          ) : (
            <div>
              <button
                style={{
                  backgroundColor: "green",
                  padding: "10px 20px",
                  fontWeight: "700",
                  fontSize: "15px !important",
                  borderRadius: "50px",
                  color: "white",
                  borderWidth: "0px",
                }}
              >
                Purchased
              </button>
              <button
                style={{
                  backgroundColor: "#1E267A",
                  padding: "10px 20px",
                  fontWeight: "700",
                  fontSize: "15px !important",
                  borderRadius: "50px",
                  color: "white",
                  borderWidth: "0px",
                  marginLeft: "20px",
                }}
                onClick={() => setShowContent(!showContent)}
              >
                {showContent ? "Hide Content" : "View Content"}
              </button>
            </div>
          )}
        </div>

        {isPurchased && showContent && course?.video && (
          <div style={{ marginTop: "20px" }}>
            <video
              width="400"
              height="250"
              controls
              style={{ borderRadius: "10px" }}
            >
              <source src={course.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {isPurchased && (
          <div style={{ marginTop: "16px" }}>
            <label style={{ color: "white", marginRight: 12 }}>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              I confirm to download my certificate
            </label>
            <button
              className="button-btn"
              disabled={!agree}
              onClick={handleDownloadCertificate}
              style={{
                width: "220px",
                marginLeft: 8,
                opacity: agree ? 1 : 0.6,
                cursor: agree ? "pointer" : "not-allowed",
              }}
            >
              Download Certificate
            </button>
          </div>
        )}
      </div>

      <div>
        <Card
          className="cardstyle"
          variant="outlined"
          sx={{ width: "350px", height: "440px" }}
          style={{
            backgroundColor: "#601b99",
            color: "white",
            borderRadius: "10px",
            display: "flex",
            padding: "5px",
          }}
        >
          <CardActionArea>
            <CardContent style={{ textAlign: "center" }}>
              <Typography gutterBottom variant="h6" component="div">
                Course Overview
              </Typography>
              <br />
              <Box
                sx={{
                  bgcolor: "background.paper",
                  color: "black",
                  borderRadius: "20px",
                  padding: "5px 2px",
                }}
              >
                {/* ... overview list left unchanged ... */}
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </div>
    </div>
  );
}

export default Courses;
