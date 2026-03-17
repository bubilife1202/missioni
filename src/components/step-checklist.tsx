import { MissionStep } from "@/types";

interface Props {
  steps: MissionStep[];
  onComplete: (stepNumber: number) => void;
}

export function StepChecklist({ steps, onComplete }: Props) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div
          key={step.step}
          className={`p-4 rounded-xl border-2 transition-all ${
            step.done
              ? "border-green-400 bg-green-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => !step.done && onComplete(step.step)}
              disabled={step.done}
              className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                step.done
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-slate-300 hover:border-indigo-500"
              }`}
            >
              {step.done && "✓"}
            </button>
            <div>
              <p
                className={`font-medium text-sm ${
                  step.done ? "line-through text-slate-400" : "text-slate-900"
                }`}
              >
                {step.step}단계: {step.title}
              </p>
              <p className="text-xs text-slate-600 mt-1">{step.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
