export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}

/** 预设合同模板 */
export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "wedding",
    name: "Wedding Photography",
    description: "Full wedding day coverage contract",
    content: `PHOTOGRAPHY SERVICES AGREEMENT

This agreement is between {{studio_name}} ("Photographer") and {{client_name}} ("Client") for photography services on {{event_date}}.

1. SERVICES
Photographer agrees to provide wedding photography coverage for up to 8 hours at {{event_location}}.

2. DELIVERABLES
Client will receive a minimum of 400 professionally edited high-resolution digital images via online gallery within 6 weeks of the event date.

3. PAYMENT
Total fee: {{amount}}. A non-refundable deposit of 50% ({{deposit}}) is due upon signing. The remaining balance is due 7 days before the event.

4. CANCELLATION
Client may cancel this agreement with written notice. The deposit is non-refundable. Cancellations within 30 days of the event require full payment.

5. IMAGE RIGHTS
Photographer retains copyright. Client receives personal use license. Photographer may use images for portfolio and marketing.

6. FORCE MAJEURE
Neither party shall be liable for failure to perform due to circumstances beyond reasonable control.

By signing below, both parties agree to the terms of this agreement.`,
  },
  {
    id: "portrait",
    name: "Portrait Session",
    description: "Family, engagement, or individual portrait session",
    content: `PORTRAIT PHOTOGRAPHY AGREEMENT

This agreement is between {{studio_name}} ("Photographer") and {{client_name}} ("Client").

1. SESSION
Photographer will provide a portrait session of up to 2 hours at {{event_location}} on {{event_date}}.

2. DELIVERABLES
Client will receive a minimum of 50 professionally edited digital images via online gallery within 2 weeks.

3. PAYMENT
Total fee: {{amount}}. Full payment is due at the time of booking.

4. RESCHEDULING
Client may reschedule once with 48 hours notice at no additional charge.

5. IMAGE RIGHTS
Photographer retains copyright. Client receives personal use license.

By signing below, both parties agree to the terms of this agreement.`,
  },
  {
    id: "general",
    name: "General Photography",
    description: "Flexible contract for any photography service",
    content: `PHOTOGRAPHY SERVICES AGREEMENT

This agreement is between {{studio_name}} ("Photographer") and {{client_name}} ("Client") for photography services.

1. SERVICES
Photographer agrees to provide photography services as described in the attached proposal.

2. DELIVERABLES
Client will receive professionally edited digital images via online gallery.

3. PAYMENT
Total fee: {{amount}}. A deposit of {{deposit}} is due upon signing. The remaining balance is due before delivery of final images.

4. CANCELLATION
Cancellations must be made in writing. Deposits are non-refundable.

5. IMAGE RIGHTS
Photographer retains copyright. Client receives personal use license.

By signing below, both parties agree to the terms of this agreement.`,
  },
];

/**
 * 替换合同模板中的变量
 */
export function renderContract(
  template: string,
  variables: {
    client_name?: string;
    studio_name?: string;
    event_date?: string;
    event_location?: string;
    amount?: string;
    deposit?: string;
  }
): string {
  let result = template;
  result = result.replace(/\{\{client_name\}\}/g, variables.client_name || "[Client Name]");
  result = result.replace(/\{\{studio_name\}\}/g, variables.studio_name || "[Studio Name]");
  result = result.replace(/\{\{event_date\}\}/g, variables.event_date || "[Date]");
  result = result.replace(/\{\{event_location\}\}/g, variables.event_location || "[Location]");
  result = result.replace(/\{\{amount\}\}/g, variables.amount || "[Amount]");
  result = result.replace(/\{\{deposit\}\}/g, variables.deposit || "[Deposit]");
  return result;
}
