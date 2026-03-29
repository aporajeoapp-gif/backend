import { Request, Response } from "express";
import UserModel from "../../../../models/user.model";
import DoctorModel from "../../../../models/doctor.model";
import BusModel from "../../../../models/bus.model";
import FerryModel from "../../../../models/ferry.model";
import EmergencyModel from "../../../../models/emergency.model";

export const getAnalyticsStats = async (req: Request, res: Response) => {
  try {
    const [userStats, doctorStats, busStats, ferryStats, emergencyStats] = await Promise.all([
      // 1. User Stats Aggregation
      UserModel.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            roles: [{ $group: { _id: "$role", count: { $sum: 1 } } }],
            enrollmentTimeline: [
              { $sort: { createdAt: 1 } },
              { $limit: 20 },
              { $project: { name: 1, role: 1, email: 1, createdAt: 1 } }
            ],
            lastActive: [
              { $sort: { updatedAt: -1 } },
              { $limit: 10 },
              { $project: { name: 1, role: 1, email: 1, updatedAt: 1, createdAt: 1 } }
            ],
            permissionsByModule: [
              { $unwind: { path: "$permissions", preserveNullAndEmptyArrays: false } },
              { $match: { permissions: { $nin: ["*", null], $not: { $regex: /^\[object/ } } } },
              { $addFields: { module: { $arrayElemAt: [{ $split: ["$permissions", "."] }, 0] } } },
              { $group: { _id: "$module", count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            userPermissionCount: [
              {
                $project: {
                  name: 1,
                  role: 1,
                  permCount: { $size: { $ifNull: ["$permissions", []] } },
                  isWildcard: { $in: ["*", { $ifNull: ["$permissions", []] }] },
                  hasMalformed: {
                    $anyElementTrue: {
                      $map: {
                        input: { $ifNull: ["$permissions", []] },
                        as: "p",
                        in: { $regexMatch: { input: "$$p", regex: "^\\[object" } }
                      }
                    }
                  }
                }
              },
              { $sort: { permCount: -1 } }
            ],
            // New for Analytics Page
            registrationTimeline: [
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
            ],
            rolePermStats: [
              {
                $project: {
                  role: 1,
                  perms: {
                    $filter: {
                      input: { $ifNull: ["$permissions", []] },
                      as: "p",
                      cond: { $not: { $regexMatch: { input: "$$p", regex: "^\\[object" } } }
                    }
                  }
                }
              },
              { $group: { _id: "$role", avgPerms: { $avg: { $size: "$perms" } }, count: { $sum: 1 } } }
            ],
            qualityAlerts: [
                {
                    $project: {
                        name: 1,
                        status: 1,
                        isEmailVerified: 1,
                        hasMalformed: {
                            $anyElementTrue: {
                              $map: {
                                input: { $ifNull: ["$permissions", []] },
                                as: "p",
                                in: { $regexMatch: { input: "$$p", regex: "^\\[object" } }
                              }
                            }
                        },
                        hasNoPerms: { $eq: [{ $size: { $ifNull: ["$permissions", []] } }, 0] }
                    }
                }
            ]
          }
        }
      ]),

      // 2. Doctor Stats Aggregation
      DoctorModel.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            experienceStats: [{ $group: { _id: null, avgExperience: { $avg: "$experience" } } }],
            specialties: [{ $group: { _id: "$specialty", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
            registrationTimeline: [
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
            ],
            list: [
              { $sort: { updatedAt: -1 } },
              { $project: { name: 1, specialty: 1, experience: 1, updatedAt: 1, schedule: 1 } }
            ]
          }
        }
      ]),

      // 3. Bus Stats Aggregation
      BusModel.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            fareStats: [
              { $group: { _id: null, avgFare: { $avg: "$fare" }, minFare: { $min: "$fare" }, maxFare: { $max: "$fare" } } }
            ],
            operatorStats: [{ $group: { _id: "$busName", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
            registrationTimeline: [
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
            ],
            timingsByRoute: [
               { $project: { routeNumber: 1, timingCount: { $size: { $ifNull: ["$timings", []] } } } },
               { $sort: { timingCount: -1 } },
               { $limit: 10 }
            ],
            stopsVsFare: [
               { $project: { routeNumber: 1, stopsCount: { $size: { $ifNull: ["$stops", []] } }, fare: 1 } }
            ],
            list: [
              { $sort: { fare: 1 } },
              { $project: { routeNumber: 1, routeName: 1, fare: 1, busName: 1, timings: 1, stops: 1 } }
            ],
            qualityAlerts: [
                {
                    $project: {
                        routeNumber: 1,
                        busName: 1,
                        hasNoName: { $not: ["$busName"] },
                        hasNoTimings: { $eq: [{ $size: { $ifNull: ["$timings", []] } }, 0] }
                    }
                }
            ]
          }
        }
      ]),

      // 4. Ferry Stats Aggregation
      FerryModel.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            operatorStats: [{ $group: { _id: "$ferryName", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
            fareStats: [
              { $group: { _id: null, avgFare: { $avg: "$fare" } } }
            ],
            registrationTimeline: [
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
            ],
            list: [{ $project: { ferryName: 1, fare: 1, stops: 1 } }]
          }
        }
      ]),

      // 5. Emergency Stats Aggregation
      EmergencyModel.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            categoryStats: [{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }],
            contactStats: [
               { $project: { serviceName: 1, contactCount: { $size: { $ifNull: ["$contactPhone", []] } }, hasLocation: { $cond: [{ $ifNull: ["$location", false] }, 1, 0] } } }
            ],
            sample: [{ $limit: 1 }, { $project: { category: 1 } }]
          }
        }
      ])
    ]);

    // Format helper
    const users = userStats[0];
    const doctors = doctorStats[0];
    const buses = busStats[0];
    const ferries = ferryStats[0];
    const emergencies = emergencyStats[0];

    // Build Merged Registration Timeline
    const timelineMap: Record<string, any> = {};
    const addToTimeline = (data: any[], key: string) => {
        data.forEach(item => {
            if(!timelineMap[item._id]) timelineMap[item._id] = { date: item._id };
            timelineMap[item._id][key] = item.count;
        });
    };
    addToTimeline(users.registrationTimeline, "Users");
    addToTimeline(buses.registrationTimeline, "Buses");
    addToTimeline(doctors.registrationTimeline, "Doctors");
    addToTimeline(ferries.registrationTimeline, "Ferries");
    const mergedTimeline = Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));

    // Fare Bucket Helper
    const getFareBuckets = (items: any[]) => {
        const b = { "₹0–20": 0, "₹21–30": 0, "₹31–40": 0, "₹41+": 0 };
        items.forEach(item => {
            const f = item.fare || 0;
            if (f <= 20) b["₹0–20"]++;
            else if (f <= 30) b["₹21–30"]++;
            else if (f <= 40) b["₹31–40"]++;
            else b["₹41+"]++;
        });
        return Object.entries(b).map(([name, count]) => ({ name, count }));
    };

    // Permission Bucket Helper
    const getPermBuckets = (items: any[]) => {
        const b = { "None": 0, "1–5": 0, "6–10": 0, "11+": 0 };
        items.forEach(item => {
            const n = item.permCount || 0;
            if (n === 0) b["None"]++;
            else if (n <= 5) b["1–5"]++;
            else if (n <= 10) b["6–10"]++;
            else b["11+"]++;
        });
        return Object.entries(b).map(([name, count]) => ({ name, count }));
    };

    // Quality Alerts Logic
    const alerts: any[] = [];
    const malformedUser = users.qualityAlerts.find((u: any) => u.hasMalformed);
    if (malformedUser) alerts.push({ type: "error", message: `<strong>${malformedUser.name}</strong> malformed perms.` });
    const zeroPermUsers = users.qualityAlerts.filter((u: any) => u.hasNoPerms);
    if (zeroPermUsers.length > 0) alerts.push({ type: "info", message: `<strong>${zeroPermUsers.length} users</strong> have zero permissions.` });
    const allActive = users.qualityAlerts.every((u: any) => u.status === "active" && u.isEmailVerified);
    if (allActive && users.total[0]?.count > 0) alerts.push({ type: "success", message: `All ${users.total[0].count} users are verified and active.` });
    const unnamedBuses = buses.qualityAlerts.filter((b: any) => b.hasNoName);
    if (unnamedBuses.length > 0) alerts.push({ type: "warning", message: `<strong>${unnamedBuses.length} buses</strong> missing name.` });

    res.status(200).json({
      success: true,
      data: {
        global: {
          timeline: mergedTimeline,
          radar: [
            { subject: "Users", A: users.total[0]?.count || 0 },
            { subject: "Bus Routes", A: buses.total[0]?.count || 0 },
            { subject: "Doctors", A: doctors.total[0]?.count || 0 },
            { subject: "Ferries", A: ferries.total[0]?.count || 0 },
            { subject: "Emergencies", A: emergencies.total[0]?.count || 0 },
          ]
        },
        users: {
          total: users.total[0]?.count || 0,
          active: users.qualityAlerts.filter((u: any) => u.status === "active").length,
          verified: users.qualityAlerts.filter((u: any) => u.isEmailVerified).length,
          roles: users.roles.reduce((acc: any, r: any) => { acc[r._id] = r.count; return acc; }, {}),
          roleChart: users.roles.map((r: any) => ({ name: r._id, count: r.count })),
          permBuckets: getPermBuckets(users.userPermissionCount),
          rolePermAvg: users.rolePermStats.map((r: any) => ({ name: r._id, avgPerms: Number(r.avgPerms.toFixed(1)), count: r.count })),
          enrollmentTimeline: users.enrollmentTimeline,
          lastActive: users.lastActive,
          permissionsByModule: users.permissionsByModule,
          userPermissionCount: users.userPermissionCount,
        },
        doctors: {
          total: doctors.total[0]?.count || 0,
          avgExperience: Number(doctors.experienceStats[0]?.avgExperience?.toFixed(1) || 0),
          scheduled: doctors.list.filter((d: any) => d.schedule?.length > 0).length,
          specialties: doctors.specialties.map((s: any) => ({ name: s._id, count: s.count })),
          experienceTrend: doctors.list.sort((a: any, b: any) => a.experience - b.experience).map((d: any) => ({ name: d.name.split(" ")[0], experience: d.experience })),
          scheduleAnalysis: doctors.list.map((d: any) => ({ name: d.name.split(" ")[0], slots: d.schedule?.length || 0, experience: d.experience })),
          list: doctors.list,
        },
        buses: {
          total: buses.total[0]?.count || 0,
          avgFare: Number(buses.fareStats[0]?.avgFare?.toFixed(1) || 0),
          totalStops: buses.list.reduce((s: number, b: any) => s + (b.stops?.length || 0), 0),
          totalTimings: buses.list.reduce((s: number, b: any) => s + (b.timings?.length || 0), 0),
          fareComparison: {
            min: buses.fareStats[0]?.minFare || 0,
            max: buses.fareStats[0]?.maxFare || 0,
            avg: Number(buses.fareStats[0]?.avgFare?.toFixed(1) || 0),
          },
          operators: buses.operatorStats.map((o: any) => ({ name: o._id || "Unknown", count: o.count })),
          fareBuckets: getFareBuckets(buses.list),
          timingsByRoute: buses.timingsByRoute.map((t: any) => ({ name: t.routeNumber, count: t.timingCount })),
          stopsVsFare: buses.stopsVsFare.map((s: any) => ({ name: s.routeNumber, stops: s.stopsCount, fare: s.fare })),
          list: buses.list,
        },
        ferries: {
          total: ferries.total[0]?.count || 0,
          avgFare: Number(ferries.fareStats[0]?.avgFare?.toFixed(1) || 0),
          operators: ferries.operatorStats.map((o: any) => ({ name: o._id || "Unknown", count: o.count })),
          fareBuckets: getFareBuckets(ferries.list),
        },
        emergencies: {
          total: emergencies.total[0]?.count || 0,
          totalContacts: emergencies.contactStats.reduce((s: number, e: any) => s + e.contactCount, 0),
          gpsEnabled: emergencies.contactStats.filter((e: any) => e.hasLocation).length,
          categories: emergencies.categoryStats.map((c: any) => ({ name: c._id, count: c.count })),
          contactAnalysis: emergencies.contactStats.map((e: any) => ({ name: e.serviceName, count: e.contactCount })),
        },
        alerts
      }
    });

  } catch (error) {
    console.error("Expanded Aggregation Error:", error);
    res.status(500).json({ success: false, message: "Stats failure", error: error instanceof Error ? error.message : "Internal Error" });
  }
};
