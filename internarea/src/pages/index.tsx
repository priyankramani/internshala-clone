import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";
import axios from "axios";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useTranslation } from "react-i18next";

import {
  ArrowUpRight,
  MapPin,
  Banknote,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default function SvgSlider() {
  const { t, i18n } = useTranslation();

  const [mounted, setMounted] = useState(false);

  const [internships, setinternship] = useState<any[]>([]);
  const [jobs, setjob] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { key: "bigBrands", value: "Big Brands" },
    { key: "wfh", value: "Work From Home" },
    { key: "partTime", value: "Part-time" },
    { key: "mba", value: "MBA" },
    { key: "engineering", value: "Engineering" },
    { key: "media", value: "Media" },
    { key: "design", value: "Design" },
    { key: "dataScience", value: "Data Science" },
  ];

  const slides = [
    {
      pattern: "pattern-1",
      title: t("slider.title1"),
      bgColor: "bg-indigo-600",
    },
    {
      pattern: "pattern-2",
      title: t("slider.title2"),
      bgColor: "bg-blue-600",
    },
    {
      pattern: "pattern-3",
      title: t("slider.title3"),
      bgColor: "bg-purple-600",
    },
    {
      pattern: "pattern-4",
      title: t("slider.title4"),
      bgColor: "bg-teal-600",
    },
  ];

  const stats = [
    { number: "300K+", label: t("stats.companies") },
    { number: "10K+", label: t("stats.openings") },
    { number: "21Mn+", label: t("stats.students") },
    { number: "600K+", label: t("stats.learners") },
  ];

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const [internshipres, jobres] = await Promise.all([
          axios.get(
            "https://internshala-clone-uclt.onrender.com/api/internship",
          ),
          axios.get("https://internshala-clone-uclt.onrender.com/api/job"),
        ]);

        setinternship(internshipres.data);
        setjob(jobres.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchdata();
  }, []);

  const filteredInternships = internships.filter(
    (item: any) => !selectedCategory || item.category === selectedCategory,
  );

  const filteredJobs = jobs.filter(
    (item: any) => !selectedCategory || item.category === selectedCategory,
  );

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HERO */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t("home.title")}
        </h1>

        <p className="text-xl text-gray-600">{t("home.subtitle")}</p>
      </div>

      {/* SLIDER */}
      <div className="mb-16">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="rounded-xl overflow-hidden shadow-lg"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className={`relative h-[400px] ${slide.bgColor}`}>
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full">
                    <rect width="100%" height="100%" fill="white" />
                  </svg>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-4xl font-bold text-white text-center px-4">
                    {slide.title}
                  </h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* CATEGORY */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t("home.latestInternships")}
        </h2>

        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-gray-700 font-medium">
            {t("home.categories")}
          </span>

          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === "" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            {t("common.all")}
          </button>

          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t(`categories.${category.key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* INTERNSHIPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredInternships.map((internship: any, index: number) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105"
          >
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <ArrowUpRight size={20} />
              <span className="font-medium">{t("home.activelyHiring")}</span>
            </div>

            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              {internship.title}
            </h3>

            <p className="text-gray-500 mb-4">{internship.company}</p>

            <div className="space-y-3 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{internship.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Banknote size={18} />
                <span>{internship.stipend}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{internship.duration}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                {t("home.internshipTag")}
              </span>

              <Link
                href={`/detailinternship/${internship._id}`}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {t("home.viewDetails")}
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* JOBS */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t("home.latestJobs")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job: any, index: number) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105"
            >
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <ArrowUpRight size={20} />
                <span className="font-medium">{t("home.activelyHiring")}</span>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {job.title}
              </h3>

              <p className="text-gray-500 mb-4">{job.company}</p>

              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{job.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Banknote size={18} />
                  <span>{job.CTC}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{job.Experience}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {t("home.jobTag")}
                </span>

                <Link
                  href={`/detailjob/${job._id}`}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {t("home.viewDetails")}
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>

              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
