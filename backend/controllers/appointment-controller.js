import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, day, timeSlot } = req.body;
    const patientId = req.userId;

    if (!doctorId || !day || !timeSlot?.startTime || !timeSlot?.endTime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const doctor = await User.findOne({
      _id: doctorId,
      role: "doctor",
      isVerified: true,
    });
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const slotExists = doctor.doctorProfile?.availability?.some(
      (a) =>
        a.day === day &&
        a.startTime === timeSlot.startTime &&
        a.endTime === timeSlot.endTime,
    );
    if (!slotExists) {
      return res
        .status(400)
        .json({ success: false, message: "Selected time slot is not available" });
    }

    const existingCount = await Appointment.countDocuments({
      doctor: doctorId,
      day,
      "timeSlot.startTime": timeSlot.startTime,
      "timeSlot.endTime": timeSlot.endTime,
      status: { $ne: "cancelled" },
    });

    const serialNumber = existingCount + 1;

    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      day,
      timeSlot,
      serialNumber,
    });
    await appointment.save();
    await appointment.populate("doctor", "name doctorProfile");

    return res.status(201).json({ success: true, appointment, serialNumber });
  } catch (error) {
    console.error("bookAppointment error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to book appointment" });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const patientId = req.userId;

    const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor", "name email doctorProfile")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("getMyAppointments error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch appointments" });
  }
};
