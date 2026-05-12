"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, Lock, CreditCard, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = 1 | 2 | 3;

interface AddressForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const COUNTRIES = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Japan"];

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "Shipping" },
    { n: 2, label: "Payment" },
    { n: 3, label: "Review" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                current > s.n
                  ? "bg-emerald-500 text-white"
                  : current === s.n
                  ? "bg-[var(--accent)] text-[var(--bg)]"
                  : "bg-white/5 text-white/30 border border-white/10"
              }`}
            >
              {current > s.n ? <Check className="w-4 h-4" /> : s.n}
            </div>
            <span className={`text-xs ${current >= s.n ? "text-[var(--text)]" : "text-white/30"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 h-px mb-5 mx-2 transition-colors ${
                current > s.n ? "bg-emerald-500" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function AddressFormFields({
  form,
  setForm,
  disabled,
}: {
  form: AddressForm;
  setForm: (f: AddressForm) => void;
  disabled: boolean;
}) {
  const update = (field: keyof AddressForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Full Name *</label>
          <Input value={form.name} onChange={update("name")} placeholder="Jane Doe" required disabled={disabled} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Email *</label>
          <Input type="email" value={form.email} onChange={update("email")} placeholder="jane@example.com" required disabled={disabled} />
        </div>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Phone</label>
        <Input value={form.phone} onChange={update("phone")} placeholder="+1 (555) 000-0000" disabled={disabled} />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Address *</label>
        <Input value={form.address} onChange={update("address")} placeholder="123 Main Street, Apt 4B" required disabled={disabled} />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">City *</label>
          <Input value={form.city} onChange={update("city")} placeholder="San Francisco" required disabled={disabled} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">State / Province</label>
          <Input value={form.state} onChange={update("state")} placeholder="CA" disabled={disabled} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">ZIP / Postal Code *</label>
          <Input value={form.zip} onChange={update("zip")} placeholder="94102" required disabled={disabled} />
        </div>
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Country *</label>
        <select
          value={form.country}
          onChange={update("country")}
          required
          disabled={disabled}
          className="w-full px-4 py-3 bg-transparent border border-[var(--border)] rounded-xl text-sm text-[var(--text)] focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50 appearance-none"
        >
          <option value="" disabled>Select country</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<AddressForm>({
    name: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "", country: "",
  });
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Redirect if cart is empty (after mount)
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.replace("/products");
    }
  }, [items.length, orderPlaced, router]);

  const subtotal = totalPrice();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.0875;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setOrderError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, address, total }),
      });
      if (res.ok) {
        clearCart();
        setOrderPlaced(true);
      } else {
        const data = await res.json();
        setOrderError(data.error || "Failed to place order. Please try again.");
      }
    } catch {
      setOrderError("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Order Placed!</h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Thank you for your order. We&apos;ll send a confirmation to{" "}
            <span className="text-[var(--text)]">{address.email}</span> shortly.
          </p>
          <Button onClick={() => router.push("/products")} className="w-full">
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] px-4 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Checkout</h1>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-white/30">
            <Lock className="w-3.5 h-3.5" />
            Secure Checkout
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <StepIndicator current={step} />

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8"
                >
                  <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>
                  <AddressFormFields form={address} setForm={setAddress} disabled={false} />
                  <div className="mt-8 flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!address.name || !address.email || !address.address || !address.city || !address.zip || !address.country}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8"
                >
                  <h2 className="text-xl font-semibold mb-6">Payment</h2>

                  {/* Stripe placeholder */}
                  <div className="border border-[var(--border)] rounded-xl p-6 mb-6 bg-white/2">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-4 h-4 text-[var(--text-secondary)]" />
                      <span className="text-sm font-medium">Card Details</span>
                      <div className="ml-auto flex gap-1">
                        {["visa", "mc", "amex", "discover"].map((c) => (
                          <div key={c} className="w-8 h-5 rounded bg-white/10 flex items-center justify-center">
                            <span className="text-[8px] uppercase font-bold text-white/50">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Input placeholder="Card number" disabled={placing} />
                      <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="MM / YY" disabled={placing} />
                        <Input placeholder="CVC" disabled={placing} />
                      </div>
                      <Input placeholder="Name on card" disabled={placing} />
                    </div>
                    <p className="text-xs text-white/20 mt-3 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" />
                      Secured by Stripe. Your card details are encrypted.
                    </p>
                  </div>

                  {orderError && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {orderError}
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="secondary" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setStep(3)}>
                      Review Order
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8"
                >
                  <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>

                  {/* Shipping summary */}
                  <div className="border border-[var(--border)] rounded-xl p-5 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">Ship to</span>
                      <button onClick={() => setStep(1)} className="text-xs text-[var(--accent)] hover:underline">
                        Edit
                      </button>
                    </div>
                    <p className="text-sm font-medium">{address.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {address.address}, {address.city}, {address.state} {address.zip}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">{address.country}</p>
                  </div>

                  {/* Items */}
                  <div className="border border-[var(--border)] rounded-xl divide-y divide-[var(--border)] mb-4">
                    {items.map((item) => (
                      <div key={item.id} className="p-4 flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-[var(--text-secondary)]">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {orderError && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {orderError}
                    </div>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="secondary" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button onClick={handlePlaceOrder} disabled={placing} className="min-w-[160px]">
                      {placing ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Placing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Place Order
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 sticky top-6">
              <h3 className="font-semibold mb-5 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Order Summary
              </h3>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--border)] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Tax (8.75%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-[var(--border)]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 100 && (
                <p className="text-xs text-[var(--text-secondary)] mt-3 text-center">
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
