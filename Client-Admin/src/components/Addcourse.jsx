import { TextField, Card } from "@mui/material";
import axios from "axios";
import { useState } from "react";

function Addcourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(0);
  const [video, setVideo] = useState(null); // store File object
  const [isMouseOver, setIsMoueOver] = useState(false);

  const handleSubmit = async () => {
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

      await axios.post("http://localhost:3000/admin/courses", formData, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Added course!");
    } catch (error) {
      console.error("Error adding course:", error);
      alert("An error occurred while adding the course.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        minHeight: 50,
        paddingTop: 50,
        minWidth: "100%",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Card
          className="cardstyle"
          variant="outlined"
          sx={{ minWidth: 300, height: 400 }}
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            fontFamily: "Arial, sans-serif",
            boxShadow: isMouseOver ? "0 0 50px #601b99" : "0 0 10px #601b99",
          }}
          onMouseOver={() => setIsMoueOver(true)}
          onMouseLeave={() => setIsMoueOver(false)}
        >
          <TextField
            style={{ marginBottom: 10 }}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            label="Title"
            variant="outlined"
          />
          <TextField
            style={{ marginBottom: 10 }}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            label="Description"
            variant="outlined"
          />
          <TextField
            style={{ marginBottom: 10 }}
            onChange={(e) => setImage(e.target.value)}
            fullWidth
            label="Image link"
            variant="outlined"
          />
          <TextField
            style={{ marginBottom: 10 }}
            onChange={(e) => setPrice(e.target.value)}
            fullWidth
            label="Price"
            variant="outlined"
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            style={{ marginBottom: 10 }}
          />

          <button
            className="button-nav"
            style={{
              display: "flex",
              justifyContent: "center",
              marginLeft: "33%",
              width: "120px",
            }}
            sx={{ bgcolor: "#053B50" }}
            onClick={handleSubmit}
          >
            Add Course
          </button>
        </Card>
      </div>
    </div>
  );
}
export default Addcourse;
