import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Falta STRIPE_SECRET_KEY en el entorno");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
