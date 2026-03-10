export const getImageUrl = (path) => {
    if (!path) return '';

    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;

    // Normalize path to use forward slashes
    const normalizedPath = path.replace(/\\/g, '/');

    // If it's a local public image (starts with /logo.png, /happycustomers.png etc)
    if (normalizedPath.startsWith('/logo.png') ||
        normalizedPath.startsWith('/happycustomers.png') ||
        normalizedPath.startsWith('/icons/') ||
        normalizedPath.startsWith('/next.svg') ||
        normalizedPath.startsWith('/vercel.svg')) {
        return normalizedPath;
    }

    // Use environment variable if available, otherwise fallback to localhost
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // If path already starts with /, don't add another one
    const separator = normalizedPath.startsWith('/') ? '' : '/';

    return `${baseUrl}${separator}${normalizedPath}`;
};
