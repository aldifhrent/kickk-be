// transactionService.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { TransactionStatus } from "@prisma/client";
import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryUpload, extractPublicFromURL } from "@/helpers/cloudinary";


class TransactionService {
  async createTransaction(req: Request, res: Response) {
    const userId = req.user.id;
    try {
      // Debug log
      console.log("Request Body Raw:", req.body);
      console.log("Content-Type:", req.headers['content-type']);

      let data = req.body;
      // Cek apakah body perlu di-parse
      if (typeof req.body === 'string') {
        try {
          data = JSON.parse(req.body);
        } catch (e) {
          console.error("Error parsing body:", e);
        }
      }

      const { eventId, totalAmount, quantity, paymentProof, expiresAt } = data;

      console.log("Parsed Data:", {
        eventId,
        totalAmount,
        quantity,
        paymentProof,
        expiresAt,
        userId
      });

      // Validasi data yang diterima
      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: "Missing eventId",
          receivedBody: data
        });
      }

      const eventIdNumber = Number(eventId);

      // Cek event exists
      const event = await prisma.events.findUnique({
        where: { id: eventIdNumber },
        select: {
          attendedEvent: true,
          totalTicket: true,
        },
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
          eventId: eventIdNumber
        });
      }

      // Validasi ticket availability
      if (event.attendedEvent + quantity > event.totalTicket) {
        return res.status(400).json({
          success: false,
          message: "Cannot create transaction: not enough available tickets",
          available: event.totalTicket - event.attendedEvent,
          requested: quantity
        });
      }

      // Upload paymentProof to Cloudinary
      let paymentProofUrl = "";
      if (paymentProof) {
        const uploadResponse = await cloudinary.uploader.upload(paymentProof, {
          folder: `payment_proofs/${userId}`
        });
        paymentProofUrl = uploadResponse.secure_url;
      }

      // Create transaction
      const newTransaction = await prisma.transaction.create({
        data: {
          totalAmount,
          quantity,
          paymentProof: paymentProofUrl || "",
          status: "WAITING_CONFIRMATION",
          expiresAt: new Date(expiresAt), // Pastikan expiresAt dikonversi ke Date
          user: {
            connect: { id: userId },
          },
          event: {
            connect: { id: eventIdNumber },
          },
        },
      });

      // Update attendedEvent
      await prisma.events.update({
        where: { id: eventIdNumber },
        data: {
          attendedEvent: {
            increment: quantity,
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: "Transaction created successfully",
        data: newTransaction,
      });

    } catch (error) {
      console.error("Error creating transaction:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create transaction",
        error: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  async deleteExpiredTransactions(req?: Request, res?: Response) {
    try {
      const now = new Date();

      const deletedTransactions = await prisma.transaction.deleteMany({
        where: {
          OR: [
            {
              status: TransactionStatus.WAITING_PAYMENT,
              expiresAt: { lte: now },
            },
            { status: TransactionStatus.EXPIRED },
          ],
        },
      });

      console.log(
        `Deleted ${deletedTransactions.count} expired or pending transactions`
      );

      if (res) {
        return res.status(200).json({
          success: true,
          message: `${deletedTransactions.count} expired transactions deleted`,
        });
      }
    } catch (error) {
      console.error("Error deleting expired transactions:", error);
      if (res) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete expired transactions",
        });
      }
    }
  }

  async getAllTransactions(req: Request, res: Response) {
    try {
      const transactions = await prisma.transaction.findMany({});

      return res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) { }
  }

  async getTransactionStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Transaction ID is required"
        });
      }

      const transaction = await prisma.transaction.findUnique({
        where: {
          id: id,
          userId: userId
        },
        select: {
          id: true,
          eventId: true,
          status: true,
          quantity: true,
          totalAmount: true,
          createdAt: true,
          expiresAt: true,
          event: {
            select: {
              title: true,
              price: true,
              imageUrl: true
            }
          }
        }
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found"
        });
      }

      // Cek apakah transaksi sudah expired
      if (transaction.status === "WAITING_CONFIRMATION" &&
        transaction.expiresAt && new Date() > new Date(transaction.expiresAt)) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "EXPIRED" }
        });

        transaction.status = "EXPIRED";
      }

      return res.status(200).json({
        success: true,
        data: transaction
      });

    } catch (error) {
      console.error("Error getting transaction status:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get transaction status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  async updateTransactionStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      // Validasi status yang diperbolehkan
      const allowedStatuses = ["CONFIRMED", "CANCELLED", "EXPIRED"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status"
        });
      }

      const transaction = await prisma.transaction.findUnique({
        where: {
          id: id,
          userId: userId
        }
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found"
        });
      }

      const updatedTransaction = await prisma.transaction.update({
        where: { id: id },
        data: { status }
      });

      return res.status(200).json({
        success: true,
        message: "Transaction status updated successfully",
        data: updatedTransaction
      });

    } catch (error) {
      console.error("Error updating transaction status:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update transaction status",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Transaction ID is required"
        });
      }

      const transaction = await prisma.transaction.findUnique({
        where: {
          id: id,
          userId: userId // Memastikan transaksi milik user yang sedang login
        },
        select: {
          id: true,
          eventId: true,
          status: true,
          quantity: true,
          totalAmount: true,
          createdAt: true,
          expiresAt: true,
          event: {
            select: {
              title: true,
              price: true,
              imageUrl: true
            }
          }
        }
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: transaction
      });

    } catch (error) {
      console.error("Error getting transaction by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get transaction by ID",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}

export default new TransactionService();