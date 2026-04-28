import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { toast } from "react-toastify";
import { GraduationCap, Briefcase, Code } from "lucide-react";

export default function ResumePage() {
  const user = useSelector(selectuser);
  const [isPaid, setIsPaid] = useState(false);
  const [existingResume, setExistingResume] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    education: "",
    experience: "",
    skills: "",
  });

  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  // 🔹 Handle form change
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Send OTP
  const sendOtp = async () => {
    try {
      await axios.post(
        "https://internshala-clone-uclt.onrender.com/api/otp/send",
        {
          email: user?.email,
        },
      );

      toast.success("OTP sent");
      setShowOtp(true);
    } catch {
      toast.error("Failed to send OTP");
    }
  };

  // 🔹 Verify OTP + Payment
  const verifyOtpAndPay = async () => {
    try {
      const res = await axios.post(
        "https://internshala-clone-uclt.onrender.com/api/otp/verify",
        {
          email: user?.email,
          otp,
        },
      );

      if (res.data.success) {
        startPayment();
      }
    } catch {
      toast.error("Invalid OTP");
    }
  };

  // 🔹 Razorpay Payment
  const startPayment = async () => {
    try {
      const { data } = await axios.post(
        "https://internshala-clone-uclt.onrender.com/api/resume/create-order",
      );

      console.log("Order:", data);

      if (!window.Razorpay) {
        alert("Razorpay not loaded");
        return;
      }

      const options = {
        key: "rzp_test_SdOlrkVOSi3Smb", // 🔥 PUT REAL KEY
        amount: data.amount,
        currency: "INR",
        name: "InternArea",
        description: "Resume Service",
        order_id: data.id,

        handler: async function (response) {
          try {
            // 🔹 Step A: Verify payment
            const verifyRes = await axios.post(
              "https://internshala-clone-uclt.onrender.com/api/resume/verify-payment",
              response,
            );

            if (!verifyRes.data.success) {
              toast.error("Payment verification failed");
              return;
            }

            // 🔹 Step B: KEEP YOUR EXISTING LOGIC (no change)
            toast.success("Payment Successful 🎉");

            await axios.post(
              "https://internshala-clone-uclt.onrender.com/api/resume/save-resume",
              {
                email: user?.email,
                resumeData: form,
              },
            );

            setIsPaid(true);
            setExistingResume(form);

            toast.success("Resume Generated Successfully");
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },

        modal: {
          ondismiss: function () {
            toast.info("Payment popup closed");
          },
        },

        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error("Payment failed to start");
    }
  };

  // const handleFakePayment = async () => {
  //   try {
  //     toast.success("Simulated Payment Success (Demo Mode)");

  //     await axios.post("https://internshala-clone-uclt.onrender.com/api/resume/save-resume", {
  //       email: user?.email,
  //       resumeData: form,
  //     });
  //     setIsPaid(true); // ✅ important
  //     setExistingResume(form); // add this

  //     toast.success("Resume Generated Successfully 🎉");
  //   } catch (err) {
  //     toast.error("Something went wrong");
  //   }
  // };

  const downloadPDF = async () => {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const element = document.getElementById("resume-preview");

    if (!element) {
      alert("Resume not found");
      return;
    }

    // ✅ Create a temporary A4 container (DOES NOT affect UI)
    const a4 = document.createElement("div");
    a4.style.width = "794px"; // A4 width (96 DPI)
    a4.style.minHeight = "1123px"; // A4 height
    a4.style.padding = "20px";
    a4.style.background = "#ffffff";

    // Clone your resume into A4 container
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.transform = "scale(1)";
    clone.style.width = "100%";

    a4.appendChild(clone);
    document.body.appendChild(a4);

    const canvas = await html2canvas(a4, {
      scale: 2,
      useCORS: true,
    });

    document.body.removeChild(a4); // cleanup

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    pdf.addImage(imgData, "PNG", 0, 0, 210, 297); // ✅ exact A4 size

    pdf.save("resume.pdf");
  };

  useEffect(() => {
    const fetchResume = async () => {
      if (!user?.email) return;

      try {
        const res = await axios.get(
          `https://internshala-clone-uclt.onrender.com/api/resume/get-resume/${user?.email}`,
        );

        // ✅ CHECK IF REAL DATA EXISTS
        if (
          res.data &&
          res.data.name &&
          res.data.education &&
          res.data.skills
        ) {
          setExistingResume(res.data);
        } else {
          setExistingResume(null); // 🔥 IMPORTANT
        }
      } catch (err) {
        console.log(err);
        setExistingResume(null);
      }
    };

    fetchResume();
  }, [user?.email]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Resume</h1>

      {/* ✅ IF RESUME EXISTS → SHOW IT */}
      {existingResume && (
        <div className="mt-6">
          <div
            id="resume-preview"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div className="flex min-h-[500px]">
              {/* 🔵 LEFT SIDEBAR */}
              <div
                className="w-2/5 text-white p-6 flex flex-col items-center"
                style={{ background: "#1D4ED8" }}
              >
                <img
                  src={user?.photo || "https://via.placeholder.com/100"}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4"
                />

                <h2 className="text-xl font-bold text-center">
                  {existingResume.name}
                </h2>

                <p className="text-sm text-center opacity-90">{user?.email}</p>
              </div>

              {/* ⚪ RIGHT CONTENT */}
              <div className="w-3/5 p-8 space-y-6">
                {/* EDUCATION */}
                <div>
                  <h3
                    className="text-lg font-bold border-b pb-1 mb-2 flex items-center gap-2"
                    style={{ color: "#1f2937", borderColor: "#e5e7eb" }}
                  >
                    <GraduationCap size={24} />
                    <span>Education</span>
                  </h3>
                  <p style={{ color: "#374151" }}>{existingResume.education}</p>
                </div>

                {/* EXPERIENCE */}
                <div>
                  <h3
                    className="text-lg font-bold border-b pb-1 mb-2 flex items-center gap-2"
                    style={{ color: "#1f2937", borderColor: "#e5e7eb" }}
                  >
                    <Briefcase size={22} />
                    <span>Experience</span>
                  </h3>
                  <p style={{ color: "#374151" }}>
                    {existingResume.experience}
                  </p>
                </div>

                {/* ✅ SKILLS (NOW ON RIGHT SIDE) */}
                <div>
                  <h3
                    className="text-lg font-bold border-b pb-1 mb-2 flex items-center gap-2"
                    style={{ color: "#1f2937", borderColor: "#e5e7eb" }}
                  >
                    <Code size={22} />
                    <span>Skills</span>
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {(existingResume.skills || "")
                      .split(",")
                      .map((skill: string, i: number) => (
                        <span key={i} style={{ color: "#374151" }}>
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DOWNLOAD BUTTON */}
          <div className="flex justify-end mt-4">
            <button
              onClick={downloadPDF}
              className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2 rounded-lg shadow"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}

      {/* ✅ IF NO RESUME → SHOW FORM */}
      {!existingResume && (
        <>
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          />
          <input
            name="education"
            placeholder="Education"
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          />
          <input
            name="experience"
            placeholder="Experience"
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          />
          <input
            name="skills"
            placeholder="Skills"
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          />

          <button
            onClick={sendOtp}
            className="bg-blue-600 text-white px-4 py-2 mt-4"
          >
            Generate Resume (₹50)
          </button>

          {showOtp && (
            <div className="mt-4">
              <input
                placeholder="Enter OTP"
                onChange={(e) => setOtp(e.target.value)}
                className="border p-2 w-full"
              />
              <button
                onClick={verifyOtpAndPay}
                className="bg-green-600 text-white px-4 py-2 mt-2"
              >
                Verify & Pay
              </button>

              {/* <button
                onClick={handleFakePayment}
                className="bg-gray-500 text-white px-4 py-2 mt-2 ml-2"
              >
                Demo Payment
              </button> */}
            </div>
          )}
        </>
      )}
    </div>
  );
}
