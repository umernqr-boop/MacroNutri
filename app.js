// Simple SPA navigation
const screens = document.querySelectorAll(".screen");

function showScreen(id) {
  screens.forEach((s) => {
    if (s.id === id) {
      s.classList.add("active");
    } else {
      s.classList.remove("active");
    }
  });
}

// Handle buttons with data-target
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-target]");
  if (!target) return;
  const screenId = target.getAttribute("data-target");
  if (screenId) {
    showScreen(screenId);
  }
});

// Camera + analysis logic
let stream = null;

const startCameraBtn = document.getElementById("start-camera");
const captureBtn = document.getElementById("capture-photo");
const videoEl = document.getElementById("camera-stream");
const canvasEl = document.getElementById("capture-canvas");

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    videoEl.srcObject = stream;
    captureBtn.disabled = false;
  } catch (err) {
    alert("Unable to access camera. Please check permissions.");
    console.error(err);
  }
}

function stopCamera() {
  if (!stream) return;
  stream.getTracks().forEach((t) => t.stop());
  stream = null;
  captureBtn.disabled = true;
}

async function captureAndAnalyze() {
  if (!videoEl.videoWidth || !videoEl.videoHeight) {
    alert("Camera is not ready yet. Please wait a moment.");
    return;
  }

  // Draw current frame to canvas
  canvasEl.width = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;
  const ctx = canvasEl.getContext("2d");
  ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

  // Convert to blob
  canvasEl.toBlob(async (blob) => {
    if (!blob) {
      alert("Could not capture image.");
      return;
    }

    // Navigate to results screen
    showScreen("results-screen");
    setAnalysisLoading(true);

    // Here you send the blob to your backend
    // Example:
    // const formData = new FormData();
    // formData.append("image", blob, "meal.jpg");
    //
    // const response = await fetch("https://api.macronutri.app/analyze", {
    //   method: "POST",
    //   body: formData,
    // });
    // const data = await response.json();
    //
    // For now, we simulate with mock data:
    simulateBackendAnalysis(blob);
  }, "image/jpeg", 0.9);
}

function setAnalysisLoading(isLoading) {
  const loadingCard = document.getElementById("analysis-state");
  const resultCard = document.getElementById("analysis-result");
  if (isLoading) {
    loadingCard.classList.remove("hidden");
    resultCard.classList.add("hidden");
  } else {
    loadingCard.classList.add("hidden");
    resultCard.classList.remove("hidden");
  }
}

// Mock backend response
function simulateBackendAnalysis(_blob) {
  setTimeout(() => {
    const mock = {
      food: "Grilled chicken salad",
      calories: 430,
      protein: 36,
      carbs: 22,
      fat: 18,
      note: "Estimated values based on portion size and ingredients.",
    };
    applyAnalysisResult(mock);
  }, 1500);
}

function applyAnalysisResult(data) {
  document.getElementById("meal-name").textContent = data.food;
  document.getElementById("meal-calories").textContent = `${data.calories} kcal`;
  document.getElementById("meal-protein").textContent = `${data.protein} g`;
  document.getElementById("meal-carbs").textContent = `${data.carbs} g`;
  document.getElementById("meal-fat").textContent = `${data.fat} g`;
  document.getElementById("meal-note").textContent = data.note || "";

  setAnalysisLoading(false);
}

// Save meal (front-end only demo)
const saveMealBtn = document.getElementById("save-meal");
const consumedTodayEl = document.getElementById("consumed-today");
let consumedToday = 0;

saveMealBtn.addEventListener("click", () => {
  const caloriesText = document
    .getElementById("meal-calories")
    .textContent.replace(" kcal", "");
  const calories = parseInt(caloriesText || "0", 10);
  consumedToday += calories;
  consumedTodayEl.textContent = `${consumedToday} kcal`;
  consumedTodayEl.classList.add("accent");
  alert("Meal saved to today (front-end demo only).");
});

// Support AI placeholder
const supportSendBtn = document.getElementById("support-send");
const supportInput = document.getElementById("support-input");
const supportResponse = document.getElementById("support-response");

supportSendBtn.addEventListener("click", async () => {
  const question = supportInput.value.trim();
  if (!question) {
    alert("Please type a question first.");
    return;
  }

  supportResponse.textContent = "Thinking with MacroNutri AI…";

  // Example real call:
  // const res = await fetch("https://api.macronutri.app/support", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ question }),
  // });
  // const data = await res.json();
  // supportResponse.textContent = data.answer;

  // For now, simulate:
  setTimeout(() => {
    supportResponse.textContent =
      "This is a placeholder AI response. Connect this to your backend support endpoint.";
  }, 1200);
});

// Wire camera buttons
if (startCameraBtn) {
  startCameraBtn.addEventListener("click", startCamera);
}
if (captureBtn) {
  captureBtn.addEventListener("click", captureAndAnalyze);
}

// Stop camera when leaving scan screen
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-target]");
  if (!target) return;
  const screenId = target.getAttribute("data-target");
  if (screenId !== "scan-screen") {
    stopCamera();
  }
});
