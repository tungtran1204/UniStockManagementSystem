import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Input,
    Textarea,
} from "@material-tailwind/react";

const EditProductTypePopUp = ({ productType, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        typeName: "",
        description: "",
    });

    useEffect(() => {
        if (productType) {
            setFormData({
                typeName: productType.typeName,
                description: productType.description,
            });
        }
    }, [productType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/ProductType/${productType.typeId}`, formData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating product type:", error);
        }
    };

    return (
        <Dialog
            size="xs"
            open={true}
            handler={onClose}
            className="bg-transparent shadow-none"
        >
            <Card className="mx-auto w-full max-w-[24rem]">
                <CardHeader
                    variant="gradient"
                    color="blue"
                    className="mb-4 grid h-28 place-items-center"
                >
                    <Typography variant="h3" color="white">
                        Chỉnh sửa dòng sản phẩm
                    </Typography>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardBody className="flex flex-col gap-4">
                        <Input
                            label="Tên dòng sản phẩm"
                            size="lg"
                            value={formData.typeName}
                            onChange={(e) =>
                                setFormData({ ...formData, typeName: e.target.value })
                            }
                            required
                        />
                        <Textarea
                            label="Mô tả"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </CardBody>
                    <CardFooter className="pt-0 flex gap-2">
                        <Button type="submit" variant="gradient" fullWidth>
                            Cập nhật
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            color="red"
                            onClick={onClose}
                        >
                            Hủy
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </Dialog>
    );
};

export default EditProductTypePopUp;
