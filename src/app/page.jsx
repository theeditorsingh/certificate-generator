"use client";
import React from "react";

function MainComponent() {
  const [formData, setFormData] = React.useState({
    fullName: "",
    contributionType: "participation",
    eventName: "",
    date: new Date().toISOString().split("T")[0],
    presentedBy: "",
    designation: "Founder",
    certificateId: "",
    certificateType: "Certificate of Appreciation",
  });

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = React.useState(false);
  const [showErrorPopup, setShowErrorPopup] = React.useState(false);

  React.useEffect(() => {
    const generateId = () => {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 999)
        .toString()
        .padStart(3, "0");
      return `HIM-CRT-${year}-${random}`;
    };

    if (!formData.certificateId) {
      setFormData((prev) => ({ ...prev, certificateId: generateId() }));
    }
  }, []);

  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const response = await fetch(
          `/integrations/qr-code/generatebasicbase64?data=${encodeURIComponent(
            "https://www.instagram.com/thehimadrifoundation/"
          )}&size=100`
        );
        if (response.ok) {
          const qrData = await response.text();
          setQrCode(`data:image/png;base64,${qrData}`);
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };
    generateQR();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      contributionType: "participation",
      eventName: "",
      date: new Date().toISOString().split("T")[0],
      presentedBy: "",
      designation: "Founder",
      certificateId: "",
      certificateType: "Certificate of Appreciation",
    });
    setShowPreview(false);
  };

  const contributionTypes = {
    participation: "participation",
    contribution: "contribution",
    support: "support",
    volunteer: "volunteer work",
    collaboration: "collaboration",
  };

  const downloadCertificate = async () => {
    setIsGenerating(true);

    try {
      // Load html2canvas if not available
      if (typeof html2canvas === "undefined") {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        // Wait for script to be ready
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Load background and logo images - code by HS
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      const [backgroundImg, logoImg] = await Promise.all([
        loadImage("/images/certificate.png"), // assuming your background image is named background.png
        loadImage("/images/thf_logo.png"),
      ]);
      
      // Create canvas for high-quality rendering
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 1200;
      canvas.height = 900;

      // Enable high-quality text rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.textRenderingOptimization = "optimizeQuality";

      // Draw background image at full quality
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

      // Set up text styling
      ctx.textAlign = "center";
      ctx.fillStyle = "#1f2937";

      // Certificate ID (top right with proper padding)
      ctx.font = "14px Arial";
      ctx.textAlign = "right";
      ctx.fillText(
        `Certificate ID: ${formData.certificateId}`,
        canvas.width - 85,
        90
      );

      // Logo (center top)
      const logoSize = 80;
      ctx.drawImage(logoImg, (canvas.width - logoSize) / 2, 120, logoSize, logoSize );

      // Foundation name
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("The Himadri Foundation", canvas.width / 2, 240);

      // Certificate type
      ctx.font = "bold 42px Arial";
      ctx.fillStyle = "#1e40af";
      ctx.fillText(formData.certificateType, canvas.width / 2, 320);

      // Blue line under certificate type
      ctx.fillStyle = "#2563eb";
      ctx.fillRect((canvas.width - 120) / 2, 335, 120, 3);

      // "This certificate is proudly presented to"
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#374151";
      ctx.fillText(
        "This certificate is proudly presented to",
        canvas.width / 2,
        400
      );

      // Recipient name
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#1e40af";
      ctx.fillText(formData.fullName, canvas.width / 2, 460);

      // Recognition text
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#374151";
      ctx.textAlign = "center";

      const recognitionText = `In recognition of your valuable ${
        contributionTypes[formData.contributionType]
      } to The Himadri Foundation`;
      const eventText = formData.eventName
        ? ` during ${formData.eventName}`
        : "";
      const fullRecognitionText = recognitionText + eventText + ".";

      // Wrap text if too long
      const maxWidth = 800;
      const words = fullRecognitionText.split(" ");
      let line = "";
      let y = 520;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[i] + " ";
          y += 30;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);

      // Mission text
      y += 50;
      ctx.fillText(
        "Your involvement has contributed to our mission of",
        canvas.width / 2,
        y
      );
      y += 30;
      ctx.fillText(
        "empowering mountain communities and promoting sustainable development.",
        canvas.width / 2,
        y
      );

      // Gratitude text
      y += 50;
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#1f2937";
      ctx.fillText(
        "We express our heartfelt gratitude and look forward to future collaborations.",
        canvas.width / 2,
        y
      );

      // Date (bottom left)
      ctx.font = "16px Arial";
      ctx.fillStyle = "#4b5563";
      ctx.textAlign = "left";
      ctx.fillText("Date:", 80, canvas.height - 120);

      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#1f2937";
      const formattedDate = new Date(formData.date).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      ctx.fillText(formattedDate, 80, canvas.height - 90);

      // Presenter info (bottom right)
      ctx.textAlign = "right";
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#1f2937";
      ctx.fillText(
        formData.presentedBy,
        canvas.width - 80,
        canvas.height - 120
      );

      // Signature line
      ctx.strokeStyle = "#4b5563";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width - 280, canvas.height - 100);
      ctx.lineTo(canvas.width - 80, canvas.height - 100);
      ctx.stroke();

      ctx.font = "16px Arial";
      ctx.fillStyle = "#4b5563";
      ctx.fillText(formData.designation, canvas.width - 80, canvas.height - 75);

      // Create download link
      const link = document.createElement("a");
      const fileName = `Certificate-${formData.fullName.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}-${formData.certificateId}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL("image/png", 1.0);

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      console.error("Error generating certificate:", error);
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <img
              src="/images/thf_logo.png"
              alt="Himadri Foundation Logo"
              className="h-12 w-12 object-contain mr-3"
            />

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif">
                Certificate Generator
              </h1>
            </div>
            <div className="w-16 h-0.5 bg-blue-600 mx-auto"></div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Certificate Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Certificate Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate Type *
                </label>
                <select
                  value={formData.certificateType}
                  onChange={(e) =>
                    handleInputChange("certificateType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                >
                  <option value="Certificate of Appreciation">
                    Certificate of Appreciation
                  </option>
                  <option value="Certificate of Recognition">
                    Certificate of Recognition
                  </option>
                  <option value="Himadri Honour Certificate">
                    Himadri Honour Certificate
                  </option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                  placeholder="Enter recipient's full name"
                />
              </div>

              {/* Contribution Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contribution Type *
                </label>
                <select
                  value={formData.contributionType}
                  onChange={(e) =>
                    handleInputChange("contributionType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                >
                  {Object.entries(contributionTypes).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event/Activity Name
                </label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) =>
                    handleInputChange("eventName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                  placeholder="Enter event name (optional)"
                />
              </div>

              {/* Presented By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presented By *
                </label>
                <input
                  type="text"
                  value={formData.presentedBy}
                  onChange={(e) =>
                    handleInputChange("presentedBy", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                  placeholder="Enter presenter's name"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) =>
                    handleInputChange("designation", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                  placeholder="e.g., Founder, Director"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                />
              </div>

              {/* Certificate ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate ID
                </label>
                <input
                  type="text"
                  value={formData.certificateId}
                  onChange={(e) =>
                    handleInputChange("certificateId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                  placeholder="Auto-generated ID"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center mt-6 space-x-4">
              <button
                onClick={resetForm}
                className="px-6 py-2 rounded-md font-medium text-sm bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200"
              >
                Reset Form
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                disabled={!formData.fullName || !formData.presentedBy}
                className={`px-6 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                  formData.fullName && formData.presentedBy
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {showPreview ? "Hide Preview" : "Generate Preview"}
              </button>
            </div>
          </div>

          {/* Certificate Preview Section */}
          {showPreview && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Certificate Preview
                </h2>
              </div>

              {formData.fullName && formData.presentedBy ? (
                <div className="flex justify-center mb-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 w-full max-w-4xl overflow-x-auto">
                    <div
                      id="certificate"
                      className="relative mx-auto"
                      style={{
                        width: "auto",
                        height: "624px",
                        minWidth: "816px",
                        backgroundImage:"url('/images/certificate.png')", // <-- local image path
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        padding: "48px",
                        boxSizing: "border-box",
                      }}
                    >
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="absolute top-0 right-0 text-xs text-gray-700 font-medium pr-0">
                          Certificate ID: {formData.certificateId}
                        </div>

                        <div className="text-center">
                          <div className="flex justify-center items-center mb-2">
                            <img
                              src="https://ucarecdn.com/3401fbc5-c6dc-47ae-b7c9-d1b3cdb1d073/-/format/auto/"
                              alt="Himadri Foundation Logo"
                              className="h-16 w-16 object-contain"
                              style={{
                                display: "block",
                                visibility: "visible",
                              }}
                            />
                          </div>
                          <h1 className="text-2xl font-bold text-gray-800 mb-1">
                            The Himadri Foundation
                          </h1>

                          <h2
                            className="text-3xl font-bold text-blue-800 mb-2"
                            style={{ marginTop: "24px" }}
                          >
                            {formData.certificateType}
                          </h2>
                          <div className="w-24 h-0.5 bg-blue-600 mx-auto mb-4"></div>
                        </div>

                        <div className="text-center flex-1 flex flex-col justify-center">
                          <p className="text-base text-gray-700 mb-4">
                            This certificate is proudly presented to
                          </p>

                          <div className="mb-6">
                            <h3 className="text-3xl font-bold text-blue-800 pb-2 inline-block">
                              {formData.fullName}
                            </h3>
                          </div>

                          <div className="text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
                            <p className="mb-3">
                              In recognition of your valuable{" "}
                              <strong>
                                {contributionTypes[formData.contributionType]}
                              </strong>{" "}
                              to The Himadri Foundation
                              {formData.eventName && (
                                <span>
                                  {" "}
                                  during <strong>{formData.eventName}</strong>
                                </span>
                              )}
                              .
                            </p>

                            <p className="mb-3">
                              Your involvement has contributed to our mission of
                              empowering mountain communities and promoting
                              sustainable development.
                            </p>

                            <p className="font-semibold text-gray-800">
                              We express our heartfelt gratitude and look
                              forward to future collaborations.
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="text-left">
                            <p className="text-sm text-gray-600 mb-1">Date:</p>
                            <p className="font-semibold text-gray-800 text-base">
                              {new Date(formData.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="pt-2 min-w-[140px]">
                              <p className="font-semibold text-gray-800 text-base">
                                {formData.presentedBy}
                              </p>
                              <div className="border-t-2 border-gray-600 pt-1 mt-2">
                                <p className="text-sm text-gray-600">
                                  {formData.designation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Download Button */}
                    <div className="text-center mt-6">
                      <button
                        onClick={downloadCertificate}
                        disabled={isGenerating}
                        className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Generating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-download mr-2"></i>
                            Download Certificate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <i className="fas fa-certificate text-6xl mb-4 opacity-30"></i>
                  <p className="text-xl">
                    Fill in the required fields to generate certificate preview
                  </p>
                </div>
              )}
            </>
          )}

          {/* How to Use Guide */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              <i className="fas fa-question-circle mr-2 text-blue-600"></i>
              How to Use This Generator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-edit text-white text-lg"></i>
                </div>
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  1. Fill Details
                </h4>
                <p className="text-gray-600 text-sm">
                  Complete all the form fields with recipient information and
                  contribution details
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gray-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-eye text-white text-lg"></i>
                </div>
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  2. Preview
                </h4>
                <p className="text-gray-600 text-sm">
                  Review your certificate design and make any necessary
                  adjustments
                </p>
              </div>
              <div className="text-center">
                <div className="bg-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-download text-white text-lg"></i>
                </div>
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  3. Download
                </h4>
                <p className="text-gray-600 text-sm">
                  Download your certificate as a high-quality PNG image
                </p>
              </div>
            </div>
          </div> */}

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500">
            <p className="text-sm">Designed with ❤️ by Harmeet Singh</p>
            <p className="text-xs mt-1">
              © 2025 The Himadri Foundation. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center shadow-lg border border-gray-200">
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Success!
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Your certificate has been downloaded successfully.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center shadow-lg border border-gray-200">
           
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Error!</h3>
            <p className="text-gray-600 mb-4 text-sm">
              There was an error generating your certificate. Please try again.
            </p>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    </div>
  );
}

export default MainComponent;