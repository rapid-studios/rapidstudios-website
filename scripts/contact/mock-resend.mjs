export const deliveries = [];
export const outcomes = [];

export function resetSender() {
  deliveries.length = 0;
  outcomes.length = 0;
}

export class Resend {
  emails = {
    async send(message) {
      deliveries.push(message);
      if (!outcomes.length) throw new Error("No mocked email outcome was provided.");
      const outcome = outcomes.shift();
      if (outcome instanceof Error) throw outcome;
      return outcome;
    }
  };
}
