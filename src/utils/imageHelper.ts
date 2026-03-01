// Helper function to resolve image path
export const getImagePath = (imageName: string | any): string => {

    if (!imageName || typeof imageName !== 'string') return '/no-image.png';

    const cleanName = imageName.trim();

    // ===============================
    // HANDLE FULL URL (ONLINE IMAGE)
    // ===============================
    if (
        cleanName.startsWith('http://') ||
        cleanName.startsWith('https://') ||
        cleanName.startsWith('data:image/')
    ) {

        // Google Drive / Google User Content -> Convert to direct link
        // Matches:
        // - drive.google.com
        // - lh3.googleusercontent.com
        // - doc.google.com
        if (
            cleanName.includes('drive.google.com') ||
            cleanName.includes('googleusercontent.com') ||
            cleanName.includes('docs.google.com')
        ) {

            // Extract ID from any known Google Drive URL pattern
            // Matches 15+ chars of alphanumeric/dashes/underscores (Google Drive IDs vary in length)
            const idMatch = cleanName.match(/[-\w]{15,}/);

            if (idMatch) {
                const id = idMatch[0];
                // Use thumbnail endpoint which is more reliable for embedding
                // sz=w1000 ensures high resolution (width=1000px)
                return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
            }
        }

        // Other online images -> Return as is
        return cleanName;
    }

    // If it's not a URL, return placeholder
    return '/no-image.png';
};
