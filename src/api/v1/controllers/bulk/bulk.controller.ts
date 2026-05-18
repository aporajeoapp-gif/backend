import { Request, Response } from "express";
import { createAuditLogFromRequest } from "../../../../utils/logger";
import { AuthenticatedRequest } from "../../middleware/rbac.middleware";

export const bulkInsert = (Model: any) => {
  return async (req: AuthenticatedRequest, res: Response) => {
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

      // Audit Log
      await createAuditLogFromRequest(req, {
        action: "BULK_INSERT",
        task: `Bulk inserted data into ${Model.modelName}`,
        details: `Inserted ${result.length} records into ${Model.modelName}`,
        severity: "medium",
        payload: { newData: { count: result.length, model: Model.modelName } },
        entityModel: Model.modelName,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Bulk insert failed" });
    }
  };
};