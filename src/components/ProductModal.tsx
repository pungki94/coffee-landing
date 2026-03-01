import React, { useState, useEffect } from 'react';
import { Product } from '../types/product';
import { getImagePath } from '../utils/imageHelper';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: any) => Promise<void>;
    product?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | string>('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('Single Origin');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setName(product.name);
            setDescription(product.description);
            setPrice(product.price);
            // Only populate image if it's a valid URL or data string (not just a filename)
            // This ensures the input shows the placeholder for products with legacy image strings
            if (product.image && (product.image.startsWith('http') || product.image.startsWith('data:'))) {
                setImage(product.image);
            } else {
                setImage('');
            }
            setCategory(product.category || 'Single Origin');
        } else {
            setName('');
            setDescription('');
            setPrice('');
            setImage('');
            setCategory('Single Origin');
        }
    }, [product, isOpen]);

    // Image compression helper
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                // Compress to JPEG with 0.5 quality to keep payload small for fast upload
                const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
                setImage(dataUrl);
            };
        };
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: any = {
            name,
            description,
            price: Number(price),
            category,
        };

        // Handle image field:
        // - For ADD: Always include image (required for new product)
        // - For EDIT: Only include if user uploaded new image (base64)
        //   If image is just a URL, user didn't change it, so don't send to backend
        if (!product) {
            // Add mode - always include image
            payload.image = image;
        } else {
            // Edit mode - only include if new upload (base64)
            if (image && image.startsWith('data:')) {
                payload.image = image;
            }
            // If image is URL or empty, don't include - keep existing image
        }

        if (product) {
            payload.id = product.id;
        }

        try {
            await onSave(payload);
            onClose();
        } catch (error) {
            console.error("Failed to save product", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Image Preview */}
                        <div className="flex flex-col gap-4">
                            {/* Clickable Image Upload Area */}
                            <div className="relative group">
                                <label
                                    htmlFor="file-upload"
                                    className="aspect-square bg-[#F3F4F6] rounded-xl flex items-center justify-center overflow-hidden relative border-2 border-dashed border-gray-300 hover:border-amber-500 hover:bg-gray-50 cursor-pointer transition w-full"
                                >

                                    {image && (image.startsWith('http') || image.startsWith('data:')) ? (
                                        <>
                                            <img
                                                src={getImagePath(image)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300?text=Invalid+Image+URL')}
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                                                <div className="bg-white/90 px-4 py-2 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition">
                                                    <span className="text-gray-800 font-medium text-sm flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Change Photo
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-gray-400 flex flex-col items-center gap-3 p-4 text-center">
                                            <div className="p-3 bg-white rounded-full shadow-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-600 block">Click to upload</span>
                                                <span className="text-xs text-gray-400">or select from device</span>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                </label>
                            </div>


                        </div>

                        {/* Right Column: Form Fields */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Product Name:</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Arabica Blend"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-gray-700 placeholder-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description:</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the taste and aroma..."
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition resize-none text-gray-700 placeholder-gray-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Price:</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-gray-500 font-medium">$</span>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-gray-700 placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category:</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition bg-white text-gray-700 cursor-pointer"
                                    >
                                        <option value="Single Origin">Single Origin</option>
                                        <option value="Blends">Blends</option>
                                        <option value="Decaf">Decaf</option>
                                    </select>
                                </div>
                            </div>

                            <div className='flex justify-end gap-4 mt-auto pt-6'>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-8 py-3 bg-[#FFFDF5] border border-amber-100 rounded-lg text-[#6F4E37] hover:bg-amber-50 transition font-bold text-sm"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-[#B75C09] text-white rounded-lg hover:bg-[#9A4D07] transition disabled:opacity-50 flex items-center font-bold text-sm shadow-md"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        product ? 'Save Changes' : 'Add Product'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
