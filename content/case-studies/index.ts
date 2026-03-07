import type { CaseStudyEntry, CaseStudyMeta } from "@/types/content";

import AITradingDecisionPlatform, {
  meta as aiTradingDecisionPlatformMeta
} from "./ai-trading-decision-platform.mdx";
import CodeVerified, { meta as codeVerifiedMeta } from "./codeverified.mdx";
import UpwardPtAutomation, { meta as upwardPtAutomationMeta } from "./upward-pt-automation.mdx";

export const caseStudies: CaseStudyEntry[] = [
  {
    ...(codeVerifiedMeta as CaseStudyMeta),
    Content: CodeVerified
  },
  {
    ...(aiTradingDecisionPlatformMeta as CaseStudyMeta),
    Content: AITradingDecisionPlatform
  },
  {
    ...(upwardPtAutomationMeta as CaseStudyMeta),
    Content: UpwardPtAutomation
  }
];
