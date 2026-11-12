"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star } from "lucide-react";
import Modal from "@/global/components/Modal";
import { Alert } from "@/global/components/ui";
import { useCreateReviewMutation } from "@/global/api/endpoints/reviewsApi";
import { errorMessage } from "@/global/api/baseApi";
import type { Booking } from "@/global/api/types";
import { cn } from "@/global/lib/cn";

const schema = z.object({
  title: z.string().trim().min(3, "Add a short title").max(80),
  body: z.string().trim().min(20, "Tell us a little more (at least 20 characters)").max(1500),
});
type Values = z.infer<typeof schema>;

export default function ReviewModal({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  const [rating, setRating] = useState(5);
  const [createReview, { isLoading, error, reset: resetMutation }] = useCreateReviewMutation();
  const { register, handleSubmit, formState, reset } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (booking) {
      reset({ title: "", body: "" });
      setRating(5);
      resetMutation();
    }
  }, [booking, reset, resetMutation]);

  const onSubmit = handleSubmit(async (v) => {
    if (!booking) return;
    try {
      await createReview({ bookingReference: booking.reference, rating, ...v }).unwrap();
      onClose();
    } catch {
      /* shown below */
    }
  });

  return (
    <Modal open={Boolean(booking)} onClose={onClose} title={`Review your stay${booking ? ` · ${booking.roomType.name}` : ""}`}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {error && <Alert tone="error">{errorMessage(error)}</Alert>}
        <fieldset>
          <legend className="label">Overall rating</legend>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} star${i > 1 ? "s" : ""}`} aria-pressed={rating === i}>
                <Star className={cn("h-7 w-7", i <= rating ? "fill-gold text-gold" : "text-zinc-300")} />
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="label">Title</span>
          <input className={cn("input", formState.errors.title && "input-error")} {...register("title")} />
          {formState.errors.title && <span className="field-error block">{formState.errors.title.message}</span>}
        </label>
        <label className="block">
          <span className="label">Your review</span>
          <textarea rows={5} className={cn("input", formState.errors.body && "input-error")} {...register("body")} />
          {formState.errors.body && <span className="field-error block">{formState.errors.body.message}</span>}
        </label>
        <p className="text-xs text-zinc-500">Shown with your first name and last initial.</p>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? "Submitting…" : "Submit review"}</button>
        </div>
      </form>
    </Modal>
  );
}
