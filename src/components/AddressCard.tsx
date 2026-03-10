"use client";

import React from "react";
import { MapPin, MoreVertical, Trash2, Edit } from "lucide-react";

interface Address {
    _id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

interface AddressCardProps {
    address: Address;
    onDelete?: (id: string) => void;
    onEdit?: (address: Address) => void;
    onSetDefault?: (id: string) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onDelete, onEdit, onSetDefault }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[160px] relative group transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{address.label || "Home"}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">
                        {address.street},<br />
                        {address.city}, {address.state}<br />
                        {address.postalCode}<br />
                        {address.country}
                    </p>
                </div>

                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit?.(address)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => onDelete?.(address._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {address.isDefault && (
                <div className="mt-4 inline-flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                    Default Address
                </div>
            )}

            {!address.isDefault && (
                <button
                    onClick={() => onSetDefault?.(address._id)}
                    className="mt-4 text-xs font-medium text-blue-600 hover:underline w-fit"
                >
                    Set as Default
                </button>
            )}
        </div>
    );
};

export default AddressCard;
