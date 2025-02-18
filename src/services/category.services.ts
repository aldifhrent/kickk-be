// categoryServices.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";

class categoryServices {
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.query;
      const filters: any = {};
      if (name) {
        filters.name = {
          // Menggunakan 'ILIKE' untuk pencarian tanpa memperhatikan kapitalisasi
          contains: String(name),
          mode: "insensitive",
        };
      }

      const category = await prisma.category.findMany({
        where: filters,
      });

      return res.status(200).json({
        success: true,
        message: "Successfully retrieved category",
        data: category,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  }
}

export default new categoryServices();
