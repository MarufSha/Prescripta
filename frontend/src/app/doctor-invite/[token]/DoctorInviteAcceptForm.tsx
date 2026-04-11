"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

type Props = {
  token: string;
};

export default function DoctorInviteAcceptForm({ token }: Props) {
  const router = useRouter();

  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [password, setPassword] = useState("");

  const [specialties, setSpecialties] = useState("");
  const [bmdcNo, setBmdcNo] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [designations, setDesignations] = useState("");
  const [degrees, setDegrees] = useState("");
  const [chambers, setChambers] = useState([{ name: "", location: "" }]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invalidInvite, setInvalidInvite] = useState(false);

  useEffect(() => {
    const loadInvite = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/doctor-invites/${token}`);
        setInviteName(res.data.invite.name);
        setInviteEmail(res.data.invite.email);
      } catch {
        setInvalidInvite(true);
      } finally {
        setIsLoading(false);
      }
    };

    void loadInvite();
  }, [token]);

  const updateChamber = (
    index: number,
    field: "name" | "location",
    value: string,
  ) => {
    setChambers((prev) =>
      prev.map((chamber, chamberIndex) =>
        chamberIndex === index ? { ...chamber, [field]: value } : chamber,
      ),
    );
  };

  const addChamber = () => {
    setChambers((prev) => [...prev, { name: "", location: "" }]);
  };

  const removeChamber = (index: number) => {
    setChambers((prev) =>
      prev.filter((_, chamberIndex) => chamberIndex !== index),
    );
  };

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const csrfResponse = await axios.get(`${API_BASE_URL}/auth/csrf-token`, {
        withCredentials: true,
      });

      const tokenFromServer = String(csrfResponse.data?.csrfToken || "");

      await axios.post(
        `${API_BASE_URL}/doctor-invites/${token}/accept`,
        {
          password,
          doctorProfile: {
            specialties: parseList(specialties),
            bmdcNo,
            mobileNumber,
            designations: parseList(designations),
            degrees: parseList(degrees),
            chambers: chambers.filter(
              (chamber) => chamber.name.trim() && chamber.location.trim(),
            ),
          },
        },
        {
          withCredentials: true,
          headers: {
            "x-csrf-token": tokenFromServer,
          },
        },
      );

      toast.success("Doctor account created successfully");
      router.replace("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Failed to complete doctor onboarding",
        );
      } else {
        toast.error("Failed to complete doctor onboarding");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <LoadingSpinner />;{" "}
      </div>
    );
  }

  if (invalidInvite) {
    return (
      <div className="flex flex-col items-center justify-center text-5xl font-semibold text-red-400">
        Invalid or expired invite
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl rounded-3xl border border-gray-800 bg-gray-900/70 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Complete Doctor Setup
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Welcome, {inviteName}. Complete your doctor account setup below.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-950/50 p-4 text-sm text-gray-300">
          <p>
            <span className="font-semibold text-white">Name:</span> {inviteName}
          </p>
          <p className="mt-1">
            <span className="font-semibold text-white">Email:</span>{" "}
            {inviteEmail}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />

          <input
            placeholder="Specialties (comma separated)"
            value={specialties}
            onChange={(e) => setSpecialties(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />

          <input
            placeholder="BMDC No."
            value={bmdcNo}
            onChange={(e) => setBmdcNo(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />

          <input
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />

          <input
            placeholder="Designations (comma separated)"
            value={designations}
            onChange={(e) => setDesignations(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />

          <input
            placeholder="Degrees (comma separated)"
            value={degrees}
            onChange={(e) => setDegrees(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Chambers</p>

              <button
                type="button"
                onClick={addChamber}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
              >
                <span className="text-base leading-none">+</span>
                Add
              </button>
            </div>

            {chambers.map((chamber, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    placeholder="Chamber Name"
                    value={chamber.name}
                    onChange={(e) =>
                      updateChamber(index, "name", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />

                  <input
                    placeholder="Chamber Location"
                    value={chamber.location}
                    onChange={(e) =>
                      updateChamber(index, "location", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeChamber(index)}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-700 bg-gray-900/80 text-gray-400 transition hover:border-red-500/20 hover:text-red-300 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 font-semibold text-white transition hover:from-green-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? "Completing Setup..." : "Complete Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
