import axios from "axios";
import fs from "fs";
import FormData from "form-data"; // Ensure you're importing the correct FormData
import userModel from "../models/userModel.js";

// Controller function to remove background
const removeBgImage = async (req, res) => {
  try {
    const { clerkId } = req.body;
    const user = await userModel.findOne({ clerkId });

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }
    if (user.creditBalance === 0) {
      return res.json({
        success: false,
        message: "No Credit Balance",
        creditBalance: user.creditBalance,
      });
    }

    const imagePath = req.file.path;
    const imageFile = fs.createReadStream(imagePath);

    const formData = new FormData();
    formData.append("image_file", imageFile, {
      filename: 'image.png',
      contentType: req.file.mimetype, 
    });

    const { data } = await axios.post(
      "https://clipdrop-api.co/remove-background/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders(), 
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = Buffer.from(data, "binary").toString("base64");

    await userModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance - 1,
    });
    res.json({
      success: true,
      resultImage: `data:${req.file.mimetype};base64,${base64Image}`,
      creditBalance: user.creditBalance - 1,
      message: "Background Removed",
    });
  } catch (error) {
    console.error(error.response?.data || error.message); // Log more error details
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.error || error.message,
    });
  }
};

export { removeBgImage };
