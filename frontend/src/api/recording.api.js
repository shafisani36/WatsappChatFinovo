import api from "./axios";

export const getRecordings = async () => {
  const response = await api.get("/recordings");

  return response.data;
};

export const uploadRecording = async (
  videoBlob,
  duration = null
) => {
  const formData = new FormData();

  formData.append(
    "video",
    videoBlob,
    `recording_${Date.now()}.webm`
  );

  if (duration !== null) {
    formData.append(
      "duration",
      String(duration)
    );
  }

  const response = await api.post(
    "/recordings/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};