interface Benefits {
  eligible?: boolean;
  annualMaximum?: number;
  deductible?: number;
  coverage?: {
    diagnostic?: number;
    preventive?: number;
    basic?: number;
    major?: number;
    endodontics?: number;
    periodontics?: number;
  };
  diagnostic?: {
    bwx?: { frequency?: string };
  };
  preventive?: {
    d1110?: { frequency?: string };
  };
  implants?: {
    covered?: boolean;
  };
}

export function isVerificationIncomplete(benefits: Benefits | null): boolean {
  if (!benefits) return true;

  // If patient is ineligible, the verification succeeded — rep won't provide coverage details
  if (benefits.eligible === false) return false;

  const criticalFields = [
    benefits.eligible,
    benefits.annualMaximum,
    benefits.deductible,
    benefits.coverage?.diagnostic,
    benefits.coverage?.preventive,
    benefits.coverage?.basic,
    benefits.coverage?.major,
    benefits.coverage?.endodontics,
    benefits.coverage?.periodontics,
    benefits.diagnostic?.bwx?.frequency,
    benefits.preventive?.d1110?.frequency,
    benefits.implants?.covered,
  ];

  const missingCount = criticalFields.filter(
    (v) => v === null || v === undefined
  ).length;

  return missingCount >= 3;
}

export function getDisplayStatus(
  dbStatus: string,
  benefits: Benefits | null
): "in_progress" | "completed" | "incomplete" | "failed" {
  if (dbStatus === "in_progress") return "in_progress";

  // If completed but missing critical data -> incomplete
  if (dbStatus === "completed" && isVerificationIncomplete(benefits)) {
    return "incomplete";
  }

  // If failed but has some benefits data -> incomplete (salvageable)
  if (dbStatus === "failed" && benefits) {
    const hasAnyData =
      benefits.eligible != null || benefits.annualMaximum != null;
    if (hasAnyData) return "incomplete";
    return "failed";
  }

  if (dbStatus === "failed") return "failed";

  return "completed";
}
