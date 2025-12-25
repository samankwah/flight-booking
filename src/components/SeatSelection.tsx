// src/components/SeatSelection.tsx
import React, { useState, useEffect } from 'react';
import { MdAirlineSeatReclineNormal, MdClose } from 'react-icons/md';

export type SeatClass = 'ECONOMY' | 'BUSINESS' | 'FIRST';
export type SeatStatus = 'available' | 'selected' | 'occupied' | 'reserved';

export interface Seat {
  id: string;
  row: number;
  column: string;
  class: SeatClass;
  status: SeatStatus;
  price?: number; // Additional price for premium seats
  features?: string[]; // e.g., ['extra-legroom', 'window', 'aisle']
}

interface SeatSelectionProps {
  flightId: string;
  cabinClass: SeatClass;
  passengers: number;
  onSeatsSelected: (seats: Seat[]) => void;
  onClose?: () => void;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  flightId,
  cabinClass,
  passengers,
  onSeatsSelected,
  onClose,
}) => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate seats based on cabin class
  useEffect(() => {
    // Simulated seat generation (in production, fetch from API)
    const generateSeats = () => {
      const allSeats: Seat[] = [];
      let rows = 0;
      let columns: string[] = [];

      switch (cabinClass) {
        case 'FIRST':
          rows = 4;
          columns = ['A', 'B', 'D', 'E']; // 2-2 configuration
          break;
        case 'BUSINESS':
          rows = 8;
          columns = ['A', 'B', 'C', 'D', 'E', 'F']; // 2-2-2 configuration
          break;
        case 'ECONOMY':
        default:
          rows = 30;
          columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']; // 3-3-3 configuration
          break;
      }

      for (let row = 1; row <= rows; row++) {
        for (const column of columns) {
          const isOccupied = Math.random() < 0.3; // 30% occupied
          const isReserved = Math.random() < 0.1; // 10% reserved
          const isExitRow = row % 10 === 0; // Every 10th row is exit row
          const isWindow = column === 'A' || column === columns[columns.length - 1];
          const isAisle = column === 'C' || column === 'G';

          const features = [];
          if (isExitRow) features.push('extra-legroom');
          if (isWindow) features.push('window');
          if (isAisle) features.push('aisle');

          allSeats.push({
            id: `${row}${column}`,
            row,
            column,
            class: cabinClass,
            status: isOccupied ? 'occupied' : isReserved ? 'reserved' : 'available',
            price: isExitRow ? 25 : 0,
            features,
          });
        }
      }

      setSeats(allSeats);
      setLoading(false);
    };

    generateSeats();
  }, [flightId, cabinClass]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied' || seat.status === 'reserved') {
      return; // Can't select occupied/reserved seats
    }

    const alreadySelected = selectedSeats.find((s) => s.id === seat.id);

    if (alreadySelected) {
      // Deselect
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      // Select if under passenger limit
      if (selectedSeats.length < passengers) {
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        alert(`You can only select ${passengers} seat(s)`);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedSeats.length !== passengers) {
      alert(`Please select exactly ${passengers} seat(s)`);
      return;
    }
    onSeatsSelected(selectedSeats);
  };

  const getSeatColor = (seat: Seat) => {
    const isSelected = selectedSeats.some((s) => s.id === seat.id);

    if (isSelected) return 'bg-cyan-600 text-white';
    if (seat.status === 'occupied') return 'bg-gray-400 text-gray-600 cursor-not-allowed';
    if (seat.status === 'reserved') return 'bg-yellow-200 text-gray-600 cursor-not-allowed';
    if (seat.features?.includes('extra-legroom'))
      return 'bg-green-100 hover:bg-green-200 text-green-800 cursor-pointer';
    return 'bg-gray-100 hover:bg-cyan-100 text-gray-700 cursor-pointer';
  };

  const getTotalExtraPrice = () => {
    return selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  };

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  const getColumns = () => {
    switch (cabinClass) {
      case 'FIRST':
        return ['A', 'B', '', 'D', 'E'];
      case 'BUSINESS':
        return ['A', 'B', '', 'C', 'D', '', 'E', 'F'];
      case 'ECONOMY':
      default:
        return ['A', 'B', 'C', '', 'D', 'E', 'F', '', 'G', 'H', 'I'];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Your Seats</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedSeats.length} of {passengers} seat(s) selected
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <MdClose className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 border rounded flex items-center justify-center">
              <MdAirlineSeatReclineNormal className="w-5 h-5 text-gray-700" />
            </div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-600 border rounded flex items-center justify-center">
              <MdAirlineSeatReclineNormal className="w-5 h-5 text-white" />
            </div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-400 border rounded flex items-center justify-center">
              <MdAirlineSeatReclineNormal className="w-5 h-5 text-gray-600" />
            </div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 border rounded flex items-center justify-center">
              <MdAirlineSeatReclineNormal className="w-5 h-5 text-green-800" />
            </div>
            <span>Extra Legroom (+$25)</span>
          </div>
        </div>

        {/* Seat Map */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Column Headers */}
            <div className="flex justify-center mb-2">
              <div className="flex gap-1">
                {getColumns().map((col, idx) =>
                  col === '' ? (
                    <div key={`space-${idx}`} className="w-8"></div>
                  ) : (
                    <div
                      key={col}
                      className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-gray-600"
                    >
                      {col}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Seats */}
            <div className="space-y-1">
              {Object.keys(seatsByRow)
                .map(Number)
                .sort((a, b) => a - b)
                .map((rowNum) => (
                  <div key={rowNum} className="flex items-center justify-center gap-1">
                    <div className="w-8 text-xs font-semibold text-gray-600 text-right pr-2">
                      {rowNum}
                    </div>
                    <div className="flex gap-1">
                      {getColumns().map((col, idx) => {
                        if (col === '') {
                          return <div key={`space-${idx}`} className="w-8"></div>;
                        }

                        const seat = seatsByRow[rowNum].find((s) => s.column === col);
                        if (!seat) return <div key={col} className="w-8"></div>;

                        return (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            className={`w-8 h-8 rounded border ${getSeatColor(
                              seat
                            )} flex items-center justify-center transition-colors`}
                            title={`${seat.id}${
                              seat.price ? ` (+$${seat.price})` : ''
                            }${seat.features?.join(', ') ? ` - ${seat.features.join(', ')}` : ''}`}
                            disabled={
                              seat.status === 'occupied' || seat.status === 'reserved'
                            }
                          >
                            <MdAirlineSeatReclineNormal className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                    <div className="w-8 text-xs font-semibold text-gray-600 text-left pl-2">
                      {rowNum}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Selected Seats Summary */}
        {selectedSeats.length > 0 && (
          <div className="mt-6 p-4 bg-cyan-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Selected Seats:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <span
                  key={seat.id}
                  className="px-3 py-1 bg-white border border-cyan-300 rounded-full text-sm font-medium text-gray-900"
                >
                  {seat.id}
                  {seat.price ? ` (+$${seat.price})` : ''}
                </span>
              ))}
            </div>
            {getTotalExtraPrice() > 0 && (
              <p className="mt-3 text-sm font-semibold text-gray-900">
                Extra Seat Fees: ${getTotalExtraPrice()}
              </p>
            )}
          </div>
        )}

        {/* Confirm Button */}
        <div className="mt-6">
          <button
            onClick={handleConfirm}
            disabled={selectedSeats.length !== passengers}
            className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Seat Selection
            {selectedSeats.length === passengers && getTotalExtraPrice() > 0 && (
              <span className="ml-2">(+${getTotalExtraPrice()})</span>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            {passengers - selectedSeats.length > 0
              ? `Please select ${passengers - selectedSeats.length} more seat(s)`
              : 'All seats selected'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
