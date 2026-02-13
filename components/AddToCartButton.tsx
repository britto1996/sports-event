'use client';

import { useAppDispatch } from "@/lib/store/hooks";
import { cartItemAdded } from "@/lib/store/cartSlice";

export default function AddToCartButton() {
    const dispatch = useAppDispatch();

    return (
        <button
            className="btn"
            onClick={() => {
                dispatch(
                    cartItemAdded({
                        item: {
                            id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
                            title: "Ticket",
                            quantity: 1,
                        },
                    })
                );
                // Simulate a checkout process or modal
                const confirm = window.confirm('Ticket selected! Proceed to simulated payment?');
                if (confirm) {
                    alert('Payment Successful! Your QR Code has been generated.');
                }
            }}
            style={{ marginTop: '0.5rem', fontSize: '0.8rem', width: '100%' }}>
            Select Ticket
        </button>
    );
}
