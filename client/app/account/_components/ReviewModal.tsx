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
import RollText from "@/global/components/RollText";

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
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {error && <Alert tone="error">{errorMessage(error)}</Alert>}
        <fieldset>
          <legend className="caps mb-3 block text-ink/70">Overall rating</legend>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} star${i > 1 ? "s" : ""}`} aria-pressed={rating === i} className="p-0.5 transition hover:scale-110">
                <Star className={cn("h-6 w-6", i <= rating ? "fill-ink text-ink" : "text-ink/20")} />
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block">
          <span className="caps mb-2.5 block text-ink/70">Title</span>
          <input className={cn("input rounded-none py-3", formState.errors.title && "input-error")} {...register("title")} />
          {formState.errors.title && <span className="field-error block">{formState.errors.title.message}</span>}
        </label>
        <label className="block">
          <span className="caps mb-2.5 block text-ink/70">Your review</span>
          <textarea rows={5} className={cn("input rounded-none py-3", formState.errors.body && "input-error")} {...register("body")} />
          {formState.errors.body && <span className="field-error block">{formState.errors.body.message}</span>}
        </label>
        <p className="caps text-ink/50">Shown with your first name and last initial.</p>
        <div className="flex flex-wrap justify-end gap-2 border-t border-ink/15 pt-6">
          <button type="button" className="btn-secondary roll-host" onClick={onClose}><RollText>Cancel</RollText></button>
          <button type="submit" className="btn-primary roll-host" disabled={isLoading}><RollText>{isLoading ? "Submitting…" : "Submit review"}</RollText></button>
        </div>
      </form>
    </Modal>
  );
}
