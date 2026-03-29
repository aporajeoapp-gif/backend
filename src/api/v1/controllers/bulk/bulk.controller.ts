import { Request, Response } from "express";

export const bulkInsert = (Model: any) => {
  return async (req: Request & { user?: any }, res: Response) => {
    try {
      const data = req.body;

      if (!Array.isArray(data)) {
        return res.status(400).json({ message: "Array required" });
      }

      const enrichedData = data.map((item) => ({
        ...item,
        createdBy: req.user?.userId,
        creatorName: req.user?.name,
      }));

      const result = await Model.insertMany(enrichedData);

      res.status(201).json({
        message: "Bulk insert success",
        count: result.length,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Bulk insert failed" });
    }
  };
};