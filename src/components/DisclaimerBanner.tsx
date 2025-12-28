import { AlertTriangle } from "lucide-react";

export const DisclaimerBanner = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-amber-800 mb-1">Medical Disclaimer</p>
        <p className="text-sm text-amber-700">
          This information is for educational purposes only and is not a substitute for professional medical advice. 
          Always consult a qualified healthcare professional for diagnosis and treatment.
        </p>
      </div>
    </div>
  );
};
