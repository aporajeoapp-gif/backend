import { Request, Response } from "express";
import AdsModel from "../../../../models/ads.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import { uploadToS3, deleteFromS3 } from "../../../../utils/s3.utils";
import { createAuditLogFromRequest } from "../../../../services/auditLog.service";

export const createAd = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, link, tag, cta, startDate, endDate, status } = req.body;
    const createdBy = req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized: No userId" });
    }

    let image = null;
    if (req.file) {
      const uploadResult = await uploadToS3(
        req.file.buffer,
        "advertisements",
        req.file.originalname,
        req.file.mimetype
      );
      image = uploadResult.secure_url;
    }

    if (!image) {
      return res.status(400).json({ message: "Image is required for advertisement" });
    }

    const newAd = await AdsModel.create({
      title,
      description,
      image,
      link,
      tag,
      cta,
      startDate,
      endDate,
      status,
      createdBy: createdBy.toString(),
    });

    res.status(201).json({ message: "Advertisement created successfully", ad: newAd });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "AD_CREATE",
      task: `Created advertisement: ${newAd.title}`,
      details: `Created advertisement with status ${newAd.status}`,
      severity: "medium",
      payload: { newData: newAd.toObject() },
      entityId: newAd._id.toString(),
      entityModel: "Advertisements",
    });
  } catch (error: any) {
    console.error("Create Ad Error:", error);
    res.status(500).json({ message: "Failed to create advertisement", error: error.message });
  }
};

export const getAds = async (req: Request, res: Response) => {
  try {
    const ads = await AdsModel.find().sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (error: any) {
    console.error("Get Ads Error:", error);
    res.status(500).json({ message: "Failed to fetch advertisements", error: error.message });
  }
};

export const updateAd = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ad = await AdsModel.findById(id);
    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    const oldData = ad.toObject();

    if (req.file) {
      if (ad.image) {
        await deleteFromS3(ad.image);
      }
      const uploadResult = await uploadToS3(
        req.file.buffer,
        "advertisements",
        req.file.originalname,
        req.file.mimetype
      );
      updateData.image = uploadResult.secure_url;
    }

    const updatedAd = await AdsModel.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({ message: "Advertisement updated successfully", ad: updatedAd });

    // Audit Log
    if (updatedAd) {
      await createAuditLogFromRequest(req, {
        action: "AD_UPDATE",
        task: `Updated advertisement: ${updatedAd.title}`,
        details: `Updated advertisement details`,
        severity: "medium",
        payload: { oldData, newData: updatedAd.toObject() },
        entityId: updatedAd._id.toString(),
        entityModel: "Advertisements",
      });
    }
  } catch (error: any) {
    console.error("Update Ad Error:", error);
    res.status(500).json({ message: "Failed to update advertisement", error: error.message });
  }
};

export const deleteAd = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const ad = await AdsModel.findByIdAndDelete(id);
    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    if (ad.image) {
      await deleteFromS3(ad.image);
    }

    res.status(200).json({ message: "Advertisement deleted successfully" });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "AD_DELETE",
      task: `Deleted advertisement: ${ad.title}`,
      details: `Permanently removed advertisement`,
      severity: "high",
      payload: { oldData: ad.toObject() },
      entityId: ad._id.toString(),
      entityModel: "Advertisements",
    });
  } catch (error: any) {
    console.error("Delete Ad Error:", error);
    res.status(500).json({ message: "Failed to delete advertisement", error: error.message });
  }
};

