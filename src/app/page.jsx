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

  // const [qrCode, setQrCode] = React.useState("");
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

  // React.useEffect(() => {
  //   const generateQR = async () => {
  //     try {
  //       const response = await fetch(
  //         `/integrations/qr-code/generatebasicbase64?data=${encodeURIComponent(
  //           "https://www.instagram.com/thehimadrifoundation/"
  //         )}&size=100`
  //       );
  //       if (response.ok) {
  //         const qrData = await response.text();
  //         setQrCode(`data:image/png;base64,${qrData}`);
  //       }
  //     } catch (error) {
  //       console.error("Error generating QR code:", error);
  //     }
  //   };
  //   generateQR();
  // }, []);

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
      // Check if html2canvas is available
      if (typeof html2canvas === "undefined") {
        // Try to load html2canvas if not available
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const certificateElement = document.getElementById("certificate");
      if (!certificateElement) {
        throw new Error("Certificate element not found");
      }

      // Wait longer for images to load and ensure they're visible
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Ensure all images are loaded
      const images = certificateElement.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
            setTimeout(resolve, 3000); // Timeout after 3 seconds
          });
        })
      );
      

      const canvas = await html2canvas(certificateElement, {
        scale: 4,
        useCORS: true,
        allowTaint: false,
        // backgroundColor: "#ffffff",
        logging: false,
        width: certificateElement.offsetWidth,
        height: certificateElement.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: certificateElement.offsetWidth,
        windowHeight: certificateElement.offsetHeight,
        foreignObjectRendering: true,
        onclone: (clonedDoc) => {
          // Ensure all images are visible in the cloned document
          const clonedImages = clonedDoc.querySelectorAll("img");
          clonedImages.forEach((img) => {
            img.style.display = "block";
            img.style.visibility = "visible";
            img.style.opacity = "1";
          });
        },
      });

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
      console.error("Detailed error generating certificate:", error);
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-800 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-yellow-400 rounded-full"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-blue-300 rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 border border-green-300 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 border-2 border-yellow-300 rounded-full"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <img
              
                src="/image/logo.png"
                alt="Himadri Foundation Logo"
                className="h-24 w-24 object-contain mr-4"
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-serif">
                  Certificate Generator
                </h1>
              </div>
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded-full"></div>
          </div>

          {/* Form Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 mb-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                Certificate Information
              </h2>
              <p className="text-gray-600">
                Fill in all the details to generate your certificate
              </p>
            </div>

            <div className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-6">
                  <i className="fas fa-info-circle mr-2 text-blue-600"></i>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-blue-900 mb-3">
                      <i className="fas fa-award mr-2 text-yellow-600"></i>
                      Certificate Type *
                    </label>
                    <select
                      value={formData.certificateType}
                      onChange={(e) =>
                        handleInputChange("certificateType", e.target.value)
                      }
                      className="w-full px-4 py-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-lg transition-all duration-300 bg-white"
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

                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-blue-900 mb-3">
                      <i className="fas fa-user mr-2 text-green-600"></i>
                      Full Name of Recipient *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className="w-full px-4 py-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 text-lg transition-all duration-300 bg-white"
                      placeholder="Enter recipient's full name"
                    />
                  </div>
                </div>
              </div>

              {/* Contribution Details Section */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-blue-900 mb-6">
                  <i className="fas fa-hands-helping mr-2 text-green-600"></i>
                  Contribution Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-blue-900 mb-3">
                      <i className="fas fa-heart mr-2 text-red-500"></i>
                      Type of Contribution *
                    </label>
                    <select
                      value={formData.contributionType}
                      onChange={(e) =>
                        handleInputChange("contributionType", e.target.value)
                      }
                      className="w-full px-4 py-4 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg transition-all duration-300 bg-white"
                    >
                      {Object.entries(contributionTypes).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-blue-900 mb-3">
                      <i className="fas fa-calendar-alt mr-2 text-purple-600"></i>
                      Event/Activity Name
                    </label>
                    <input
                      type="text"
                      value={formData.eventName}
                      onChange={(e) =>
                        handleInputChange("eventName", e.target.value)
                      }
                      className="w-full px-4 py-4 border-2 border-green-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-green-500 text-lg transition-all duration-300 bg-white"
                      placeholder="Enter event or activity name (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Presenter Information Section */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-blue-900 mb-6">
                  <i className="fas fa-signature mr-2 text-yellow-600"></i>
                  Presenter Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-blue-900 mb-3">
                      <i className="fas fa-user-tie mr-2 text-blue-600"></i>
                      Presented By *
                    </label>
                    <input
                      type="text"
                      value={formData.presentedBy}
                      onChange={(e) =>
                        handleInputChange("presentedBy", e.target.value)
                      }
                      className="w-full px-4 py-4 border-2 border-yellow-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-500 text-lg transition-all duration-300 bg-white"
                      placeholder="Enter presenter's name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-blue-900 mb-3">
                      <i className="fas fa-briefcase mr-2 text-indigo-600"></i>
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) =>
                        handleInputChange("designation", e.target.value)
                      }
                      className="w-full px-4 py-4 border-2 border-yellow-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-500 text-lg transition-all duration-300 bg-white"
                      placeholder="e.g., Founder, Director"
                    />
                  </div>
                </div>
              </div>

              {/* Certificate Details Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-blue-900 mb-6">
                  <i className="fas fa-certificate mr-2 text-purple-600"></i>
                  Certificate Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-blue-900 mb-3">
                      <i className="fas fa-calendar mr-2 text-red-600"></i>
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                      className="w-full px-4 py-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-lg transition-all duration-300 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-blue-900 mb-3">
                      <i className="fas fa-id-card mr-2 text-orange-600"></i>
                      Certificate ID
                    </label>
                    <input
                      type="text"
                      value={formData.certificateId}
                      onChange={(e) =>
                        handleInputChange("certificateId", e.target.value)
                      }
                      className="w-full px-4 py-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-lg transition-all duration-300 bg-white"
                      placeholder="Auto-generated ID"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center mt-12 space-x-6">
              <button
                onClick={resetForm}
                className="px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <i className="fas fa-redo mr-2"></i>
                Reset Form
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                disabled={!formData.fullName || !formData.presentedBy}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  formData.fullName && formData.presentedBy
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <i className="fas fa-eye mr-2"></i>
                {showPreview ? "Hide Preview" : "Generate Preview"}
              </button>
            </div>
          </div>

          {/* Certificate Preview Section */}
          {showPreview && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg">
                  <i className="fas fa-certificate text-3xl text-yellow-600 mr-4"></i>
                  <h2 className="text-2xl font-bold text-blue-900">
                    Certificate Preview
                  </h2>
                </div>
              </div>

              {formData.fullName && formData.presentedBy ? (
                <div className="flex justify-center mb-8">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                    <div
                      id="certificate"
                      className="relative overflow-hidden shadow-2xl rounded-lg"
                      style={{
                        width: "870px",
                        height: "624px",
                        aspectRatio: "8.5/6.5",
                        backgroundImage:
                          "url('/image/certificate.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        padding: "52px",
                      }}
                    >

                      
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="absolute top-0 right-0 text-xs text-gray-700 font-medium">
                          Certificate ID: {formData.certificateId}
                        </div>

                        <div className="text-center">
                          <div className="flex justify-center items-center mb-2">
                            <img
                              src="/image/logo.png"
                              alt="Himadri Foundation Logo"
                              className="h-16 w-16 object-contain"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <h1 className="text-l font-bold text-gray-800 mb-1">
                            The Himadri Foundation
                          </h1>
                          <h2 className="text-xs"> From The Himalayas, For The Himalayas</h2>

                          <h2
                            className="text-3xl font-bold text-blue-800 mb-2 font-baskerville"
                            style={{ marginTop: "24px" }}
                          >
                            {formData.certificateType}
                          </h2>
                          <div className="w-24 h-0.5 bg-blue-600 mx-auto mb-4"></div>
                        </div>

                        <div className="text-center flex-1 flex flex-col justify-center">
                          <p className="text-base text-gray-700 mb-2">
                            This certificate is proudly presented to
                          </p>

                          <div className="mb-2">
                            <h3 className="text-2xl font-bold text-blue-800 inline-block font-montecarlo">
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


                          //QR CODE
                          {/* <div className="text-center">
                            {qrCode && (
                              <div>
                                <img
                                  src={qrCode}
                                  alt="QR Code"
                                  className="w-12 h-12 mx-auto mb-1"
                                  crossOrigin="anonymous"
                                />
                                <p className="text-xs text-gray-600">
                                  Follow us
                                </p>
                              </div>
                            )}
                          </div> */}

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
                    <div className="text-center mt-8">
                      <button
                        onClick={downloadCertificate}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-12 py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-3"></i>
                            Generating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-download mr-3"></i>
                            Download Certificate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-white">
                  <i className="fas fa-certificate text-6xl mb-4 opacity-50"></i>
                  <p className="text-xl">
                    Fill in the required fields to generate certificate preview
                  </p>
                </div>
              )}
            </>
          )}

          
          {/* Footer */}
          <div className="text-center mt-12 text-white/80">
            <p className="text-lg">Designed with ❤️ by Harmeet Singh</p>
            <p className="text-sm mt-2">
              © 2025 The Himadri Foundation. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl border-4 border-green-500">
            
            <h3 className="text-3xl font-bold text-green-700 mb-4">Success!</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Your certificate has been downloaded successfully.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl border-4 border-red-500">
                        <h3 className="text-3xl font-bold text-red-700 mb-4">Error!</h3>
            <p className="text-gray-600 mb-6 text-lg">
              There was an error generating your certificate. Please try again.
            </p>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    </div>
  );
}

export default MainComponent;