"use client";

import { useState } from 'react';

export type SeatCategory = 'VIP' | 'Standard';

export interface SeatSelection {
    id: string;
    row: string;
    number: number;
    status: 'available' | 'occupied' | 'selected';
    price: number;
    category: SeatCategory;
    typeLabel: string;
}

type PriceByCategory = Record<SeatCategory, number>;
type LabelByCategory = Record<SeatCategory, string>;

interface SeatMapProps {
    onSelectionChange: (selectedSeats: SeatSelection[]) => void;
    allowedCategories?: SeatCategory[];
    priceByCategory?: Partial<PriceByCategory>;
    labelByCategory?: Partial<LabelByCategory>;
    requireAuth?: boolean;
    onRequireAuth?: () => void;
    bookedSeatIds?: string[]; // Previously booked seats for this event
}

export default function SeatMap({
    onSelectionChange,
    allowedCategories = ['Standard', 'VIP'],
    priceByCategory = {},
    labelByCategory = {},
    requireAuth = false,
    onRequireAuth,
    bookedSeatIds = [],
}: SeatMapProps) {
    // Config
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 16; // Wider map for stadium feel

    const defaultPrice: PriceByCategory = {
        Standard: 120,
        VIP: 250,
    };
    const defaultLabels: LabelByCategory = {
        Standard: 'Standard',
        VIP: 'VIP',
    };

    const resolvedPrice: PriceByCategory = {
        Standard: priceByCategory?.Standard ?? defaultPrice.Standard,
        VIP: priceByCategory?.VIP ?? defaultPrice.VIP,
    };
    const resolvedLabels: LabelByCategory = {
        Standard: labelByCategory?.Standard ?? defaultLabels.Standard,
        VIP: labelByCategory?.VIP ?? defaultLabels.VIP,
    };

    const isAllowed = (category: SeatCategory) => allowedCategories.includes(category);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const getSeat = (row: string, rIndex: number, number: number): SeatSelection => {
        const category: SeatCategory = rIndex < 2 ? 'VIP' : 'Standard';
        const seed = row.charCodeAt(0) + number * 3;
        const isOccupied = seed % 5 === 0 || seed % 13 === 0;
        const id = `${row}${number}`;

        // Check if this seat has been booked before
        const isBooked = bookedSeatIds.includes(id);

        const selected = selectedIds.includes(id);
        const status: SeatSelection['status'] = (isOccupied || isBooked) ? 'occupied' : (selected ? 'selected' : 'available');
        return {
            id,
            row,
            number,
            status,
            price: resolvedPrice[category],
            category,
            typeLabel: resolvedLabels[category],
        };
    };

    const computeSelectedSeats = (ids: string[]): SeatSelection[] => {
        const selected: SeatSelection[] = [];
        rows.forEach((row, rIndex) => {
            for (let i = 1; i <= seatsPerRow; i++) {
                const seat = getSeat(row, rIndex, i);
                if (ids.includes(seat.id) && seat.status === 'selected' && isAllowed(seat.category)) {
                    selected.push(seat);
                }
            }
        });
        return selected;
    };

    const handleSeatClick = (seatId: string) => {
        if (requireAuth) {
            onRequireAuth?.();
            return;
        }

        // SeatId encodes row + number, e.g. A12
        const row = seatId.slice(0, 1);
        const number = Number(seatId.slice(1));
        const rIndex = rows.indexOf(row);
        if (rIndex < 0 || !Number.isFinite(number)) return;

        const seat = getSeat(row, rIndex, number);
        if (seat.status === 'occupied') return;
        if (!isAllowed(seat.category)) return;

        const nextIds = selectedIds.includes(seatId)
            ? selectedIds.filter((id) => id !== seatId)
            : [...selectedIds, seatId];

        setSelectedIds(nextIds);
        onSelectionChange(computeSelectedSeats(nextIds));
    };

    return (
        <div className="seat-map-container fade-in">
            <div className="screen-indicator"></div>
            <p style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '2px' }}>PITCH SIDE</p>

            <div className="seats-grid" style={{ gridTemplateColumns: `repeat(${seatsPerRow}, 1fr)` }}>
                {rows.flatMap((row, rIndex) =>
                    Array.from({ length: seatsPerRow }, (_, idx) => {
                        const seat = getSeat(row, rIndex, idx + 1);
                        const disabled = seat.status === 'occupied' || !isAllowed(seat.category);
                        return (
                            <button
                                key={seat.id}
                                onClick={() => handleSeatClick(seat.id)}
                                disabled={disabled}
                                className={`seat ${seat.status} ${seat.category.toLowerCase()}`}
                                title={
                                    disabled && !isAllowed(seat.category)
                                        ? `${seat.typeLabel} section is not available for this ticket type`
                                        : `Row ${seat.row} Seat ${seat.number} • ${seat.typeLabel} • $${seat.price}`
                                }
                            />
                        );
                    })
                )}
            </div>

            <div className="seat-legend">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <div className="seat available" style={{ width: 16, height: 16, cursor: 'default', background: '#333' }}></div>
                    <span>Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <div className="seat available vip" style={{ width: 16, height: 16, cursor: 'default', background: '#333', border: '1px solid var(--accent)' }}></div>
                    <span>VIP</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <div className="seat selected" style={{ width: 16, height: 16, cursor: 'default', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}></div>
                    <span>Selected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem', color: '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <div className="seat occupied" style={{ width: 16, height: 16, cursor: 'default', background: '#111', border: '1px solid #222' }}></div>
                    <span>Taken</span>
                </div>
            </div>

            <style jsx>{`
        .seat-legend {
            display: flex; 
            gap: 2rem; 
            margin-top: 3rem; 
            flex-wrap: wrap; 
            justify-content: center;
            padding-top: 2rem;
            border-top: 1px solid #222;
            width: 100%;
        }
      `}</style>
        </div>
    );
}
