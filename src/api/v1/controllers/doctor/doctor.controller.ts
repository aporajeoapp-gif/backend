import { Request, Response } from "express";
import DoctorModel from "../../../../models/doctor.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";

export const createDoctor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      name, specialty, experience, 
      location, phone, email, schedule 
    } = req.body;

   
    const createdBy = req.user?.userId;
    const creatorName = req.user?.name;

    if (!createdBy || !creatorName) {
      return res.status(401).json({ message: "Unauthorized: User information missing" });
    }

    const newDoctor = await DoctorModel.create({
      name,
      specialty,
      experience,
      location,
      phone,
      email,
      schedule,
      image:null,
      createdBy,
      creatorName
    });

    res.status(201).json({ 
      message: "Doctor created successfully", 
      doctor: newDoctor 
    });
  } catch (error: any) {
    console.error("Create Doctor Error:", error);
    res.status(500).json({ message: "Failed to create doctor", error: error.message });
  }
};


export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await DoctorModel.find().sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error: any) {
    console.error("Get Doctors Error:", error);
    res.status(500).json({ message: "Failed to fetch doctors", error: error.message });
  }
};
