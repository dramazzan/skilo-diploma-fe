import { api, type VerificationBooking, type VerificationSlot } from "@/shared/api/client"

export const verificationApi = {
  getSlots(params?: { mode?: "online" | "offline"; date?: string }): Promise<VerificationSlot[]> {
    return api.getVerificationSlots(params)
  },
  getBookings(userId: number | null): Promise<VerificationBooking[]> {
    return api.getVerificationBookings(userId)
  },
  createBooking(
    userId: number | null,
    payload: {
      slotId: string
      roadmapId: string
      roadmapTitle: string
      mode: "online" | "offline"
      date: string
      time: string
      location: string
      assessor: string
    }
  ): Promise<VerificationBooking> {
    return api.createVerificationBooking(userId, payload)
  },
  completeBooking(userId: number | null, bookingId: string): Promise<VerificationBooking> {
    return api.completeVerificationBooking(userId, bookingId)
  },
  cancelBooking(userId: number | null, bookingId: string): Promise<void> {
    return api.cancelVerificationBooking(userId, bookingId)
  }
}

export type { VerificationBooking, VerificationSlot }
