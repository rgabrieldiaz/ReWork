import { toast } from "sonner";
import confetti from "canvas-confetti";

export function useGamification() {
    const notifyPointsEarned = (points: number, message: string = "¡Has ganado puntos!") => {
        // Fire confetti
        const end = Date.now() + 1.5 * 1000;
        const colors = ['var(--accent-teal)', '#ffffff']; // Accent Teal and White

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());

        // Show a styled toast
        toast.success(
            <div className="flex flex-col gap-1">
                <span className="font-bold text-accent-teal">+{points} PTS</span>
                <span className="text-sm text-muted">{message}</span>
            </div>,
            {
                className: "bg-background border border-accent-teal/30 shadow-[0_0_20px_rgba(0,242,255,0.15)]",
                duration: 4000,
            }
        );
    };

    return { notifyPointsEarned };
}
