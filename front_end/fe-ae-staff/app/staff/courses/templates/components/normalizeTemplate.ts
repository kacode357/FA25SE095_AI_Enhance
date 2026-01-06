export function normalizeTemplate(item: any) {
    if (!item) return null;

    // If item looks like UploadTemplateResponse
    if (item && (item.originalFileName || item.fileSize !== undefined || item.uploadedAt)) {
        return {
            id: item.id,
            name: item.originalFileName || item.name || "Untitled",
            filename: item.originalFileName || item.filename || item.name,
            size: item.fileSize,
            sizeFormatted: item.fileSizeFormatted,
            uploadedBy: item.uploadedBy,
            uploadedAt: item.uploadedAt,
            updatedAt: item.updatedAt,
            isActive: item.isActive ?? item.is_active ?? false,
            description: item.description,
            type: item.originalFileName ? item.originalFileName.split('.').pop() : (item.type || "doc"),
        };
    }

    // If item is a simple TemplateMetadata shape
    return {
        id: item.id,
        name: item.name || item.filename || "Untitled",
        filename: item.filename || item.name,
        size: item.size,
        sizeFormatted: item.sizeFormatted,
        uploadedBy: item.uploadedBy,
        uploadedAt: item.uploadedAt,
        updatedAt: item.updatedAt,
        isActive: item.isActive ?? item.is_active ?? false,
        description: item.description,
        type: item.filename ? item.filename.split('.').pop() : (item.type || "doc"),
    };
}

export default normalizeTemplate;
