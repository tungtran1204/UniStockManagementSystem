import { useRef, useState } from "react";
import { Button, Typography } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { XCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

const FileUploadBox = ({ files, setFiles, maxFiles = 3 }) => {
    const inputRef = useRef();
    const [previewFile, setPreviewFile] = useState(null);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        if (selected.length + files.length > maxFiles) {
            alert(`Chỉ được tải lên tối đa ${maxFiles} file!`);
            return;
        }
        setFiles([...files, ...selected]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = Array.from(e.dataTransfer.files);
        if (dropped.length + files.length > maxFiles) {
            alert(`Chỉ được tải lên tối đa ${maxFiles} file!`);
            return;
        }
        setFiles([...files, ...dropped]);
    };

    const handleRemove = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const getPreviewType = (file) => {
        if (file.type.startsWith("image/")) return "image";
        if (file.type === "application/pdf") return "pdf";
        return "other";
    };

    const handlePreview = (file) => {
        setPreviewFile(file);
    };

    const handleClosePreview = () => {
        setPreviewFile(null);
    };

    return (
        <div>
            <div
                className="w-full h-28 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray text-sm text-center cursor-pointer hover:border-gray-400 transition"
                onClick={() => inputRef.current.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <p className="mb-1">Kéo thả file vào đây</p>
                <p className="mb-2 text-gray-500">Hoặc</p>
                <Button
                    color="info"
                    size="medium"
                    variant="outlined"
                    sx={{
                        color: "#616161",
                        borderColor: "#9e9e9e",
                        "&:hover": {
                            backgroundColor: "#f5f5f5",
                            borderColor: "#757575",
                        },
                    }}
                >
                    Tải lên từ máy tính
                </Button>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.png,.docx,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Hiển thị danh sách file */}
            {files.length > 0 && (
                <div className="mt-2 text-sm text-gray-800">
                    <Typography variant="body" sx={{ fontWeight: 600 }}>
                        File đã chọn ({files.length}/{maxFiles}):
                    </Typography>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-sm text-gray-700 w-fit">
                        {files.map((file, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                className="flex items-center justify-between border rounded text-xs"
                            >
                                <span className="truncate max-w-[75%]" onClick={() => handlePreview(file)}>{file.name}</span>
                                <XCircleIcon
                                    className="h-5 w-5 text-red-500 hover:text-red-600"
                                    onClick={() => handleRemove(index)}>
                                </XCircleIcon>
                            </Button>
                        ))}
                    </div>
                </div>
            )}
            <Dialog open={!!previewFile} onClose={handleClosePreview} maxWidth="md" fullWidth>
                <div className="flex justify-between items-center mr-6">
                    <DialogTitle>{previewFile?.name}</DialogTitle>
                    <IconButton
                        size="sm"
                        variant="text"
                        onClick={handleClosePreview}
                    >
                        <XMarkIcon className="h-6 w-6 stroke-2" />
                    </IconButton>
                </div>
                <DialogContent dividers>
                    {previewFile && getPreviewType(previewFile) === "image" && (
                        <img
                            src={URL.createObjectURL(previewFile)}
                            alt="preview"
                            className="max-h-[500px] mx-auto"
                        />
                    )}

                    {previewFile && getPreviewType(previewFile) === "pdf" && (
                        <iframe
                            src={URL.createObjectURL(previewFile)}
                            title="PDF Preview"
                            width="100%"
                            height="500px"
                        />
                    )}

                    {previewFile && getPreviewType(previewFile) === "other" && (
                        <Typography>Không hỗ trợ xem trước loại file này.</Typography>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FileUploadBox;
