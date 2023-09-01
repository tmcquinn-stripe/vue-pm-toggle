<script setup lang="ts">
import { ref, onMounted, Ref, App } from "vue";
import { Appearance, PaymentIntentResult, Stripe, StripeElements, StripeElementsOptions, StripeElementsOptionsMode, StripePaymentElement, loadStripe } from "@stripe/stripe-js";

import SrMessages from "./SrMessages.vue";

const isLoading: Ref = ref(false);
const messages: Ref = ref([]);

let stripe: Stripe | null;
let elements: StripeElements | undefined;
let paymentElement: StripePaymentElement | undefined;
let elementOptions: StripeElementsOptionsMode | undefined;

let currentPM:string;

onMounted(async () => {
  const { publishableKey } = await fetch("/api/config").then((res) => res.json());
  stripe = await loadStripe(publishableKey, {betas: ["elements_saved_payment_methods_beta_1", "elements_spm_sfu_off_session_override_beta_1"]});

    
  const{ clientSecret, error: backendError } = await getCustomerSessionClientSecret();

  const appearance:Appearance = {
    theme: 'stripe'
  }
  currentPM = "card";

  elementOptions = {
    appearance: appearance,
    setupFutureUsage: null,
    mode: 'payment',
    amount: 1099,
    currency: "usd",
    paymentMethodTypes: [currentPM],
    loader: 'never',
    // @ts-ignore - customerSessionClientSecret not in public docs
    customerSessionClientSecret: clientSecret
  }
  
  if (backendError) {
    messages.value.push(backendError.message);
  }
  messages.value.push(`Client secret returned.`);

  
  elements = stripe?.elements(elementOptions);
  paymentElement = elements?.create('payment');

  paymentElement?.mount("#payment-element");
  isLoading.value = false;
});

const getCustomerSessionClientSecret = async () => {
  const { clientSecret, error: backendError } = await fetch("/api/create-customer-secret").then((res) => res.json());

  if (clientSecret) {
    return clientSecret
  }
  else {
    return backendError
  }
}

const handleSubmit = async () => {
  isLoading.value = true;

  currentPM = currentPM == "card" ? "klarna" : "card";

  paymentElement?.destroy();

  elements?.update({
    // @ts-ignore - customerSessionClientSecret not in public docs
    customerSessionClientSecret: currentPM == 'card' ? (await getCustomerSessionClientSecret()) : null,
    setupFutureUsage: currentPM == 'card' ? 'off_session' : null,
    paymentMethodTypes: [currentPM]
  })


  paymentElement = elements?.create('payment');
  paymentElement?.mount("#payment-element");
}
</script>
<template>
  <main>
    <h1>Payment</h1>

    <p>
      Enable more payment method types
      <a href="https://dashboard.stripe.com/settings/payment_methods" target="_blank">in your dashboard</a>.
    </p>
    <button id="submit" :disabled="isLoading" v-on:click="handleSubmit">
        Toggle PM
      </button>

    <form id="payment-form">
      <div v-show="isLoading" id="loader">
        <img src="shiba-inu.png" style="height: 20px"/>
      </div>
      <div v-show="!isLoading" id="payment-element" />
      <sr-messages :messages="messages" />
    </form>
  </main>
</template>
