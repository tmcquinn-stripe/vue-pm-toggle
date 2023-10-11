<script setup lang="ts">
import { ref, onMounted, Ref, App, VueElement } from "vue";
import { Appearance, DefaultValuesOption, PaymentIntentResult, Stripe, StripeElements, StripeElementsOptions, StripeElementsOptionsMode, StripePaymentElement, StripePaymentElementOptions, loadStripe } from "@stripe/stripe-js";

import SrMessages from "./SrMessages.vue";

const isLoading: Ref = ref(false);
const messages: Ref = ref([]);

let stripe: Stripe | null;
let elements: StripeElements | undefined;
let paymentElement: StripePaymentElement | undefined | null;
let elementOptions: StripeElementsOptionsMode | undefined;

let currentPM:string;

onMounted(async () => {
  isLoading.value = true
  const { publishableKey } = await fetch("/api/config").then((res) => res.json());
  stripe = await loadStripe(publishableKey, {betas: ["elements_saved_payment_methods_beta_1", "elements_spm_sfu_off_session_override_beta_1"], stripeAccount: 'acct_1LvLhPDrmzPFAfk8'});

  const appearance:Appearance = {
    theme: 'stripe'
  }
  currentPM = "card";

  //console.log(await getCustomerSessionClientSecret())


  elementOptions = {
    appearance: appearance,
    setupFutureUsage: "off_session",
    mode: 'payment',
    amount: 1099,
    currency: "usd",
    paymentMethodTypes: [currentPM],
    loader: 'never',
    // @ts-ignore - customerSessionClientSecret not in public docs
    customerSessionClientSecret: await getCustomerSessionClientSecret()
  }
  
 /* if (backendError) {
    messages.value.push(backendError.message);
  } */
  messages.value.push(`Client secret returned.` );

let test:DefaultValuesOption
  elements = stripe?.elements(elementOptions);
  paymentElement = elements?.create('payment', {
  })

  paymentElement?.mount(`#${currentPM}-payment-element`);
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

  currentPM = currentPM == "link" ? "card" : "link";

  paymentElement?.destroy();
  paymentElement = null;

  elements?.update({
    // @ts-ignore - customerSessionClientSecret not in public docs
    customerSessionClientSecret: currentPM == 'card' ? (await getCustomerSessionClientSecret()) : null,
    //setupFutureUsage: currentPM == 'link' ? 'off_session' : null,
    paymentMethodTypes: [currentPM]
  })


  const local = elements?.create('payment', (currentPM == 'link' ? {
    defaultValues: {
      billingDetails: {
        email: "tmcquinn@stripe.com"
      }
    }
  }: {}));
  paymentElement = local

  paymentElement?.mount(`#${currentPM}-payment-element`);
  isLoading.value = false;
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
      <div v-show="!isLoading && currentPM === 'card'" id="card-payment-element"/>
      <div v-show="!isLoading && currentPM === 'link'" id="link-payment-element" />
      <sr-messages :messages="messages" />
    </form>
  </main>
</template>
