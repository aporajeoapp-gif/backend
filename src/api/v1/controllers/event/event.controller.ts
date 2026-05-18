import { Request, Response } from "express";
import EventModel from "../../../../models/event.model";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";
import { uploadToS3, deleteFromS3 } from "../../../../utils/s3.utils";
import { createAuditLogFromRequest } from "../../../../utils/logger";

export const createEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, date, time, location, organizer, category, status } = req.body;
    const createdBy = req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized: No userId" });
    }

    let image = null;
    if (req.file) {
      const uploadResult = await uploadToS3(
        req.file.buffer,
        "events",
        req.file.originalname,
        req.file.mimetype
      );
      image = uploadResult.secure_url;
    }

    const newEvent = await EventModel.create({
      title,
      description,
      date,
      time,
      location,
      organizer,
      category,
      image,
      status,
      createdBy: createdBy.toString(),
    });

    res.status(201).json({ message: "Event created successfully", event: newEvent });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "EVENT_CREATE",
      task: `Created event: ${newEvent.title}`,
      details: `Created event at ${newEvent.location} on ${newEvent.date}`,
      severity: "medium",
      payload: { newData: newEvent.toObject() },
      entityId: newEvent._id.toString(),
      entityModel: "Events",
    });
  } catch (error: any) {
    console.error("Create Event Error:", error);
    res.status(500).json({ message: "Failed to create event", error: error.message });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await EventModel.find().sort({ date: -1 });
    res.status(200).json(events);
  } catch (error: any) {
    console.error("Get Events Error:", error);
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

export const updateEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await EventModel.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const oldData = event.toObject();

    if (req.file) {
      if (event.image) {
        await deleteFromS3(event.image);
      }
      const uploadResult = await uploadToS3(
        req.file.buffer,
        "events",
        req.file.originalname,
        req.file.mimetype
      );
      updateData.image = uploadResult.secure_url;
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({ message: "Event updated successfully", event: updatedEvent });

    // Audit Log
    if (updatedEvent) {
      await createAuditLogFromRequest(req, {
        action: "EVENT_UPDATE",
        task: `Updated event: ${updatedEvent.title}`,
        details: `Updated event details`,
        severity: "medium",
        payload: { oldData, newData: updatedEvent.toObject() },
        entityId: updatedEvent._id.toString(),
        entityModel: "Events",
      });
    }
  } catch (error: any) {
    console.error("Update Event Error:", error);
    res.status(500).json({ message: "Failed to update event", error: error.message });
  }
};

export const deleteEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const event = await EventModel.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.image) {
      await deleteFromS3(event.image);
    }

    res.status(200).json({ message: "Event deleted successfully" });

    // Audit Log
    await createAuditLogFromRequest(req, {
      action: "EVENT_DELETE",
      task: `Deleted event: ${event.title}`,
      details: `Permanently removed event`,
      severity: "high",
      payload: { oldData: event.toObject() },
      entityId: event._id.toString(),
      entityModel: "Events",
    });
  } catch (error: any) {
    console.error("Delete Event Error:", error);
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
};

export const getLatestEvents = async (req: Request, res: Response) => {
  try {
    const events = await EventModel.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json(events);
  } catch (error: any) {
    console.error("Get Latest Events Error:", error);
    res.status(500).json({ message: "Failed to fetch latest events", error: error.message });
  }
};
