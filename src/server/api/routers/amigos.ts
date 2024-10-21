import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Prisma } from "@prisma/client";
import { db } from "~/server/db";

export const amigosRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const amigos = await ctx.db.amigo.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return amigos;
  }),
  getUserAmigos: publicProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      if (!input.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User ID is required",
        });
      }
      const amigos = await ctx.db.amigo.findMany({
        where: {
          userId: input.userId,
        },
      });
      return amigos;
    }),
  createAmigo: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        userId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.amigo.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          user: {
            connect: { id: input.userId },
          },
        },
      });
    }),

  getAmigo: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const amigo = await db.amigo.findUnique({
        where: { id: input.id },
      });
      if (!amigo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Amigo not found",
        });
      }
      return amigo;
    }),

  updateAmigo: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.amigo.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
        },
      });
    }),

  deleteAmigo: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.amigo.delete({
        where: { id: input.id },
      });
    }),
});
