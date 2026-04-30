import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import { validateAndCreateReview, logReviewCreated, logError } from '@/lib/edge-functions';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { SurfaceCard } from './SurfaceCard';

interface ReviewFormProps {
  jobId: string;
  revieweeId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ jobId, revieweeId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Selecciona una calificación');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      const review = await validateAndCreateReview({
        jobId,
        revieweeId,
        rating,
        comment: comment.trim(),
      });

      await logReviewCreated(review.id, rating, revieweeId);

      toast.success('Reseña creada correctamente', {
        description: 'Tu evaluación ha sido registrada',
      });

      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la reseña';

      if (errorMessage.includes('already reviewed')) {
        toast.error('Ya reseñaste este trabajo');
      } else if (errorMessage.includes('rating must be')) {
        toast.error('La calificación debe estar entre 1 y 5');
      } else {
        toast.error('No pudimos crear la reseña', { description: errorMessage });
      }

      await logError('Review creation failed', error, revieweeId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SurfaceCard padding="lg" className="space-y-4">
      <div>
        <h3 className="mb-3 text-base font-semibold text-[var(--app-text)]">¿Cómo fue tu experiencia?</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-2 text-sm text-[var(--app-text-muted)]">
            {rating === 1 && 'Insatisfecho'}
            {rating === 2 && 'Podría mejorar'}
            {rating === 3 && 'Bien'}
            {rating === 4 && 'Muy bien'}
            {rating === 5 && 'Excelente'}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--app-text)]">
          Tu experiencia
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos cómo fue tu experiencia. Sé honesto y constructivo."
          className="min-h-[100px]"
        />
        <p className="mt-1 text-xs text-[var(--app-text-muted)]">
          {comment.length}/500 caracteres
        </p>
      </div>

      <Button
        fullWidth
        disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
        onClick={() => void handleSubmit()}
        icon={<Send size={16} />}
      >
        {isSubmitting ? 'Enviando reseña...' : 'Enviar reseña'}
      </Button>
    </SurfaceCard>
  );
}
