import prisma from "../config/db.js";
import fs from "fs";
import path from "path";

export const uploadRecording = async (req, res) => {
try {
if (!req.file) {
return res.status(400).json({
success: false,
message: "Video file is required",
});
}

const userId = req.userId;

const recording = await prisma.recording.create({
  data: {
    fileName: req.file.originalname,
    filePath: `/uploads/recordings/${req.file.filename}`,
    userId,
  },
});

return res.status(201).json({
  success: true,
  message: "Recording uploaded successfully",
  recording,
});

} catch (error) {
console.error("Upload Recording Error:", error);

return res.status(500).json({
  success: false,
  message: "Failed to upload recording",
});

}
};

export const getRecordings = async (req, res) => {
try {
const userId = req.userId;

const recordings = await prisma.recording.findMany({
  where: {
    userId,
  },
  orderBy: {
    createdAt: "desc",
  },
});

return res.status(200).json({
  success: true,
  total: recordings.length,
  recordings,
});

} catch (error) {
console.error("Get Recordings Error:", error);

return res.status(500).json({
  success: false,
  message: "Failed to fetch recordings",
});

}
};